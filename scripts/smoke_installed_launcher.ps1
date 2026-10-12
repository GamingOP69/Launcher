param(
  [Parameter(Mandatory = $true)][string]$InstallerPath,
  [Parameter(Mandatory = $true)][string]$InstallRoot,
  [Parameter(Mandatory = $true)][string]$EvidenceDirectory
)

$ErrorActionPreference = 'Stop'
$marker = Join-Path $env:USERPROFILE '.samrat\ci-smoke-result.json'
$smokeLog = Join-Path $env:USERPROFILE '.samrat\logs\ci-game-smoke.log'
$env:SAMRAT_CI_GAME_SMOKE = '1'
$env:SAMRAT_FORGE_MOD_JAR = Join-Path $InstallRoot 'samrat-forge-1.8.9.jar'
$smokeLauncher = $null
$gamePid = 0
$uninstaller = $null

try {
  if (-not (Test-Path -LiteralPath $InstallerPath -PathType Leaf)) {
    throw "Release installer not found: $InstallerPath"
  }
  if (Test-Path -LiteralPath $InstallRoot) {
    Remove-Item -LiteralPath $InstallRoot -Recurse -Force
  }
  $install = Start-Process -FilePath $InstallerPath -ArgumentList @('/S', "/D=$InstallRoot") -Wait -PassThru
  if ($install.ExitCode -ne 0) { throw "NSIS installer failed with exit code $($install.ExitCode)." }

  $app = Get-ChildItem -LiteralPath $InstallRoot -Filter '*.exe' -File -Recurse |
    Where-Object { $_.Name -notmatch '(?i)uninstall' } | Select-Object -First 1
  if ($null -eq $app) { throw 'Installed launcher executable was not found.' }
  New-Item -ItemType Directory -Path $EvidenceDirectory -Force | Out-Null
  $installedFiles = @(Get-ChildItem -LiteralPath $InstallRoot -File -Recurse -Force -ErrorAction SilentlyContinue |
    ForEach-Object { $_.FullName })
  Set-Content -LiteralPath (Join-Path $EvidenceDirectory 'installed-files.txt') -Value $installedFiles
  if (-not (Test-Path -LiteralPath $env:SAMRAT_FORGE_MOD_JAR -PathType Leaf)) {
    $forgeCandidates = @($installedFiles | Where-Object { $_ -match '(?i)samrat-forge-1\.8\.9\.jar$' })
    $candidateList = if ($forgeCandidates.Count -eq 0) { 'no matching Forge mod file found in the install tree' } else { $forgeCandidates -join '; ' }
    throw "Installed Forge mod resource was not found at the expected path '$($env:SAMRAT_FORGE_MOD_JAR)'; $candidateList. Full install inventory was saved as installed-files.txt."
  }

  $interactive = Start-Process -FilePath $app.FullName -PassThru
  Start-Sleep -Seconds 8
  $interactive.Refresh()
  if ($interactive.HasExited) {
    throw "Installed launcher exited during normal UI startup (code $($interactive.ExitCode))."
  }
  Stop-Process -Id $interactive.Id -Force

  if (Test-Path -LiteralPath $marker) { Remove-Item -LiteralPath $marker -Force }
  if (Test-Path -LiteralPath $smokeLog) { Remove-Item -LiteralPath $smokeLog -Force }
  $smokeLauncher = Start-Process -FilePath $app.FullName -ArgumentList @('--ci-minecraft-smoke') -PassThru
  $deadline = (Get-Date).AddMinutes(12)
  $smoke = $null
  while ((Get-Date) -lt $deadline) {
    if (Test-Path -LiteralPath $marker) {
      try { $smoke = Get-Content -LiteralPath $marker -Raw | ConvertFrom-Json } catch {}
      if ($null -ne $smoke) { break }
    }
    $smokeLauncher.Refresh()
    if ($smokeLauncher.HasExited -and -not (Test-Path -LiteralPath $marker)) {
      throw "Packaged launcher exited before starting Minecraft (code $($smokeLauncher.ExitCode))."
    }
    Start-Sleep -Seconds 2
  }
  if ($null -eq $smoke -or $smoke.status -ne 'process_started') {
    throw "Packaged launcher did not start Minecraft. Result: $($smoke | ConvertTo-Json -Compress)"
  }

  $gamePid = [int]$smoke.pid
  $gameWindowSeen = $false
  $gameCommandLine = $null
  $gameDeadline = (Get-Date).AddSeconds(75)
  while ((Get-Date) -lt $gameDeadline) {
    $game = Get-CimInstance Win32_Process -Filter "ProcessId=$gamePid" -ErrorAction SilentlyContinue
    if ($null -eq $game) { throw 'Minecraft Java process exited before the game window appeared.' }
    $gameCommandLine = $game.CommandLine
    if ($gameCommandLine -notmatch 'net\.minecraft\.launchwrapper\.Launch' -or
        $gameCommandLine -notmatch 'net\.minecraftforge\.fml\.common\.launcher\.FMLTweaker') {
      throw "Started Java process is not the expected Forge runtime: $gameCommandLine"
    }
    $window = Get-Process -Id $gamePid -ErrorAction SilentlyContinue
    if ($null -ne $window -and $window.MainWindowTitle -match 'Minecraft') {
      $gameWindowSeen = $true
      break
    }
    Start-Sleep -Seconds 2
  }
  if (-not $gameWindowSeen) { throw "Minecraft game window was not observed. Command line: $gameCommandLine" }
  Write-Host "SAMRAT_FORGE_MINECRAFT_WINDOW_REACHED pid=$gamePid title=$($window.MainWindowTitle)"

  $menuDeadline = (Get-Date).AddSeconds(30)
  do {
    $logText = if (Test-Path -LiteralPath $smokeLog) { Get-Content -LiteralPath $smokeLog -Raw } else { '' }
    if ($logText.Contains('SAMRAT_FORGE_INITIALIZED') -and $logText.Contains('SAMRAT_MINECRAFT_MAIN_MENU_REACHED')) { break }
    Start-Sleep -Seconds 2
  } while ((Get-Date) -lt $menuDeadline)
  if (-not $logText.Contains('SAMRAT_FORGE_INITIALIZED') -or -not $logText.Contains('SAMRAT_MINECRAFT_MAIN_MENU_REACHED')) {
    throw "Release package did not reach the main menu with the mod initialized. Log: $logText"
  }
  Write-Host 'SAMRAT_RELEASE_PACKAGE_MAIN_MENU_AND_MOD_INITIALIZED'

  Wait-Process -Id $smokeLauncher.Id -Timeout 120 -ErrorAction SilentlyContinue
  $smokeLauncher.Refresh()
  if (-not $smokeLauncher.HasExited -or $smokeLauncher.ExitCode -ne 0) {
    throw 'Launcher did not complete its bounded game-process smoke successfully.'
  }
  $smoke = Get-Content -LiteralPath $marker -Raw | ConvertFrom-Json
  if ($smoke.status -ne 'process_survived_smoke_window') {
    throw "Game process failed bounded survival check: $($smoke | ConvertTo-Json -Compress)"
  }
  if ($null -ne (Get-Process -Id $gamePid -ErrorAction SilentlyContinue)) {
    throw 'Launcher failed to terminate the Minecraft child process.'
  }
  Write-Host 'SAMRAT_RELEASE_PACKAGE_SMOKE_PASSED'
}
finally {
  New-Item -ItemType Directory -Path $EvidenceDirectory -Force | Out-Null
  foreach ($evidence in @($marker, $smokeLog)) {
    if (Test-Path -LiteralPath $evidence -PathType Leaf) {
      Copy-Item -LiteralPath $evidence -Destination $EvidenceDirectory -Force
    }
  }
  if ($gamePid -gt 0 -and $null -ne (Get-Process -Id $gamePid -ErrorAction SilentlyContinue)) {
    Stop-Process -Id $gamePid -Force -ErrorAction SilentlyContinue
  }
  if ($null -ne $smokeLauncher) {
    $smokeLauncher.Refresh()
    if (-not $smokeLauncher.HasExited) { Stop-Process -Id $smokeLauncher.Id -Force -ErrorAction SilentlyContinue }
  }
  $uninstaller = Get-ChildItem -LiteralPath $InstallRoot -Filter 'uninstall.exe' -File -Recurse -ErrorAction SilentlyContinue |
    Select-Object -First 1
  if ($null -ne $uninstaller) {
    $remove = Start-Process -FilePath $uninstaller.FullName -ArgumentList '/S' -Wait -PassThru
    if ($remove.ExitCode -ne 0) { throw "NSIS uninstaller failed with exit code $($remove.ExitCode)." }
  }
}
