export interface Player {
  name: string;
  loot: number;
  supplies: number;
  balance: number;
  damage?: number;
  healing?: number;
}

export interface ParsedData {
  dateFrom: string;
  dateTo: string;
  duration: string;
  lootType: string;
  totalLoot: number;
  totalSupplies: number;
  totalBalance: number;
  players: Player[];
}