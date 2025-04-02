"use client";

interface PlayerPerformanceProps {
  playerName: string;
  classification: {
    damageClass?: string;
    healClass?: string;
    balanceClass?: string;
    damageComment?: string;
    healComment?: string;
    balanceComment?: string;
  };
}

export function PlayerPerformance({ playerName, classification }: PlayerPerformanceProps) {
  const hasComments = classification.damageComment || 
                     classification.healComment || 
                     classification.balanceComment;
  
  if (!hasComments) return null;
  
  return (
    <div className="mb-3 p-3 bg-gray-50 rounded-md border border-gray-200">
      <h4 className="font-medium text-base mb-2">{playerName}</h4>
      
      {classification.damageComment && (
        <div className="mb-2">
          <span className={`inline-block px-2 py-1 text-xs rounded-full mr-2 ${
            classification.damageClass === 'tier_s' 
              ? 'bg-red-100 text-red-800' 
              : classification.damageClass === 'tier_a'
                ? 'bg-orange-100 text-orange-800'
                : 'bg-gray-100 text-gray-800'
          }`}>
            {classification.damageClass === 'tier_s' 
              ? '🔥 Top Damage' 
              : classification.damageClass === 'tier_a'
                ? '👍 Good Damage'
                : '👎 Low Damage'}
          </span>
          <p className="text-sm italic mt-1">&quot;{classification.damageComment}&quot;</p>
        </div>
      )}
      
      {classification.healComment && (
        <div className="mb-2">
          <span className={`inline-block px-2 py-1 text-xs rounded-full mr-2 ${
            classification.healClass === 'tier_s' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-emerald-100 text-emerald-800'
          }`}>
            {classification.healClass === 'tier_s' ? '💚 Top Healer' : '🌿 Good Healer'}
          </span>
          <p className="text-sm italic mt-1">&quot;{classification.healComment}&quot;</p>
        </div>
      )}
      
      {classification.balanceComment && (
        <div>
          <span className={`inline-block px-2 py-1 text-xs rounded-full mr-2 ${
            classification.balanceClass === 'tier_s' 
              ? 'bg-yellow-100 text-yellow-800' 
              : classification.balanceClass === 'tier_a'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-gray-100 text-gray-800'
          }`}>
            {classification.balanceClass === 'tier_s' 
              ? '💸 Profit Issues' 
              : classification.balanceClass === 'tier_a'
                ? '⚠️ Low Profit'
                : '🪙 Average Profit'}
          </span>
          <p className="text-sm italic mt-1">&quot;{classification.balanceComment}&quot;</p>
        </div>
      )}
    </div>
  );
}