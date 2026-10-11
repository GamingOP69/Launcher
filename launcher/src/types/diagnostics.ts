export interface SystemDiagnostics {
  os: string;
  arch: string;
  num_cpus: number;
}

export interface JavaRuntimeInfo {
  path: string;
  version: string;
  is_64_bit: boolean;
  vendor: string;
  is_recommended: boolean;
}
