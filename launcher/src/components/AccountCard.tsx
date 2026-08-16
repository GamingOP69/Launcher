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
      className={`p-4 rounded-xl flex items-center justify-between transition-all duration-150 border ${
        isActive 
          ? 'bg-slate-900 border-cyan-500/50 shadow-md shadow-cyan-500/10' 
          : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800/80 hover:border-slate-700'
      }`}
    >
      <div className="flex items-center gap-3.5">
        <img
          src={account.avatar_url}
          alt={account.username}
          className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 object-cover shadow-sm"
        />
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white">{account.username}</span>
            {account.is_dev_mode && (
              <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 font-black px-1.5 py-0.5 rounded">
                DEV SANDBOX
              </span>
            )}
            {isActive && (
              <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                <CheckCircle2 size={11} /> Active
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-400 font-mono tracking-tight">{account.uuid}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {!isActive && (
          <button
            onClick={() => onSetActive(account.id)}
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-cyan-500/40 transition-colors cursor-pointer"
          >
            Select
          </button>
        )}
        <button
          onClick={() => onRemove(account.id)}
          className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
          title="Remove Account"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
};
