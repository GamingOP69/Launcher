import React from 'react';
import { AuthAccount } from '../types/account';
import { Trash2, CheckCircle2 } from 'lucide-react';

interface AccountCardProps {
  account: AuthAccount;
  isActive: boolean;
  onSetActive: (id: string) => void;
  onRemove: (id: string) => void;
}

export const AccountCard: React.FC<AccountCardProps> = ({ account, isActive, onSetActive, onRemove }) => {
  return (
    <div
      style={{
        backgroundColor: isActive ? '#1c2433' : '#141a24',
        border: isActive ? '1px solid #00f0ff' : '1px solid #222e3f',
        padding: '14px 18px',
        borderRadius: '10px',
      }}
      className="flex items-center justify-between transition-all"
    >
      <div className="flex items-center gap-3">
        <img
          src={account.avatar_url}
          alt={account.username}
          style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#0c1017' }}
        />
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-2">
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>{account.username}</span>
            {account.is_dev_mode && (
              <span style={{ fontSize: '9px', backgroundColor: '#ffab00', color: '#000', fontWeight: 700, padding: '1px 5px', borderRadius: '4px' }}>
                DEV SANDBOX
              </span>
            )}
            {isActive && (
              <span style={{ fontSize: '10px', color: '#00e676' }} className="flex items-center gap-1">
                <CheckCircle2 size={12} /> Active
              </span>
            )}
          </div>
          <span style={{ fontSize: '11px', color: '#586b7f' }} className="font-mono">{account.uuid}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {!isActive && (
          <button
            onClick={() => onSetActive(account.id)}
            style={{ backgroundColor: '#242e40', color: '#ffffff', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}
            className="hover:bg-surface-hover cursor-pointer"
          >
            Select
          </button>
        )}
        <button
          onClick={() => onRemove(account.id)}
          style={{ color: '#ff1744', padding: '6px', borderRadius: '6px' }}
          className="hover:bg-surface-hover cursor-pointer"
          title="Remove Account"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};
