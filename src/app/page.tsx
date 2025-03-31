"use client";

import { useHuntAnalyzer } from "@/hooks/useHuntAnalyzer";

export default function App() {
  const {
    inputText,
    setInputText,
    parsedData,
    error,
    handleAnalyze,
    calculatePayments,
    classifyPerformance
  } = useHuntAnalyzer();

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="mx-auto">
        <h1 className="text-2xl font-bold mb-4">Analisador de Hunt</h1>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-4">
          <div className="flex flex-row">
            {/* Lado esquerdo - Entrada de texto (25%) */}
            <div className="w-1/4 p-4 border-r border-gray-200">
              <h2 className="text-lg font-semibold mb-2">Dados da Hunt</h2>
              <textarea
                className="w-full h-[calc(100vh-180px)] p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                placeholder="Cole seus dados de hunt aqui..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              ></textarea>
              <button 
                onClick={handleAnalyze}
                className="mt-2 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors font-medium text-sm w-full"
              >
                Analisar Hunt
              </button>
            </div>
            
            {/* Lado direito - Interpretação (75%) */}
            <div className="w-3/4 p-4 bg-gray-50">
              <h2 className="text-lg font-semibold mb-2">Análise da Hunt</h2>
              <div className="h-[calc(100vh-160px)] p-4 border border-gray-300 rounded-md bg-white overflow-auto">
                {error && (
                  <div className="text-red-500 mb-3 p-2 bg-red-50 border border-red-200 rounded-md text-sm">
                    <strong>Erro:</strong> {error}
                  </div>
                )}
                
                {parsedData ? (
                  <div className="grid grid-cols-12 gap-4">
                    {/* Resumo da Sessão - Primeira Linha */}
                    <div className="col-span-12 bg-orange-50 p-3 rounded-md border border-orange-100">
                      <h3 className="font-bold text-base mb-2 text-orange-800">Resumo da Sessão</h3>
                      <div className="grid grid-cols-6 gap-2 text-sm w-full">
                        <p><span className="font-medium">Data:</span> {parsedData.dateFrom} até {parsedData.dateTo}</p>
                        <p><span className="font-medium">Duração:</span> {parsedData.duration}</p>
                        <p><span className="font-medium">Tipo de Loot:</span> {parsedData.lootType}</p>
                        <p><span className="font-medium">Loot Total:</span> {parsedData.totalLoot.toLocaleString()} gp</p>
                        <p><span className="font-medium">Supplys Totais:</span> {parsedData.totalSupplies.toLocaleString()} gp</p>
                        <p><span className="font-medium">Saldo Total:</span> {parsedData.totalBalance.toLocaleString()} gp</p>
                      </div>
                    </div>
                    
                    {/* Tabela de Resumo dos Jogadores - Segunda Linha */}
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
                            {/* Linhas dos jogadores permanecem as mesmas */}
                            {parsedData.players.map(player => {
                              const balancePerPerson = Math.floor(parsedData.totalBalance / parsedData.players.length);
                              const diff = (player.balance || 0) - balancePerPerson;
                              
                              // Encontrar valores mais altos e mais baixos
                              const maxDamage = Math.max(...parsedData.players.map(p => p.damage || 0));
                              const minDamage = Math.min(...parsedData.players.filter(p => p.damage !== undefined && p.damage > 0).map(p => p.damage || 0));
                              const maxHealing = Math.max(...parsedData.players.map(p => p.healing || 0));
                              const minBalance = Math.min(...parsedData.players.map(p => p.balance));
                              
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
                    
                    {/* Seção de Prêmios - Terceira Linha - Todos os prêmios lado a lado */}
                    <div className="col-span-12 grid grid-cols-12 gap-3 mt-3">
                      {/* Maior causador de dano */}
                      <div className="col-span-3">
                        {parsedData.players.length > 0 && (() => {
                          const maxDamage = Math.max(...parsedData.players.map(p => p.damage || 0));
                          const topDamagePlayer = parsedData.players.find(p => p.damage === maxDamage);
                          const classifications = classifyPerformance(parsedData);
                          const playerClass = topDamagePlayer ? classifications[topDamagePlayer.name] : null;
                          const tierClass = playerClass?.damageClass || 'tier_a';
                          const comment = playerClass?.damageComment || '';
                          
                          return (
                            <div className="bg-red-50 p-2 rounded-md border border-red-100 h-full">
                              <h4 className="font-bold text-red-800 text-sm flex items-center justify-between">
                                <span>Maior Dano</span>
                                <span className="text-xs bg-red-200 text-red-800 px-2 py-0.5 rounded-full">
                                  {tierClass === 'tier_s' ? 'TIER-S' : 'TIER-A'}
                                </span>
                              </h4>
                              <div className="flex items-center justify-between my-1">
                                <span className="font-medium text-sm">{topDamagePlayer?.name}</span>
                                <span className="font-bold text-red-700 text-sm">{topDamagePlayer?.damage?.toLocaleString() || 0}</span>
                              </div>
                              {comment && (
                                <p className="text-xs italic text-red-700 mt-1 border-t border-red-100 pt-1">
                                  &quot;{comment}&quot;
                                </p>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                      
                      {/* Melhor Healer */}
                      <div className="col-span-3">
                        {parsedData.players.length > 0 && (() => {
                          const maxHealing = Math.max(...parsedData.players.map(p => p.healing || 0));
                          const topHealingPlayer = parsedData.players.find(p => p.healing === maxHealing);
                          const classifications = classifyPerformance(parsedData);
                          const playerClass = topHealingPlayer ? classifications[topHealingPlayer.name] : null;
                          const tierClass = playerClass?.healClass || 'tier_a';
                          const comment = playerClass?.healComment || '';
                          
                          return (
                            <div className="bg-green-50 p-2 rounded-md border border-green-100 h-full">
                              <h4 className="font-bold text-green-800 text-sm flex items-center justify-between">
                                <span>Melhor Healer</span>
                                <span className="text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded-full">
                                  {tierClass === 'tier_s' ? 'TIER-S' : 'TIER-A'}
                                </span>
                              </h4>
                              <div className="flex items-center justify-between my-1">
                                <span className="font-medium text-sm">{topHealingPlayer?.name}</span>
                                <span className="font-bold text-green-700 text-sm">{topHealingPlayer?.healing?.toLocaleString() || 0}</span>
                              </div>
                              {comment && (
                                <p className="text-xs italic text-green-700 mt-1 border-t border-green-100 pt-1">
                                  &quot;{comment}&quot;
                                </p>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                      
                      {/* Menor causador de dano */}
                      <div className="col-span-3">
                        {parsedData.players.length > 0 && (() => {
                          const nonZeroDamages = parsedData.players
                            .filter(p => (p.damage || 0) > 0)
                            .map(p => p.damage || 0);
                          const minDamage = nonZeroDamages.length ? Math.min(...nonZeroDamages) : 0;
                          const lowestDamagePlayer = parsedData.players.find(p => p.damage === minDamage);
                          const classifications = classifyPerformance(parsedData);
                          const playerClass = lowestDamagePlayer ? classifications[lowestDamagePlayer.name] : null;
                          const tierClass = playerClass?.damageClass || 'tier_b';
                          const comment = playerClass?.damageComment || '';
                          
                          return (
                            <div className="bg-gray-50 p-2 rounded-md border border-gray-200 h-full">
                              <h4 className="font-bold text-gray-700 text-sm flex items-center justify-between">
                                <span>Sem Dano</span>
                                <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
                                  {tierClass === 'tier_s' ? 'TIER-S' : tierClass === 'tier_a' ? 'TIER-A' : 'TIER-B'}
                                </span>
                              </h4>
                              <div className="flex items-center justify-between my-1">
                                <span className="font-medium text-sm">{lowestDamagePlayer?.name}</span>
                                <span className="font-bold text-gray-600 text-sm">{lowestDamagePlayer?.damage?.toLocaleString() || 0}</span>
                              </div>
                              {comment && (
                                <p className="text-xs italic text-gray-500 mt-1 border-t border-gray-100 pt-1">
                                  &quot;{comment}&quot;
                                </p>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                      
                      {/* Menor saldo */}
                      <div className="col-span-3">
                        {parsedData.players.length > 0 && (() => {
                          const minBalance = Math.min(...parsedData.players.map(p => p.balance));
                          const lowestBalancePlayer = parsedData.players.find(p => p.balance === minBalance);
                          const classifications = classifyPerformance(parsedData);
                          const playerClass = lowestBalancePlayer ? classifications[lowestBalancePlayer.name] : null;
                          const tierClass = playerClass?.balanceClass || 'tier_b';
                          const comment = playerClass?.balanceComment || '';
                          
                          return (
                            <div className="bg-yellow-50 p-2 rounded-md border border-yellow-100 h-full">
                              <h4 className="font-bold text-yellow-800 text-sm flex items-center justify-between">
                                <span>Inimigo do Loot</span>
                                <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full">
                                  {tierClass === 'tier_s' ? 'TIER-S' : tierClass === 'tier_a' ? 'TIER-A' : 'TIER-B'}
                                </span>
                              </h4>
                              <div className="flex items-center justify-between my-1">
                                <span className="font-medium text-sm">{lowestBalancePlayer?.name}</span>
                                <span className="font-bold text-yellow-700 text-sm">{lowestBalancePlayer?.balance?.toLocaleString() || 0}</span>
                              </div>
                              {comment && (
                                <p className="text-xs italic text-yellow-700 mt-1 border-t border-yellow-100 pt-1">
                                  &quot;{comment}&quot;
                                </p>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                    
                    {/* Instruções de Pagamento - Quarta Linha */}
                    <div className="col-span-12 grid grid-cols-12 gap-3 mt-3">
                      <div className="col-span-8">
                        <h3 className="font-bold text-base mb-2">Instruções de Pagamento</h3>
                        <div className="bg-green-50 p-3 rounded-md border border-green-100">
                          {calculatePayments(parsedData).length > 0 ? (
                            calculatePayments(parsedData).map((payment, index) => (
                              <div key={index} className="mb-1 pb-1 border-b border-green-100 last:border-0 last:mb-0 last:pb-0 text-sm flex items-center justify-between relative">
                                <p>
                                  <span className="font-medium">{payment.from}</span> deve pagar <span className="font-medium">{payment.amount.toLocaleString()} gp</span> para <span className="font-medium">{payment.to}</span>
                                </p>
                                <div className="flex items-center">
                                  <span 
                                    id={`copy-msg-${index}`} 
                                    className="text-xs text-green-700 mr-2 opacity-0 transition-opacity duration-300 ease-in-out"
                                  >
                                    transfer {payment.amount} to {payment.to} copiado!
                                  </span>
                                  <button 
                                    onClick={() => {
                                      navigator.clipboard.writeText(`transfer ${payment.amount} to ${payment.to}`);
                                      
                                      // Mostrar a mensagem copiada com transição
                                      const msg = document.getElementById(`copy-msg-${index}`);
                                      const btn = document.getElementById(`copy-btn-${index}`);
                                      
                                      if (msg) {
                                        msg.classList.remove('opacity-0');
                                        msg.classList.add('opacity-100');
                                        
                                        setTimeout(() => {
                                          msg.classList.remove('opacity-100');
                                          msg.classList.add('opacity-0');
                                        }, 2000);
                                      }
                                      
                                      if (btn) {
                                        btn.classList.add('bg-green-300');
                                        setTimeout(() => btn.classList.remove('bg-green-300'), 500);
                                      }
                                    }}
                                    id={`copy-btn-${index}`}
                                    className="px-2 py-1 bg-green-200 hover:bg-green-300 text-green-800 rounded-md text-xs transition-colors flex items-center"
                                    title="Copiar comando de transferência"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                    </svg>
                                    Copiar
                                  </button>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-gray-600">Nenhum pagamento necessário - todos contribuíram igualmente.</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="col-span-4">
                        <h3 className="font-bold text-base mb-2">Resumo</h3>
                        <div className="p-3 border border-gray-200 rounded-md bg-gray-50 text-sm w-full">
                          <p><span className="font-medium">Saldo total:</span> {parsedData.totalBalance.toLocaleString()} gp</p>
                          <p><span className="font-medium">Número de pessoas:</span> {parsedData.players.length}</p>
                          <p><span className="font-medium">Saldo por pessoa:</span> {Math.floor(parsedData.totalBalance / parsedData.players.length).toLocaleString()} gp</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p>Digite os dados da hunt na área de entrada e clique em &quot;Analisar Hunt&quot; para ver os resultados</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );}
