export interface AuthAccount {
  id: string;
  username: string;
  uuid: string;
  access_token: string;
  refresh_token?: string;
  expires_at: number;
  is_dev_mode: boolean;
  avatar_url: string;
}

export interface AccountStorage {
  active_account_id?: string;
  accounts: AuthAccount[];
}
