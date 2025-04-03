export interface Character {
  pid: string;
  name: string;
  vocation: string;
  is_verified: boolean;
  confirmation_token: string;
  min_lvl: number;
  max_lvl: number;
}