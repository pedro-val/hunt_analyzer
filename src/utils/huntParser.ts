export interface HuntData {
  data: string;
  start_hour: string;
  end_hour: string;
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
  personal_character_pid?: string;
  hunting_ground_pid?: string;
}

export function parseHuntText(text: string): HuntData | null {
  try {
    // Extract date
    const dateMatch = text.match(/From (\d{4}-\d{2}-\d{2})/);
    const date = dateMatch ? dateMatch[1] : "";

    // Extract hours
    const hoursMatch = text.match(/From \d{4}-\d{2}-\d{2}, (\d{2}:\d{2}:\d{2}) to \d{4}-\d{2}-\d{2}, (\d{2}:\d{2}:\d{2})/);
    const startHour = hoursMatch ? hoursMatch[1] : "";
    const endHour = hoursMatch ? hoursMatch[2] : "";

    // Extract numeric values
    const rawXpGainMatch = text.match(/Raw XP Gain: ([\d,]+)/);
    const rawXpGain = rawXpGainMatch ? parseInt(rawXpGainMatch[1].replace(/,/g, '')) : 0;

    const xpGainMatch = text.match(/XP Gain: ([\d,]+)/);
    const xpGain = xpGainMatch ? parseInt(xpGainMatch[1].replace(/,/g, '')) : 0;

    const rawXpPerHourMatch = text.match(/Raw XP\/h: ([\d,]+)/);
    const rawXpPerHour = rawXpPerHourMatch ? parseInt(rawXpPerHourMatch[1].replace(/,/g, '')) : 0;

    const xpPerHourMatch = text.match(/XP\/h: ([\d,]+)/);
    const xpPerHour = xpPerHourMatch ? parseInt(xpPerHourMatch[1].replace(/,/g, '')) : 0;

    const lootMatch = text.match(/Loot: ([\d,]+)/);
    const loot = lootMatch ? parseInt(lootMatch[1].replace(/,/g, '')) : 0;

    const suppliesMatch = text.match(/Supplies: ([\d,]+)/);
    const supplies = suppliesMatch ? parseInt(suppliesMatch[1].replace(/,/g, '')) : 0;

    const damageMatch = text.match(/Damage: ([\d,]+)/);
    const damage = damageMatch ? parseInt(damageMatch[1].replace(/,/g, '')) : 0;

    const dpsMatch = text.match(/Damage\/h: ([\d,]+)/);
    const dps = dpsMatch ? parseInt(dpsMatch[1].replace(/,/g, '')) : 0;

    const healingMatch = text.match(/Healing: ([\d,]+)/);
    const healing = healingMatch ? parseInt(healingMatch[1].replace(/,/g, '')) : 0;

    const healingPerHourMatch = text.match(/Healing\/h: ([\d,]+)/);
    const healingPerHour = healingPerHourMatch ? parseInt(healingPerHourMatch[1].replace(/,/g, '')) : 0;

    return {
      data: date,
      start_hour: startHour,
      end_hour: endHour,
      raw_xp_gain: rawXpGain,
      xp_gain: xpGain,
      raw_xp_per_hour: rawXpPerHour,
      xp_per_hour: xpPerHour,
      loot: loot,
      supplies: supplies,
      damage: damage,
      dps: dps,
      healing: healing,
      healing_per_hour: healingPerHour,
    };
  } catch (error) {
    console.error("Error parsing hunt text:", error);
    return null;
  }
}