export interface SystemDiagnostics {
  os: string;
  arch: string;
  num_cpus: number;
  total_memory_mb: number;
  free_memory_mb: number;
}

export interface JavaRuntimeInfo {
  path: string;
  version: string;
  is_64_bit: boolean;
  vendor: string;
  is_recommended: boolean;
}
