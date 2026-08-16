import React, { useState } from 'react';
import { AuthAccount } from '../types/account';
import { AccountCard } from '../components/AccountCard';
import { invokeCommand } from '../services/tauriBridge';
import { UserPlus, UserCheck, ShieldCheck, CheckCircle2, Sparkles, Trash2 } from 'lucide-react';

interface AccountsPageProps {
  accounts: AuthAccount[];
  activeAccountId?: string;
  onSetActive: (id: string) => void;
  onRemove: (id: string) => void;
  onRefreshAccounts: () => void;
}

export const AccountsPage: React.FC<AccountsPageProps> = ({
  accounts,
  activeAccountId,
  onSetActive,
  onRemove,
  onRefreshAccounts,
}) => {
  const [usernameInput, setUsernameInput] = useState('');
  const [skinType, setSkinType] = useState<'custom' | 'steve' | 'alex'>('custom');
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = usernameInput.trim();
    if (!cleanUser) return;

    try {
      const account = await invokeCommand<AuthAccount>('add_offline_account', {
        username: cleanUser,
        skinType: skinType,
      });

      onRefreshAccounts();
      onSetActive(account.id);
      setUsernameInput('');
      setFeedback(`Added player "${account.username}" and set as active profile.`);
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFeedback(`Failed to add account: ${err?.toString() || 'Unknown error'}`);
    }
  };

  const previewAvatarUrl = skinType === 'alex'
    ? 'https://mc-heads.net/avatar/MHF_Alex/100'
    : skinType === 'steve'
    ? 'https://mc-heads.net/avatar/MHF_Steve/100'
    : usernameInput.trim()
    ? `https://mc-heads.net/avatar/${usernameInput.trim()}/100`
    : 'https://mc-heads.net/avatar/Steve/100';

  return (
    <div className="flex-1 flex flex-col p-6 gap-6 overflow-y-auto text-left w-full">
      {/* Page Title */}
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-black text-white tracking-wide flex items-center gap-2">
          <UserCheck size={20} className="text-cyan-400" />
          <span>OFFLINE PLAYER ACCOUNTS</span>
        </h2>
        <p className="text-xs text-slate-400">
          Manage local player usernames, offline profiles, and skins for Minecraft 1.8.9.
        </p>
      </div>

      {feedback && (
        <div className="bg-cyan-950/40 border border-cyan-500/50 p-3 rounded-xl text-xs text-cyan-200 flex items-center gap-2">
          <CheckCircle2 size={14} className="text-cyan-400 flex-shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Account Creator Card */}
      <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl flex flex-col gap-4 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <UserPlus size={16} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Create Local Player Profile</h3>
            <span className="text-[11px] text-slate-400">Enter your in-game username to play instantly</span>
          </div>
        </div>

        <form onSubmit={handleAddAccount} className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            {/* Live Avatar Preview */}
            <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
              <img
                src={previewAvatarUrl}
                alt="Preview"
                className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-700 object-cover shadow-sm"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://mc-heads.net/avatar/Steve/100';
                }}
              />
              <span className="text-[9px] text-slate-400 font-mono">Skin Preview</span>
            </div>

            {/* Username Input & Skin Type */}
            <div className="flex-1 flex flex-col gap-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter Minecraft Username (e.g. Samrat, PvPGod)"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 focus:border-cyan-500/60 text-white px-3.5 py-2.5 rounded-xl text-xs font-semibold outline-none transition-colors"
                  maxLength={16}
                  required
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 shadow-md shadow-cyan-500/20 transition-all duration-150 cursor-pointer flex-shrink-0"
                >
                  Add Player
                </button>
              </div>

              {/* Skin Preference Selector */}
              <div className="flex items-center gap-3 text-xs">
                <span className="text-slate-400 text-[11px] font-medium">Avatar Mode:</span>
                <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                  <input
                    type="radio"
                    name="skinType"
                    checked={skinType === 'custom'}
                    onChange={() => setSkinType('custom')}
                    className="accent-cyan-400"
                  />
                  <span>Username Skin</span>
                </label>
                <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                  <input
                    type="radio"
                    name="skinType"
                    checked={skinType === 'steve'}
                    onChange={() => setSkinType('steve')}
                    className="accent-cyan-400"
                  />
                  <span>Steve</span>
                </label>
                <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                  <input
                    type="radio"
                    name="skinType"
                    checked={skinType === 'alex'}
                    onChange={() => setSkinType('alex')}
                    className="accent-cyan-400"
                  />
                  <span>Alex</span>
                </label>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Saved Accounts List */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">
            Active & Saved Players ({accounts.length})
          </h3>
          <span className="text-[11px] text-slate-400 font-medium">Click "Select" to switch player</span>
        </div>

        <div className="flex flex-col gap-2.5">
          {accounts.map((acc) => (
            <AccountCard
              key={acc.id}
              account={acc}
              isActive={acc.id === activeAccountId}
              onSetActive={onSetActive}
              onRemove={onRemove}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
