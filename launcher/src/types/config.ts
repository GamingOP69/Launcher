export interface LauncherConfig {
  schemaVersion: number;
  selectedAccountId?: string;
  selectedProfileId: string;
  allocatedRamMb: number;
  javaPath: string;
  customJvmArgs: string;
  closeLauncherOnGameStart: boolean;
  enableHardwareAcceleration: boolean;
  autoCheckUpdates: boolean;
  releaseChannel: 'stable' | 'beta' | 'nightly';
  gameResolutionWidth: number;
  gameResolutionHeight: number;
}

export const DEFAULT_LAUNCHER_CONFIG: LauncherConfig = {
  schemaVersion: 1,
  selectedProfileId: 'Default',
  allocatedRamMb: 3072,
  javaPath: '',
  customJvmArgs: '-XX:+UseG1GC -XX:+UnlockExperimentalVMOptions -XX:G1NewSizePercent=20 -XX:G1ReservePercent=20 -XX:MaxGCPauseMillis=50 -XX:G1HeapRegionSize=32M',
  closeLauncherOnGameStart: true,
  enableHardwareAcceleration: true,
  autoCheckUpdates: true,
  releaseChannel: 'stable',
  gameResolutionWidth: 1920,
  gameResolutionHeight: 1080,
};
