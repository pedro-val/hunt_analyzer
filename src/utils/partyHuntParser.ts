import { Character } from '@/types/character';

// Interface para os dados de cada jogador da party
export interface PartyCharacterData {
  loot: number;
  supplies: number;
  balance: number;
  damage: number;
  healing: number;
}

// Interface para o objeto de retorno
export interface PartyHuntData {
  hunting_ground_pid: string;
  personal_character_pid: string;
  data: string;
  start_hour: string;
  end_hour: string;
  total_loot: number;
  total_supplies: number;
  balance: number;
  party_size: number;
  party_characters: Record<string, PartyCharacterData>;
}

export function parsePartyHuntText(
  text: string, 
  personalCharacterId: string,
  huntingGroundId: string,
  characters: Character[]
): PartyHuntData | null {
  try {
    if (!text || !personalCharacterId || !huntingGroundId) {
      return null;
    }



    const lines = text.trim().split('\n');
    
    // Parse session info
    const sessionMatch = lines[0].match(/Session data: From ([\d-]+), ([\d:]+) to ([\d-]+), ([\d:]+)/);
    if (!sessionMatch) throw new Error("Invalid session data format");
    
    const date = sessionMatch[1];
    const startHour = sessionMatch[2];
    const endHour = sessionMatch[4];
    
    const totalLootMatch = lines[3].match(/Loot: ([\d,]+)/);
    if (!totalLootMatch) throw new Error("Invalid total loot format");
    const totalLoot = parseInt(totalLootMatch[1].replace(/,/g, ''));
    
    const totalSuppliesMatch = lines[4].match(/Supplies: ([\d,]+)/);
    if (!totalSuppliesMatch) throw new Error("Invalid total supplies format");
    const totalSupplies = parseInt(totalSuppliesMatch[1].replace(/,/g, ''));
    
    const balanceMatch = lines[5].match(/Balance: (-?[\d,]+)/);
    if (!balanceMatch) throw new Error("Invalid balance format");
    const balance = parseInt(balanceMatch[1].replace(/,/g, ''));
    
    // Extract player data
    const partyCharactersData: Record<string, PartyCharacterData> = {};
    let currentIndex = 6;
    
    while (currentIndex < lines.length) {
      // Get player name line
      const playerNameLine = lines[currentIndex];
      if (!playerNameLine || playerNameLine.trim() === '') {
        currentIndex++;
        continue;
      }
      
      // Extract player name, removing "(Leader)" if present
      const playerName = playerNameLine.replace(/\s\(Leader\)$/, '').trim();
      currentIndex++;
      
      // Extract player stats
      let playerLoot = 0;
      let playerSupplies = 0;
      let playerBalance = 0;
      let playerDamage = 0;
      let playerHealing = 0;
      
      // Process next 5 lines for player stats
      for (let i = 0; i < 5 && currentIndex < lines.length; i++) {
        const statLine = lines[currentIndex++].trim();
        
        if (statLine.startsWith('Loot:')) {
          const match = statLine.match(/Loot: ([\d,]+)/);
          if (match) playerLoot = parseInt(match[1].replace(/,/g, ''));
        } 
        else if (statLine.startsWith('Supplies:')) {
          const match = statLine.match(/Supplies: ([\d,]+)/);
          if (match) playerSupplies = parseInt(match[1].replace(/,/g, ''));
        } 
        else if (statLine.startsWith('Balance:')) {
          const match = statLine.match(/Balance: (-?[\d,]+)/);
          if (match) playerBalance = parseInt(match[1].replace(/,/g, ''));
        } 
        else if (statLine.startsWith('Damage:')) {
          const match = statLine.match(/Damage: ([\d,]+)/);
          if (match) playerDamage = parseInt(match[1].replace(/,/g, ''));
        } 
        else if (statLine.startsWith('Healing:')) {
          const match = statLine.match(/Healing: ([\d,]+)/);
          if (match) playerHealing = parseInt(match[1].replace(/,/g, ''));
        }
      }
      
      // Add player data to the object
      partyCharactersData[playerName] = {
        loot: playerLoot,
        supplies: playerSupplies,
        balance: playerBalance,
        damage: playerDamage,
        healing: playerHealing
      };
    }
    
    // Find the personal character name
    const personalCharacter = characters.find(char => char.pid === personalCharacterId);
    if (!personalCharacter) {
      throw new Error("Personal character not found");
    };

    // Remove personal character from party characters object
    const personalCharacterName = personalCharacter.name;
    const filteredPartyCharacters = { ...partyCharactersData };

    // Check if personal character exists in party characters
    const isCharacterInParty = Object.keys(partyCharactersData).some(name => 
      name.toLowerCase() === personalCharacterName.toLowerCase()
    );

    if (!isCharacterInParty) {
      throw new Error("Erro ao processar os dados da hunt em party: Personal character not found in party");
    }

    if (filteredPartyCharacters[personalCharacterName]) {
      delete filteredPartyCharacters[personalCharacterName];
    }
    
    // Verificar se há pelo menos 2 personagens na party
    if (Object.keys(partyCharactersData).length < 2) {
      throw new Error("Uma hunt em party deve ter pelo menos 2 personagens.");
    }

    return {
      hunting_ground_pid: huntingGroundId,
      personal_character_pid: personalCharacterId,
      data: date,
      start_hour: startHour,
      end_hour: endHour,
      total_loot: totalLoot,
      total_supplies: totalSupplies,
      balance: balance,
      party_size: Object.keys(partyCharactersData).length,
      party_characters: filteredPartyCharacters
    };
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error parsing party hunt text:', error);
      throw new Error(error.message);
    }
    console.error('Unknown error parsing party hunt text:', error);
    throw new Error("Erro ao processar os dados da hunt em party: Ocorreu um erro desconhecido");
  }
}