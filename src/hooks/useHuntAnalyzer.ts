import { useState, useEffect } from "react";

export interface PlayerData {
  name: string;
  loot: number;
  supplies: number;
  balance: number;
  damage?: number;
  healing?: number;
}

export interface SessionData {
  dateFrom: string;
  dateTo: string;
  duration: string;
  lootType: string;
  totalLoot: number;
  totalSupplies: number;
  totalBalance: number;
  players: PlayerData[];
}

export interface Payment {
  from: string;
  to: string;
  amount: number;
}

interface Comments {
  high_damage: {
    tier_s: string[];
    tier_a: string[];
  };
  high_heal: {
    tier_s: string[];
    tier_a: string[];
  };
  low_profit: {
    tier_s: string[];
    tier_a: string[];
    tier_b: string[];
  };
  low_damage: {
    tier_s: string[];
    tier_a: string[];
    tier_b: string[];
  };
}

export function useHuntAnalyzer() {
  const [inputText, setInputText] = useState("");
  const [parsedData, setParsedData] = useState<SessionData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [comments, setComments] = useState<Comments | null>(null);

  // Fetch comments from JSON file
  useEffect(() => {
    fetch('/comments.json')
      .then(response => response.json())
      .then(data => setComments(data))
      .catch(err => console.error('Failed to load comments:', err));
  }, []);

  // Get a random comment from a specific category and tier
  const getRandomComment = (category: keyof Comments, tier: string): string => {
    if (!comments) return "";
    
    const tierComments = comments[category][tier as keyof typeof comments[typeof category]];
    if (!tierComments || !tierComments.length) return "";
    
    const randomIndex = Math.floor(Math.random() * tierComments.length);
    return tierComments[randomIndex];
  };

  // Classify player performance
  const classifyPerformance = (data: SessionData) => {
    if (!data || !data.players || data.players.length === 0) return {};
    
    // Calculate total damage and healing
    const totalDamage = data.players.reduce((sum, player) => sum + (player.damage || 0), 0);
    const totalHealing = data.players.reduce((sum, player) => sum + (player.healing || 0), 0);
    
    // Find max damage and healing players
    const maxDamage = Math.max(...data.players.map(p => p.damage || 0));
    const maxHealing = Math.max(...data.players.map(p => p.healing || 0));
    
    // Find min damage (excluding zeros) and min balance
    const nonZeroDamages = data.players
      .filter(p => (p.damage || 0) > 0)
      .map(p => p.damage || 0);
    const minDamage = nonZeroDamages.length ? Math.min(...nonZeroDamages) : 0;
    const minBalance = Math.min(...data.players.map(p => p.balance));
    
    // Classify each player
    const classifications: Record<string, {
      damageClass?: string;
      healClass?: string;
      balanceClass?: string;
      damageComment?: string;
      healComment?: string;
      balanceComment?: string;
    }> = {};
    
    data.players.forEach(player => {
      const playerClass: {
        damageClass?: string;
        healClass?: string;
        balanceClass?: string;
        damageComment?: string;
        healComment?: string;
        balanceComment?: string;
      } = {};
      
      // Classify damage
      if (player.damage === maxDamage) {
        // Top damage dealer
        const damagePercentage = totalDamage > 0 ? (player.damage || 0) / totalDamage : 0;
        if (damagePercentage >= 0.35) {
          playerClass.damageClass = 'tier_s';
        } else {
          playerClass.damageClass = 'tier_a';
        }
        playerClass.damageComment = getRandomComment('high_damage', playerClass.damageClass);
      } else if (player.damage === minDamage && minDamage > 0) {
        // Lowest damage dealer
        const damagePercentage = totalDamage > 0 ? (player.damage || 0) / totalDamage : 0;
        if (damagePercentage < 0.1) {
          playerClass.damageClass = 'tier_s';
        } else if (damagePercentage < 0.2) {
          playerClass.damageClass = 'tier_a';
        } else {
          playerClass.damageClass = 'tier_b';
        }
        playerClass.damageComment = getRandomComment('low_damage', playerClass.damageClass);
      }
      
      // Classify healing
      if (player.healing === maxHealing && maxHealing > 0) {
        // Top healer
        const healingPercentage = totalHealing > 0 ? (player.healing || 0) / totalHealing : 0;
        if (healingPercentage >= 0.35) {
          playerClass.healClass = 'tier_s';
        } else {
          playerClass.healClass = 'tier_a';
        }
        playerClass.healComment = getRandomComment('high_heal', playerClass.healClass);
      }
      
      // Classify balance
      if (player.balance === minBalance && minBalance < 0) {
        // Lowest balance
        const balanceRatio = Math.abs(player.balance) / (data.totalLoot / data.players.length);
        if (balanceRatio > 1.5) {
          playerClass.balanceClass = 'tier_s';
        } else if (balanceRatio > 0.8) {
          playerClass.balanceClass = 'tier_a';
        } else {
          playerClass.balanceClass = 'tier_b';
        }
        playerClass.balanceComment = getRandomComment('low_profit', playerClass.balanceClass);
      }
      
      classifications[player.name] = playerClass;
    });
    
    return classifications;
  };

  const parseSessionData = (text: string): SessionData | null => {
    try {
      // Reset error state
      setError(null);
      
      const lines = text.trim().split('\n');
      
      // Parse session info
      const sessionMatch = lines[0].match(/Session data: From ([\d-]+, [\d:]+) to ([\d-]+, [\d:]+)/);
      if (!sessionMatch) throw new Error("Invalid session data format");
      
      const durationMatch = lines[1].match(/Session: ([\d:]+h)/);
      if (!durationMatch) throw new Error("Invalid duration format");
      
      const lootTypeMatch = lines[2].match(/Loot Type: (.+)/);
      if (!lootTypeMatch) throw new Error("Invalid loot type format");
      
      const totalLootMatch = lines[3].match(/Loot: ([\d,]+)/);
      if (!totalLootMatch) throw new Error("Invalid total loot format");
      
      const totalSuppliesMatch = lines[4].match(/Supplies: ([\d,]+)/);
      if (!totalSuppliesMatch) throw new Error("Invalid total supplies format");
      
      // Update this part to handle negative balance
      const totalBalanceMatch = lines[5].match(/Balance: (-?[\d,]+)/);
      if (!totalBalanceMatch) throw new Error("Invalid total balance format");
      
      // Parse player data
      const players: PlayerData[] = [];
      let currentIndex = 6;
      
      while (currentIndex < lines.length) {
        const playerNameLine = lines[currentIndex++];
        if (!playerNameLine || playerNameLine.trim() === '') continue;
        
        const playerName = playerNameLine.replace(/\s\(Leader\)$/, '').trim();
        
        const lootLine = lines[currentIndex++];
        if (!lootLine) break;
        const lootMatch = lootLine.match(/Loot: ([\d,]+)/);
        if (!lootMatch) throw new Error(`Invalid loot format for player ${playerName}`);
        
        const suppliesLine = lines[currentIndex++];
        if (!suppliesLine) break;
        const suppliesMatch = suppliesLine.match(/Supplies: ([\d,]+)/);
        if (!suppliesMatch) throw new Error(`Invalid supplies format for player ${playerName}`);
        
        const balanceLine = lines[currentIndex++];
        if (!balanceLine) break;
        // Update this part to handle negative balance
        const balanceMatch = balanceLine.match(/Balance: (-?[\d,]+)/);
        if (!balanceMatch) throw new Error(`Invalid balance format for player ${playerName}`);
        
        // Optional damage and healing
        let damage: number | undefined;
        let healing: number | undefined;
        
        if (currentIndex < lines.length && lines[currentIndex].trim().startsWith('Damage:')) {
          const damageMatch = lines[currentIndex++].match(/Damage: ([\d,]+)/);
          if (damageMatch) {
            damage = parseInt(damageMatch[1].replace(/,/g, ''));
          }
        }
        
        if (currentIndex < lines.length && lines[currentIndex].trim().startsWith('Healing:')) {
          const healingMatch = lines[currentIndex++].match(/Healing: ([\d,]+)/);
          if (healingMatch) {
            healing = parseInt(healingMatch[1].replace(/,/g, ''));
          }
        }
        
        players.push({
          name: playerName,
          loot: parseInt(lootMatch[1].replace(/,/g, '')),
          supplies: parseInt(suppliesMatch[1].replace(/,/g, '')),
          // Parse balance with support for negative values
          balance: parseInt(balanceMatch[1].replace(/,/g, '')),
          damage,
          healing
        });
      }
      
      return {
        dateFrom: sessionMatch[1],
        dateTo: sessionMatch[2],
        duration: durationMatch[1],
        lootType: lootTypeMatch[1],
        totalLoot: parseInt(totalLootMatch[1].replace(/,/g, '')),
        totalSupplies: parseInt(totalSuppliesMatch[1].replace(/,/g, '')),
        // Parse total balance with support for negative values
        totalBalance: parseInt(totalBalanceMatch[1].replace(/,/g, '')),
        players
      };
    } catch (err) {
      setError((err as Error).message);
      return null;
    }
  };

  const calculatePayments = (data: SessionData): Payment[] => {
    if (!data || !data.players || data.players.length === 0) return [];
    
    const balancePerPerson = Math.floor(data.totalBalance / data.players.length);
    const payments: Payment[] = [];
    
    // Clone players to avoid modifying the original data
    const playersCopy = data.players.map(player => ({
      ...player,
      balance: player.balance || 0
    }));
    
    // Find players who need to pay (have more than average)
    const payers = playersCopy
      .filter(p => p.balance > balancePerPerson)
      .sort((a, b) => b.balance - a.balance); // Sort by balance (highest first)
    
    // Find players who need to receive (have less than average)
    const receivers = playersCopy
      .filter(p => p.balance < balancePerPerson)
      .sort((a, b) => a.balance - b.balance); // Sort by balance (lowest first)
    
    // For each payer, distribute their excess balance to receivers
    for (const payer of payers) {
      let excessBalance = payer.balance - balancePerPerson;
      
      for (let i = 0; i < receivers.length && excessBalance > 0; i++) {
        const receiver = receivers[i];
        const deficit = balancePerPerson - receiver.balance;
        
        if (deficit <= 0) continue; // Skip if this receiver doesn't need more
        
        // Calculate payment amount (minimum of excess and deficit)
        const paymentAmount = Math.min(excessBalance, deficit);
        
        if (paymentAmount > 0) {
          payments.push({
            from: payer.name,
            to: receiver.name,
            amount: paymentAmount
          });
          
          // Update balances
          excessBalance -= paymentAmount;
          receiver.balance += paymentAmount;
        }
      }
    }
    
    return payments;
  };

  const handleAnalyze = () => {
    const data = parseSessionData(inputText);
    setParsedData(data);
  };

  // Add this function to the useHuntAnalyzer hook
  const getRandomComments = (category: keyof Comments, tier: string, count: number = 2): string[] => {
    if (!comments) return [];
    
    const tierComments = comments[category][tier as keyof typeof comments[typeof category]];
    if (!tierComments || !tierComments.length) return [];
    
    // If we don't have enough comments, return what we have
    if (tierComments.length <= count) return [...tierComments];
    
    // Get random comments without duplicates
    const result: string[] = [];
    const indices = new Set<number>();
    
    while (indices.size < count && indices.size < tierComments.length) {
      const randomIndex = Math.floor(Math.random() * tierComments.length);
      if (!indices.has(randomIndex)) {
        indices.add(randomIndex);
        result.push(tierComments[randomIndex]);
      }
    }
    
    return result;
  };
  
  // Make sure to include this in the return statement of the hook
  return {
    inputText,
    setInputText,
    parsedData,
    error,
    handleAnalyze,
    calculatePayments,
    classifyPerformance,
    getRandomComments  // Add this line
  };
}