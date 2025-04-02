"use client";
interface Player {
  name: string;
  loot: number;
  supplies: number;
  balance: number;
  damage?: number;
  healing?: number;
}

interface ParsedData {
  dateFrom: string;
  dateTo: string;
  duration: string;
  lootType: string;
  totalLoot: number;
  totalSupplies: number;
  totalBalance: number;
  players: Player[];
}

interface PerformanceCommentsProps {
  parsedData: ParsedData;
  playerClassifications: Record<string, {
    damageClass?: string;
    healClass?: string;
    balanceClass?: string;
    damageComment?: string;
    healComment?: string;
    balanceComment?: string;
  }>;
}

export function PerformanceComments({ 
  parsedData, 
  playerClassifications,
}: PerformanceCommentsProps) {
  // Encontrar jogadores com valores máximos e mínimos
  const maxDamage = Math.max(...parsedData.players.map(p => p.damage || 0));
  const maxHealing = Math.max(...parsedData.players.map(p => p.healing || 0));
  const nonZeroDamages = parsedData.players
    .filter(p => (p.damage || 0) > 0)
    .map(p => p.damage || 0);
  const minDamage = nonZeroDamages.length ? Math.min(...nonZeroDamages) : 0;
  const minBalance = Math.min(...parsedData.players.map(p => p.balance));
  
  const topDamagePlayer = parsedData.players.find(p => p.damage === maxDamage);
  const topHealingPlayer = parsedData.players.find(p => p.healing === maxHealing);
  const lowestDamagePlayer = parsedData.players.find(p => p.damage === minDamage);
  const lowestBalancePlayer = parsedData.players.find(p => p.balance === minBalance);
  
  return (
    <div className="col-span-12 grid grid-cols-12 gap-3 mt-3">
      {/* Maior causador de dano */}
      <div className="col-span-3">
        {parsedData.players.length > 0 && topDamagePlayer && (
          <div className="bg-red-50 p-2 rounded-md border border-red-100 h-full">
            <h4 className="font-bold text-red-800 text-sm flex items-center justify-between">
              <span>Maior Dano</span>
              <span className="text-xs bg-red-200 text-red-800 px-2 py-0.5 rounded-full">
                {playerClassifications[topDamagePlayer.name]?.damageClass === 'tier_s' ? 'TIER-S' : 'TIER-A'}
              </span>
            </h4>
            <div className="flex items-center justify-between my-1">
              <span className="font-medium text-sm">{topDamagePlayer.name}</span>
              <span className="font-bold text-red-700 text-sm">{topDamagePlayer.damage?.toLocaleString() || 0}</span>
            </div>
            {topDamagePlayer && (
              <div className="text-xs italic text-red-700 mt-1 border-t border-red-100 pt-1">
                {playerClassifications[topDamagePlayer.name]?.damageComment && (
                  <p className="mb-1">&quot;{playerClassifications[topDamagePlayer.name]?.damageComment}&quot;</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Melhor Healer */}
      <div className="col-span-3">
        {parsedData.players.length > 0 && topHealingPlayer && (
          <div className="bg-green-50 p-2 rounded-md border border-green-100 h-full">
            <h4 className="font-bold text-green-800 text-sm flex items-center justify-between">
              <span>Melhor Healer</span>
              <span className="text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded-full">
                {playerClassifications[topHealingPlayer.name]?.healClass === 'tier_s' ? 'TIER-S' : 'TIER-A'}
              </span>
            </h4>
            <div className="flex items-center justify-between my-1">
              <span className="font-medium text-sm">{topHealingPlayer.name}</span>
              <span className="font-bold text-green-700 text-sm">{topHealingPlayer.healing?.toLocaleString() || 0}</span>
            </div>
            {topHealingPlayer && (
              <div className="text-xs italic text-green-700 mt-1 border-t border-green-100 pt-1">
                {playerClassifications[topHealingPlayer.name]?.healComment && (
                  <p className="mb-1">&quot;{playerClassifications[topHealingPlayer.name]?.healComment}&quot;</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Menor causador de dano */}
      <div className="col-span-3">
        {parsedData.players.length > 0 && lowestDamagePlayer && (
          <div className="bg-gray-50 p-2 rounded-md border border-gray-200 h-full">
            <h4 className="font-bold text-gray-700 text-sm flex items-center justify-between">
              <span>Sem Dano</span>
              <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
                {playerClassifications[lowestDamagePlayer.name]?.damageClass === 'tier_s' 
                  ? 'TIER-S' 
                  : playerClassifications[lowestDamagePlayer.name]?.damageClass === 'tier_a' 
                    ? 'TIER-A' 
                    : 'TIER-B'}
              </span>
            </h4>
            <div className="flex items-center justify-between my-1">
              <span className="font-medium text-sm">{lowestDamagePlayer.name}</span>
              <span className="font-bold text-gray-600 text-sm">{lowestDamagePlayer.damage?.toLocaleString() || 0}</span>
            </div>
            {lowestDamagePlayer && (
              <div className="text-xs italic text-gray-500 mt-1 border-t border-gray-100 pt-1">
                {playerClassifications[lowestDamagePlayer.name]?.damageComment && (
                  <p className="mb-1">&quot;{playerClassifications[lowestDamagePlayer.name]?.damageComment}&quot;</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Menor saldo */}
      <div className="col-span-3">
        {parsedData.players.length > 0 && lowestBalancePlayer && (
          <div className="bg-yellow-50 p-2 rounded-md border border-yellow-100 h-full">
            <h4 className="font-bold text-yellow-800 text-sm flex items-center justify-between">
              <span>Inimigo do Loot</span>
              <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full">
                {playerClassifications[lowestBalancePlayer.name]?.balanceClass === 'tier_s' 
                  ? 'TIER-S' 
                  : playerClassifications[lowestBalancePlayer.name]?.balanceClass === 'tier_a' 
                    ? 'TIER-A' 
                    : 'TIER-B'}
              </span>
            </h4>
            <div className="flex items-center justify-between my-1">
              <span className="font-medium text-sm">{lowestBalancePlayer.name}</span>
              <span className="font-bold text-yellow-700 text-sm">{lowestBalancePlayer.balance?.toLocaleString() || 0}</span>
            </div>
            {lowestBalancePlayer && (
              <div className="text-xs italic text-yellow-700 mt-1 border-t border-yellow-100 pt-1">
                {playerClassifications[lowestBalancePlayer.name]?.balanceComment && (
                  <p className="mb-1">&quot;{playerClassifications[lowestBalancePlayer.name]?.balanceComment}&quot;</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}