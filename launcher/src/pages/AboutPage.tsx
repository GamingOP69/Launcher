import React from 'react';
import { Info, Github, Shield, Heart } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div style={{ padding: '24px', gap: '20px' }} className="flex flex-col flex-1 overflow-y-auto text-left">
      <div className="flex items-center gap-4">
        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #00f0ff, #0066cc)' }} className="flex items-center justify-center font-extrabold text-black text-2xl shadow-lg">
          S
        </div>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#ffffff' }}>SAMRAT CLIENT</h2>
          <p style={{ fontSize: '12px', color: '#00f0ff' }}>Next-Generation Minecraft 1.8.9 Desktop Ecosystem</p>
        </div>
      </div>

      <div style={{ backgroundColor: '#141a24', border: '1px solid #222e3f', padding: '18px', borderRadius: '12px' }} className="flex flex-col gap-3">
        <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>Project Mission & Integrity</h3>
        <p style={{ fontSize: '12px', color: '#8fa2b7', lineHeight: 1.6 }}>
          Samrat Client is an unofficial, legitimate third-party client and launcher engineered for Bedwars and PvP enthusiasts.
          Built with an emphasis on zero local developer toolchain requirements, strict security, zero token leakage, and measurable rendering performance.
        </p>

        <div className="flex items-center gap-2 mt-2 text-xs text-white">
          <Shield size={14} style={{ color: '#00e676' }} />
          <span>Licensed under the MIT License • Built with Rust, Tauri, React, and Java</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <a
          href="https://github.com/samrat-client/launcher"
          target="_blank"
          rel="noreferrer"
          style={{ backgroundColor: '#141a24', border: '1px solid #222e3f', padding: '16px', borderRadius: '10px' }}
          className="flex items-center gap-3 hover:border-focused"
        >
          <Github size={20} style={{ color: '#00f0ff' }} />
          <div className="flex flex-col">
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>GitHub Repository</span>
            <span style={{ fontSize: '11px', color: '#8fa2b7' }}>Source code, CI/CD pipelines & releases</span>
          </div>
        </a>

        <div
          style={{ backgroundColor: '#141a24', border: '1px solid #222e3f', padding: '16px', borderRadius: '10px' }}
          className="flex items-center gap-3"
        >
          <Heart size={20} style={{ color: '#ff1744' }} />
          <div className="flex flex-col">
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>Crafted for Creators</span>
            <span style={{ fontSize: '11px', color: '#8fa2b7' }}>100% Free & Open Source</span>
          </div>
        </div>
      </div>
    </div>
  );
};
