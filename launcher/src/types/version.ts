export interface UpdateCheckResult {
  update_available: boolean;
  current_version: string;
  latest_version: string;
  changelog: string[];
}
