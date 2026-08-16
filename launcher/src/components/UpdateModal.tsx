import React from 'react';
import { UpdateCheckResult } from '../types/version';
import { Download, CheckCircle, X } from 'lucide-react';

interface UpdateModalProps {
  updateInfo: UpdateCheckResult;
  onClose: () => void;
  onApplyUpdate: () => void;
}

export const UpdateModal: React.FC<UpdateModalProps> = ({ updateInfo, onClose, onApplyUpdate }) => {
  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 100 }} className="flex items-center justify-center p-6">
      <div
        style={{
          width: '500px',
          backgroundColor: '#101620',
          border: '1px solid #00f0ff',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 0 30px rgba(0, 240, 255, 0.3)',
        }}
        className="flex flex-col gap-4 text-left"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Download size={20} style={{ color: '#00f0ff' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff' }}>Update Available!</h3>
          </div>
          <button onClick={onClose} style={{ color: '#8fa2b7' }} className="hover:text-white cursor-pointer">
            <X size={20} />
          </button>
        </div>

        <div style={{ fontSize: '13px', color: '#8fa2b7' }}>
          A new version of Samrat Client (<span style={{ color: '#00f0ff', fontWeight: 700 }}>v{updateInfo.latest_version}</span>) is ready to install.
        </div>

        <div style={{ backgroundColor: '#0c1017', border: '1px solid #222e3f', borderRadius: '8px', padding: '12px', maxHeight: '150px', overflowY: 'auto' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#8fa2b7', marginBottom: '6px' }} className="uppercase">Changelog:</div>
          <ul style={{ fontSize: '12px', color: '#ffffff', gap: '4px' }} className="flex flex-col list-disc list-inside">
            {updateInfo.changelog.map((log, index) => (
              <li key={index}>{log}</li>
            ))}
          </ul>
        </div>

        <div className="flex items-center justify-end gap-3 mt-2">
          <button
            onClick={onClose}
            style={{ backgroundColor: '#1c2433', color: '#ffffff', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 600 }}
            className="hover:bg-surface-active cursor-pointer"
          >
            Later
          </button>
          <button
            onClick={onApplyUpdate}
            style={{ backgroundColor: '#00f0ff', color: '#0c1017', padding: '8px 20px', borderRadius: '6px', fontSize: '13px', fontWeight: 800 }}
            className="flex items-center gap-2 hover:opacity-90 cursor-pointer glow-cyan"
          >
            <CheckCircle size={16} />
            <span>Update Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};
