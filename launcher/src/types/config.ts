export interface LauncherConfig {
  schemaVersion: number;
  selectedAccountId?: string;
  selectedProfileId: string;
  allocatedRamMb: number;
  javaPath: string;
  customJvmArgs: string;
  closeLauncherOnGameStart: boolean;
  enableHardwareAcceleration: boolean;
  autoCheckUpdates: boolean;
  releaseChannel: 'stable' | 'beta' | 'nightly';
  gameResolutionWidth: number;
  gameResolutionHeight: number;
}

export const DEFAULT_LAUNCHER_CONFIG: LauncherConfig = {
  schemaVersion: 1,
  selectedProfileId: 'Default',
  allocatedRamMb: 3072,
  javaPath: '',
  customJvmArgs: '',
  closeLauncherOnGameStart: true,
  enableHardwareAcceleration: true,
  autoCheckUpdates: true,
  releaseChannel: 'stable',
  gameResolutionWidth: 1920,
  gameResolutionHeight: 1080,
};
