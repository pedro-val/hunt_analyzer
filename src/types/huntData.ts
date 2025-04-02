// Interface for the hunting ground response
export interface IHuntingGroundResponse {
  pid: string;
  name: string;
  description: string | null;
}

// Interface for base hunt session properties
export interface IHuntSessionBase {
  pid: string;
  hunting_ground: IHuntingGroundResponse;
  start_hour: string;
  end_hour: string;
}

// Interface for individual hunt session response
export interface IIndividualHuntSessionResponse extends IHuntSessionBase {
  raw_xp_gain: number;
  xp_gain: number;
  raw_xp_per_hour: number;
  xp_per_hour: number;
  loot: number;
  supplies: number;
  damage: number;
  dps: number;
  healing: number;
  healing_per_hour: number;
}

// Interface for party character details
export interface IPartyCharacterDetails {
  character_name: string;
  character_pid: string;
  loot: number;
  supplies: number;
  balance: number;
  damage: number;
  healing: number;
}

// Interface for party hunt session response
export interface IPartyHuntSessionResponse extends IHuntSessionBase {
  total_loot: number;
  total_supplies: number;
  balance: number;
  party_size: number;
  party_characters: IPartyCharacterDetails[];
}

// Interface for hunting ground session item
export interface IHuntingGroundSessionItem {
  name: string;
  individual_data?: IIndividualHuntSessionResponse[] | IIndividualHuntSessionResponse;
  party_hunt_data?: IPartyHuntSessionResponse[] | IPartyHuntSessionResponse;
}

// Interface for hunt session by date and ground
export interface IHuntSessionByDateAndGround {
  date: string;
  hunting_grounds: IHuntingGroundSessionItem[];
}

// Type for array of hunt sessions by date
export type IHuntSessionsByDateAndGround = IHuntSessionByDateAndGround[];