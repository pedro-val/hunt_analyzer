"use client";

interface Player {
  name: string;
  loot: number;
  supplies: number;
  balance: number;
  damage?: number;
  healing?: number;
}

interface PlayerSummaryTableProps {
  players: Player[];
  totalBalance: number;
}

export function PlayerSummaryTable({ players, totalBalance }: PlayerSummaryTableProps) {
  return (
    <div className="col-span-12">
      <h3 className="font-bold text-base mb-2">Resumo dos Jogadores</h3>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="text-left p-2 border border-gray-200">Jogador</th>
              <th className="text-right p-2 border border-gray-200">Loot</th>
              <th className="text-right p-2 border border-gray-200">Supplys</th>
              <th className="text-right p-2 border border-gray-200">Saldo</th>
              <th className="text-right p-2 border border-gray-200">Dano</th>
              <th className="text-right p-2 border border-gray-200">Cura</th>
              <th className="text-right p-2 border border-gray-200">Diferença</th>
            </tr>
          </thead>
          <tbody>
            {players.map(player => {
              const balancePerPerson = Math.floor(totalBalance / players.length);
              const diff = (player.balance || 0) - balancePerPerson;
              
              // Encontrar valores mais altos e mais baixos
              const maxDamage = Math.max(...players.map(p => p.damage || 0));
              const minDamage = Math.min(...players.filter(p => p.damage !== undefined && p.damage > 0).map(p => p.damage || 0));
              const maxHealing = Math.max(...players.map(p => p.healing || 0));
              const minBalance = Math.min(...players.map(p => p.balance));
              
              const isTopDamage = player.damage === maxDamage;
              const isTopHealing = player.healing === maxHealing;
              const isLowestDamage = player.damage === minDamage;
              const isLowestBalance = player.balance === minBalance;
              
              return (
                <tr key={player.name} className={`hover:bg-gray-50 ${isLowestBalance ? "bg-gray-100" : ""}`}>
                  <td className="p-2 border border-gray-200 font-medium">
                    {player.name}
                    {isLowestBalance && <span className="ml-1 text-yellow-600" title="Problemas com dinheiro?">💸</span>}
                  </td>
                  <td className="text-right p-2 border border-gray-200">{player.loot.toLocaleString()} gp</td>
                  <td className="text-right p-2 border border-gray-200">{player.supplies.toLocaleString()} gp</td>
                  <td className={`text-right p-2 border border-gray-200 ${isLowestBalance ? "text-yellow-600 font-semibold" : ""}`}>
                    {player.balance.toLocaleString()} gp
                  </td>
                  <td className={`text-right p-2 border border-gray-200 ${isTopDamage ? "bg-red-100 font-bold" : isLowestDamage ? "bg-gray-100 font-semibold" : ""}`}>
                    {player.damage?.toLocaleString() || 0}
                    {isTopDamage && <span className="ml-1 text-red-600" title="MVP em Dano">🔥</span>}
                    {isLowestDamage && <span className="ml-1 text-gray-500" title="Estava AFK?">😴</span>}
                  </td>
                  <td className={`text-right p-2 border border-gray-200 ${isTopHealing ? "bg-green-100 font-bold" : ""}`}>
                    {player.healing?.toLocaleString() || 0}
                    {isTopHealing && <span className="ml-1 text-green-600" title="Mestre da Cura">💚</span>}
                  </td>
                  <td className={`text-right p-2 border border-gray-200 ${diff > 0 ? "text-green-600" : diff < 0 ? "text-red-600" : ""}`}>
                    {diff > 0 ? "+" : ""}{diff.toLocaleString()} gp
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}