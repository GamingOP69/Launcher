import React from 'react';
import { Flame, Sparkles, Zap } from 'lucide-react';

export const NewsFeed: React.FC = () => {
  const news = [
    {
      id: 1,
      title: 'Samrat Client v1.0.0 Global Launch',
      category: 'RELEASE',
      icon: Sparkles,
      date: 'Today',
      summary: 'Experience next-level Bedwars and PvP performance with our custom zero-garbage EventBus and 8-team HUD matrix.',
    },
    {
      id: 2,
      title: 'FastMath & Entity Culling Benchmarks',
      category: 'PERFORMANCE',
      icon: Zap,
      date: 'Aug 2026',
      summary: 'Up to 35% improved 1% low frametime pacing across potato and high-end rigs verified in the Performance Lab.',
    },
    {
      id: 3,
      title: 'Bedwars Resource Timers & Height Alert',
      category: 'FEATURES',
      icon: Flame,
      date: 'Aug 2026',
      summary: 'Accurate Diamond and Emerald upgrade countdowns alongside visual build height and void proximity safety alerts.',
    },
  ];

  return (
    <div className="flex flex-col gap-3 text-left">
      <div className="flex items-center justify-between">
        <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', letterSpacing: '0.5px' }} className="uppercase">
          Updates & Announcements
        </h3>
        <span style={{ fontSize: '11px', color: '#00f0ff', cursor: 'pointer' }} className="hover:underline">
          View All
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {news.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              style={{
                backgroundColor: '#141a24',
                border: '1px solid #222e3f',
                padding: '14px',
                borderRadius: '10px',
                transition: 'all 0.15s ease-in-out',
              }}
              className="flex flex-col gap-2 hover:border-focused cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span style={{ fontSize: '9px', fontWeight: 800, color: '#00f0ff', backgroundColor: '#1c2433', padding: '2px 6px', borderRadius: '4px' }}>
                  {item.category}
                </span>
                <span style={{ fontSize: '10px', color: '#586b7f' }}>{item.date}</span>
              </div>

              <div className="flex items-center gap-2">
                <Icon size={16} style={{ color: '#00f0ff', flexShrink: 0 }} />
                <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff', lineHeight: 1.3 }}>{item.title}</h4>
              </div>

              <p style={{ fontSize: '11px', color: '#8fa2b7', lineHeight: 1.4 }} className="line-clamp-2">
                {item.summary}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
