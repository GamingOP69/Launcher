import React, { useState } from 'react';
import { AuthAccount, DeviceCodeResponse } from '../types/account';
import { AccountCard } from '../components/AccountCard';
import { invokeCommand } from '../services/tauriBridge';
import { KeyRound, UserPlus, ExternalLink, Loader2, CheckCircle2, Shield } from 'lucide-react';

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

      // Poll for completion
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
    <div style={{ padding: '24px', gap: '20px' }} className="flex flex-col flex-1 overflow-y-auto text-left">
      <div>
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff' }}>ACCOUNT MANAGEMENT</h2>
        <p style={{ fontSize: '12px', color: '#8fa2b7' }}>
          Legitimate Microsoft Authentication & Local Development Sandbox Accounts.
        </p>
      </div>

      {authError && (
        <div style={{ backgroundColor: '#2d1419', border: '1px solid #ff1744', padding: '10px 14px', borderRadius: '8px', color: '#ff8a80', fontSize: '12px' }}>
          {authError}
        </div>
      )}

      {/* Login Action Bar */}
      <div className="grid grid-cols-2 gap-4">
        {/* Microsoft Auth Card */}
        <div style={{ backgroundColor: '#141a24', border: '1px solid #222e3f', padding: '18px', borderRadius: '12px' }} className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <KeyRound size={18} style={{ color: '#00f0ff' }} />
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>Microsoft Account</h3>
          </div>
          <p style={{ fontSize: '11px', color: '#8fa2b7', lineHeight: 1.4 }}>
            Official browser-based login using standard Microsoft OAuth2. No passwords are ever collected.
          </p>

          {authStep === 'polling' && deviceCodeData ? (
            <div style={{ backgroundColor: '#0c1017', border: '1px solid #00f0ff', padding: '12px', borderRadius: '8px' }} className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span style={{ fontSize: '11px', color: '#8fa2b7' }}>Enter this code:</span>
                <span style={{ fontSize: '16px', fontWeight: 900, color: '#00f0ff' }} className="font-mono tracking-widest">
                  {deviceCodeData.user_code}
                </span>
              </div>
              <a
                href={deviceCodeData.verification_uri}
                target="_blank"
                rel="noreferrer"
                style={{ backgroundColor: '#1c2433', color: '#ffffff', padding: '6px', borderRadius: '4px', fontSize: '11px', textAlign: 'center' }}
                className="flex items-center justify-center gap-1 hover:underline"
              >
                <span>Open {deviceCodeData.verification_uri}</span>
                <ExternalLink size={12} />
              </a>
              <div className="flex items-center justify-center gap-2 mt-1 text-xs text-secondary">
                <Loader2 size={13} className="animate-spin" style={{ color: '#00f0ff' }} />
                <span>Waiting for approval in browser...</span>
              </div>
            </div>
          ) : (
            <button
              onClick={startMicrosoftLogin}
              disabled={authStep !== 'idle'}
              style={{ backgroundColor: '#00f0ff', color: '#0c1017', padding: '10px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: 800 }}
              className="flex items-center justify-center gap-2 hover:opacity-90 cursor-pointer glow-cyan"
            >
              <KeyRound size={16} />
              <span>Login with Microsoft</span>
            </button>
          )}
        </div>

        {/* Development Sandbox Card */}
        <div style={{ backgroundColor: '#141a24', border: '1px solid #222e3f', padding: '18px', borderRadius: '12px' }} className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <UserPlus size={18} style={{ color: '#ffab00' }} />
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>Local Dev Sandbox</h3>
          </div>
          <p style={{ fontSize: '11px', color: '#8fa2b7', lineHeight: 1.4 }}>
            Create a local offline test account for UI & HUD development. (Strictly for local testing).
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Username (e.g. SamratDev)"
              value={devUsername}
              onChange={(e) => setDevUsername(e.target.value)}
              style={{ backgroundColor: '#0c1017', border: '1px solid #222e3f', color: '#fff', padding: '8px 12px', borderRadius: '6px', fontSize: '12px', outline: 'none', flex: 1 }}
            />
            <button
              onClick={createDevAccount}
              style={{ backgroundColor: '#242e40', color: '#ffffff', padding: '8px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 700 }}
              className="hover:bg-surface-hover cursor-pointer"
            >
              Add Dev
            </button>
          </div>
        </div>
      </div>

      {/* Accounts List */}
      <div className="flex flex-col gap-2">
        <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#8fa2b7' }} className="uppercase tracking-wider">
          Saved Accounts ({accounts.length})
        </h3>

        <div className="flex flex-col gap-2">
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
