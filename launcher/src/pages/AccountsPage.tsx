import React, { useState } from 'react';
import { AuthAccount } from '../types/account';
import { invokeCommand } from '../services/tauriBridge';
import { UserPlus, UserCheck, CheckCircle2, Trash2, Check } from 'lucide-react';
import { PlayerAvatar } from '../components/PlayerAvatar';

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
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = usernameInput.trim();
    if (!cleanUser) return;

    try {
      const account = await invokeCommand<AuthAccount>('add_offline_account', {
        username: cleanUser,
      });

      onRefreshAccounts();
      onSetActive(account.id);
      setUsernameInput('');
      setFeedback(`Added player "${account.username}" and set as active.`);
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFeedback(`Failed to add account: ${err?.toString() || 'Unknown error'}`);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-6 gap-5 overflow-y-auto text-left w-full">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold text-white tracking-wide">OFFLINE PLAYER ACCOUNTS</h2>
        <p className="text-xs text-gray-400">
          Local profiles are for offline-mode play only. They do not authenticate a Minecraft account and cannot join Hypixel or other online-mode servers.
        </p>
      </div>

      {feedback && (
        <div className="bg-cyan-500/10 border border-cyan-500/30 p-3 rounded-xl text-xs text-cyan-200 flex items-center gap-2">
          <CheckCircle2 size={14} className="text-cyan-400 flex-shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Account Creator Card */}
      <div className="bg-[#121622] border border-white/[0.08] p-5 rounded-2xl flex flex-col gap-4 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <UserPlus size={15} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white">Add Local Player</h3>
            <span className="text-[11px] text-gray-400">
              Enter your desired in-game player name
            </span>
          </div>
        </div>

        <form onSubmit={handleAddAccount} className="flex flex-col gap-3.5">
          <div className="flex items-center gap-4">
            {/* Local initial preview; no profile name is sent to a remote avatar service. */}
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <PlayerAvatar username={usernameInput} className="w-11 h-11 rounded-lg bg-cyan-500/15 border border-cyan-500/20 text-cyan-200 text-lg font-bold" />
              <span className="text-[9px] text-gray-500 font-mono">Local avatar</span>
            </div>

          {/* Username input */}
            <div className="flex-1 flex flex-col gap-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Player Username (e.g. Samrat, PvPGod)"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="flex-1 bg-[#0d1017] border border-white/[0.08] focus:border-cyan-500/40 text-white px-3 py-2 rounded-lg text-xs font-medium outline-none"
                  maxLength={16}
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-bold text-black bg-cyan-400 hover:bg-cyan-300 transition-colors cursor-pointer flex-shrink-0"
                >
                  Add Player
                </button>
              </div>

            </div>
          </div>
        </form>
      </div>

      {/* Saved Accounts List */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Saved Player Profiles ({accounts.length})
          </h3>
          <span className="text-[11px] text-gray-500">Click "Select" to switch player</span>
        </div>

        <div className="flex flex-col gap-2">
          {accounts.map((acc) => {
            const isActive = acc.id === activeAccountId;
            return (
              <div
                key={acc.id}
                className={`p-3.5 rounded-xl flex items-center justify-between transition-all border ${
                  isActive
                    ? 'bg-[#141824] border-cyan-500/40 shadow-sm'
                    : 'bg-[#10141f] hover:bg-[#141824] border-white/[0.06]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <PlayerAvatar username={acc.username} className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/20 text-cyan-200 text-xs font-bold" />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white">{acc.username}</span>
                    <span className="text-[10px] text-gray-500 font-mono">
                      Offline UUID: {acc.uuid?.substring(0, 18)}...
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isActive ? (
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
                      <Check size={13} /> Active
                    </span>
                  ) : (
                    <button
                      onClick={() => onSetActive(acc.id)}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-gray-300 bg-[#181d2c] hover:bg-[#20273a] hover:text-white border border-white/[0.06] transition-colors cursor-pointer"
                    >
                      Select
                    </button>
                  )}

                  <button
                    onClick={() => onRemove(acc.id)}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="Remove Profile"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
