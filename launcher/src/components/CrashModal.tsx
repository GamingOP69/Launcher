import React from 'react';
import { AlertTriangle, Copy, Check, X } from 'lucide-react';

interface CrashModalProps {
  crashLog: string;
  onClose: () => void;
}

export const CrashModal: React.FC<CrashModalProps> = ({ crashLog, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(crashLog);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-6 z-50 select-none">
      <div className="bg-[#121622] border border-rose-500/30 rounded-2xl p-6 max-w-lg w-full flex flex-col gap-3.5 shadow-2xl text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle size={20} className="text-rose-400" />
            <h3 className="text-sm font-bold text-white">Client Launch / Runtime Error</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <p className="text-xs text-gray-400 leading-relaxed">
          The game process could not be launched or terminated unexpectedly. Diagnostic output is
          shown below:
        </p>

        <pre className="bg-[#090b10] border border-white/[0.06] rounded-xl p-3 text-[11px] font-mono text-rose-300 max-h-48 overflow-y-auto select-text">
          {crashLog}
        </pre>

        <div className="flex items-center justify-between mt-1">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-300 bg-[#181d2c] hover:bg-[#20273a] hover:text-white transition-colors cursor-pointer border border-white/[0.06]"
          >
            {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            <span>{copied ? 'Copied' : 'Copy Log'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
