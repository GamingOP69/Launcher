import React, { useState } from 'react';
import { AuthAccount, DeviceCodeResponse } from '../types/account';
import { AccountCard } from '../components/AccountCard';
import { invokeCommand } from '../services/tauriBridge';
import { KeyRound, UserPlus, ExternalLink, Loader2, Shield } from 'lucide-react';

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
  const [authStep, setAuthStep] = useState<'idle' | 'waiting_code' | 'polling'>('idle');
  const [deviceCodeData, setDeviceCodeData] = useState<DeviceCodeResponse | null>(null);
  const [devUsername, setDevUsername] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  const startMicrosoftLogin = async () => {
    try {
      setAuthError(null);
      setAuthStep('waiting_code');
      const data = await invokeCommand<DeviceCodeResponse>('request_ms_device_code');
      setDeviceCodeData(data);
      setAuthStep('polling');

      const account = await invokeCommand<AuthAccount>('poll_ms_auth', {
        deviceCode: data.device_code,
        interval: data.interval || 5,
      });

      onRefreshAccounts();
      onSetActive(account.id);
      setAuthStep('idle');
      setDeviceCodeData(null);
    } catch (e: any) {
      setAuthError(e?.toString() || 'Microsoft login failed');
      setAuthStep('idle');
    }
  };

  const createDevAccount = async () => {
    if (devUsername.trim()) {
      try {
        const account = await invokeCommand<AuthAccount>('add_dev_account', {
          username: devUsername.trim(),
        });
        onRefreshAccounts();
        onSetActive(account.id);
        setDevUsername('');
      } catch (e: any) {
        setAuthError(e?.toString() || 'Failed to create dev account');
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col p-6 gap-6 overflow-y-auto text-left w-full">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-black text-white tracking-wide">ACCOUNT MANAGEMENT</h2>
        <p className="text-xs text-slate-400">
          Official Microsoft OAuth2 Device Flow & Local Development Sandbox Accounts.
        </p>
      </div>

      {authError && (
        <div className="bg-rose-950/40 border border-rose-500/50 p-3.5 rounded-xl text-xs text-rose-200">
          {authError}
        </div>
      )}

      {/* Login Action Bar */}
      <div className="grid grid-cols-2 gap-4">
        {/* Microsoft Auth Card */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl flex flex-col gap-3.5 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <KeyRound size={16} />
            </div>
            <h3 className="text-sm font-bold text-white">Microsoft Authentication</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Official browser-based login using standard Microsoft OAuth2. No passwords are ever collected.
          </p>

          {authStep === 'polling' && deviceCodeData ? (
            <div className="bg-slate-950 border border-cyan-500/50 p-4 rounded-xl flex flex-col gap-2.5 shadow-lg shadow-cyan-500/10">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Device Authorization Code:</span>
                <span className="text-lg font-black text-cyan-400 font-mono tracking-widest bg-cyan-500/10 px-2 py-0.5 rounded">
                  {deviceCodeData.user_code}
                </span>
              </div>
              <a
                href={deviceCodeData.verification_uri}
                target="_blank"
                rel="noreferrer"
                className="bg-slate-800 hover:bg-slate-700 text-white p-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Open {deviceCodeData.verification_uri}</span>
                <ExternalLink size={13} />
              </a>
              <div className="flex items-center justify-center gap-2 mt-1 text-xs text-slate-400">
                <Loader2 size={13} className="animate-spin text-cyan-400" />
                <span>Waiting for approval in browser...</span>
              </div>
            </div>
          ) : (
            <button
              onClick={startMicrosoftLogin}
              disabled={authStep !== 'idle'}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 shadow-md shadow-cyan-500/20 transition-all duration-150 cursor-pointer"
            >
              <KeyRound size={15} />
              <span>Login with Microsoft</span>
            </button>
          )}
        </div>

        {/* Development Sandbox Card */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl flex flex-col gap-3.5 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <UserPlus size={16} />
            </div>
            <h3 className="text-sm font-bold text-white">Local Dev Sandbox</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Create a local offline test account for HUD and client module development.
          </p>

          <div className="flex gap-2 mt-auto">
            <input
              type="text"
              placeholder="Username (e.g. PvPPro)"
              value={devUsername}
              onChange={(e) => setDevUsername(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 focus:border-amber-400/50 text-white px-3.5 py-2 rounded-xl text-xs font-semibold outline-none transition-colors"
            />
            <button
              onClick={createDevAccount}
              className="bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold px-4 py-2 rounded-xl text-xs border border-slate-700 hover:border-amber-400/40 transition-colors cursor-pointer"
            >
              Add Dev
            </button>
          </div>
        </div>
      </div>

      {/* Accounts List */}
      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">
          Saved Accounts ({accounts.length})
        </h3>

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
