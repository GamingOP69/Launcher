export type PerformancePreset = 'QUALITY' | 'BALANCED' | 'HIGH_FPS' | 'ULTRA_FPS' | 'CUSTOM';

export interface ProfileItem {
  id: string;
  name: string;
  description: string;
  isPreset: boolean;
  performancePreset: PerformancePreset;
  icon?: string;
}
