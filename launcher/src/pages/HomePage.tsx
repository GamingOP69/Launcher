import React from 'react';
import { AuthAccount } from '../types/account';
import { ProfileItem } from '../types/profile';
import { PlayButton } from '../components/PlayButton';
import { ProfileSelector } from '../components/ProfileSelector';
import { MemorySlider } from '../components/MemorySlider';
import { NewsFeed } from '../components/NewsFeed';
import { Zap, ShieldCheck, Sparkles, ChevronRight, Cpu } from 'lucide-react';

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
    <div className="flex-1 flex flex-col p-6 gap-6 overflow-y-auto w-full">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-cyan-950/40 border border-slate-800 p-7 shadow-2xl flex items-center justify-between flex-shrink-0">
        <div className="flex flex-col gap-2.5 z-10 max-w-xl text-left">
          <div className="flex items-center gap-2">
            <span className="bg-cyan-400 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded uppercase tracking-wider shadow-sm">
              OFFICIAL RELEASE
            </span>
            <span className="text-slate-400 text-xs font-semibold">MINECRAFT 1.8.9</span>
          </div>

          <h2 className="text-3xl font-black text-white tracking-tight">
            SAMRAT <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">CLIENT</span>
          </h2>

          <p className="text-xs text-slate-300 leading-relaxed">
            Competitive Bedwars & PvP client engine built for ultimate frame pacing, instant HUD customization, and zero input latency.
          </p>

          <div className="flex items-center gap-5 mt-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-200 font-medium">
              <Zap size={14} className="text-cyan-400" />
              <span>FastMath Enabled</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-200 font-medium">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span>100% Anti-Cheat Compliant</span>
            </div>
          </div>
        </div>

        {/* Launch Action Unit */}
        <div className="z-10 flex flex-col items-center gap-2 flex-shrink-0">
          <PlayButton
            isRunning={isRunning}
            isLoading={isLoading}
            onLaunch={onLaunch}
            onTerminate={onTerminate}
          />
          <span className="text-[11px] font-medium text-slate-400">
            {isRunning ? 'Process Active' : 'Ready to Launch'}
          </span>
        </div>

        {/* Ambient Cyan Background Flare */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      </div>

      {/* Quick Launch & Performance Controls Grid */}
      <div className="grid grid-cols-2 gap-4 flex-shrink-0">
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

      {/* News & Updates Section */}
      <div className="flex-1">
        <NewsFeed />
      </div>
    </div>
  );
};
