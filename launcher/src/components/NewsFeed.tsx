import React from 'react';
import { Flame, Sparkles, Zap, ArrowRight } from 'lucide-react';

export const NewsFeed: React.FC = () => {
  const news = [
    {
      id: 1,
      title: 'Samrat Client v1.0.0 Global Launch',
      category: 'RELEASE',
      icon: Sparkles,
      date: 'Today',
      summary: 'Next-level Bedwars and PvP performance with zero-garbage EventBus and 8-team HUD matrix.',
    },
    {
      id: 2,
      title: 'FastMath & Entity Culling Engine',
      category: 'PERFORMANCE',
      icon: Zap,
      date: 'Aug 2026',
      summary: 'Up to 35% improved 1% low frametime pacing across potato and high-end rigs.',
    },
    {
      id: 3,
      title: 'Bedwars Resource Timers & Alerts',
      category: 'FEATURES',
      icon: Flame,
      date: 'Aug 2026',
      summary: 'Diamond & Emerald upgrade countdowns alongside visual build height and void safety alerts.',
    },
  ];

  return (
    <div className="flex flex-col gap-3 text-left">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-200">
          Updates & Ecosystem Feed
        </h3>
        <span className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer transition-colors">
          <span>View Changelogs</span>
          <ArrowRight size={13} />
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3.5">
        {news.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="bg-slate-900/70 hover:bg-slate-800/80 border border-slate-800/80 hover:border-cyan-500/40 p-4 rounded-xl flex flex-col gap-2.5 transition-all duration-200 cursor-pointer shadow-sm group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded uppercase tracking-wider">
                  {item.category}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">{item.date}</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0 group-hover:bg-cyan-500/20 transition-colors">
                  <Icon size={13} className="text-cyan-400" />
                </div>
                <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                  {item.title}
                </h4>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                {item.summary}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
