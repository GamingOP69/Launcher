import React from 'react';
import { AuthAccount } from '../types/account';
import { ProfileItem } from '../types/profile';
import { PlayButton } from '../components/PlayButton';
import { ProfileSelector } from '../components/ProfileSelector';
import { MemorySlider } from '../components/MemorySlider';
import { NewsFeed } from '../components/NewsFeed';
import { Zap, ShieldCheck, Gamepad2 } from 'lucide-react';

interface HomePageProps {
  activeAccount: AuthAccount | null;
  profiles: ProfileItem[];
  selectedProfileId: string;
  ramMb: number;
  isRunning: boolean;
  isLoading: boolean;
  onSelectProfile: (id: string) => void;
  onChangeRam: (mb: number) => void;
  onLaunch: () => void;
  onTerminate: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  activeAccount,
  profiles,
  selectedProfileId,
  ramMb,
  isRunning,
  isLoading,
  onSelectProfile,
  onChangeRam,
  onLaunch,
  onTerminate,
}) => {
  return (
    <div style={{ padding: '24px', gap: '20px' }} className="flex flex-col flex-1 overflow-y-auto">
      {/* Hero Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #141c2b 0%, #0d121c 100%)',
          border: '1px solid #222e3f',
          borderRadius: '16px',
          padding: '28px 32px',
          position: 'relative',
          overflow: 'hidden',
        }}
        className="flex items-center justify-between shadow-2xl text-left"
      >
        <div className="flex flex-col gap-2 z-10 max-w-lg">
          <div className="flex items-center gap-2">
            <span style={{ backgroundColor: '#00f0ff', color: '#0c1017', fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '4px' }}>
              OFFICIAL RELEASE
            </span>
            <span style={{ color: '#8fa2b7', fontSize: '11px' }}>MINECRAFT 1.8.9</span>
          </div>

          <h2 style={{ fontSize: '32px', fontWeight: 900, color: '#ffffff', letterSpacing: '0.5px' }}>
            SAMRAT <span style={{ color: '#00f0ff' }}>CLIENT</span>
          </h2>

          <p style={{ fontSize: '13px', color: '#8fa2b7', lineHeight: 1.5 }}>
            Competitive Bedwars & PvP client engine built for ultimate frame pacing, instant HUD customization, and zero input latency.
          </p>

          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1.5 text-xs text-white">
              <Zap size={14} style={{ color: '#00f0ff' }} />
              <span>FastMath Enabled</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-white">
              <ShieldCheck size={14} style={{ color: '#00e676' }} />
              <span>100% Anti-Cheat Compliant</span>
            </div>
          </div>
        </div>

        {/* Big Launch Button */}
        <div className="z-10 flex flex-col items-center gap-2">
          <PlayButton
            isRunning={isRunning}
            isLoading={isLoading}
            onLaunch={onLaunch}
            onTerminate={onTerminate}
          />
          <span style={{ fontSize: '11px', color: '#586b7f' }}>
            {isRunning ? 'Process Active' : 'Ready to Launch'}
          </span>
        </div>

        {/* Ambient Cyan Glow */}
        <div style={{ position: 'absolute', right: '-50px', top: '-50px', width: '220px', height: '220px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0, 240, 255, 0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
      </div>

      {/* Quick Settings Grid */}
      <div className="grid grid-cols-2 gap-4">
        <ProfileSelector
          profiles={profiles}
          selectedProfileId={selectedProfileId}
          onSelect={onSelectProfile}
        />
        <MemorySlider
          ramMb={ramMb}
          onChange={onChangeRam}
        />
      </div>

      {/* News & Updates Feed */}
      <NewsFeed />
    </div>
  );
};
