import React, { useState, useEffect } from 'react';
import { Tag, Clock, FolderOpen, CheckCircle2, Download, RefreshCw, AlertCircle } from 'lucide-react';
import { invokeCommand, listenEvent } from '../services/tauriBridge';

export const VersionsPage: React.FC = () => {
  const [installStatus, setInstallStatus] = useState<{
    installed: boolean;
    jar_path: string;
    jar_size_bytes: number;
  } | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const checkStatus = () => {
    invokeCommand<{ installed: boolean; jar_path: string; jar_size_bytes: number }>(
      'check_client_installed'
    )
      .then(setInstallStatus)
      .catch(console.warn);
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const handleDownload = async () => {
    setDownloading(true);
    setProgress(10);
    setErrorMsg(null);

    const unlisten = await listenEvent<{ stage: string; percent: number }>(
      'install_progress',
      ({ percent }) => setProgress(percent)
    );

    try {
      await invokeCommand('download_client');
      setProgress(100);
      checkStatus();
    } catch (e: any) {
      setErrorMsg(e?.toString() || 'Download failed.');
    } finally {
      setDownloading(false);
      unlisten();
    }
  };

  const handleOpenFolder = () => {
    invokeCommand('open_folder', { folderType: 'game' }).catch(console.warn);
  };

  const formatBytes = (bytes: number) => {
    if (!bytes) return '0 KB';
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="flex-1 flex flex-col p-6 gap-5 overflow-y-auto text-left w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold text-white tracking-wide">CLIENT VERSIONS & BUILDS</h2>
          <p className="text-xs text-gray-400">
            Inspect installed client JARs, runtime target versions, and download builds.
          </p>
        </div>

        <button
          onClick={handleOpenFolder}
          className="flex items-center gap-2 py-2 px-3.5 rounded-lg text-xs font-semibold text-gray-300 bg-[#141824] border border-white/[0.08] hover:border-cyan-500/40 hover:text-white transition-colors cursor-pointer"
        >
          <FolderOpen size={14} className="text-cyan-400" />
          <span>Open Game Folder</span>
        </button>
      </div>

      {/* Active Version Card */}
      <div className="bg-[#121622] border border-white/[0.08] p-5 rounded-2xl flex flex-col gap-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Tag size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Samrat Client 1.8.9 Release</h3>
                <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
                  v1.0.0
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                <Clock size={12} />
                <span>Production Stable Build</span>
                <span>•</span>
                <span>Target: Minecraft 1.8.9 (Java 8/17/21 Bytecode)</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {installStatus?.installed ? (
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
                <CheckCircle2 size={13} /> Installed
              </span>
            ) : (
              <span className="text-xs font-semibold text-amber-400 flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg">
                <AlertCircle size={13} /> Not Downloaded
              </span>
            )}
          </div>
        </div>

        {/* Technical specs */}
        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-white/[0.06] text-xs">
          <div className="flex flex-col gap-0.5">
            <span className="text-gray-500 text-[10px] uppercase font-semibold">Bootstrap Class</span>
            <span className="font-mono text-gray-300">com.samrat.SamratClient</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-gray-500 text-[10px] uppercase font-semibold">JAR File Size</span>
            <span className="font-mono text-gray-300">
              {installStatus?.installed ? formatBytes(installStatus.jar_size_bytes) : 'N/A'}
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-gray-500 text-[10px] uppercase font-semibold">Anti-Cheat Mode</span>
            <span className="text-emerald-400 font-semibold">Strict Legitimate</span>
          </div>
        </div>

        {/* Download / Reinstall Action */}
        <div className="pt-2 flex items-center justify-between border-t border-white/[0.06]">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-gray-300">Client Installation</span>
            <span className="text-[11px] text-gray-500">
              {installStatus?.installed
                ? `Location: ${installStatus.jar_path}`
                : 'Download the client JAR from the official release.'}
            </span>
            {errorMsg && <span className="text-xs text-rose-400 mt-1">{errorMsg}</span>}
          </div>

          {downloading ? (
            <div className="flex items-center gap-2">
              <div className="w-32 h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-400 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs font-mono text-gray-400">{progress}%</span>
            </div>
          ) : (
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-black bg-cyan-400 hover:bg-cyan-300 transition-colors cursor-pointer"
            >
              <Download size={14} />
              <span>{installStatus?.installed ? 'Reinstall Client' : 'Download Client'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
