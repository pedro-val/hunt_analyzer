import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useState, useEffect, useMemo } from 'react';
import { FiFilter, FiX } from 'react-icons/fi';
import { MdFilterAltOff } from 'react-icons/md';

// Atualizando a interface para refletir a estrutura correta dos dados
interface CharacterXPChartProps {
  chartData: { 
    date: string; 
    xp: number; 
    balance: number; 
    damage?: number;
    huntingGrounds?: string;
    // Armazenar dados de damage por hunting ground
    damageByHuntingGround?: Record<string, number>;
  }[];
}

export function CharacterXPChart({ chartData }: CharacterXPChartProps) {
  // Estado para controlar a métrica exibida - alterando para 'damage' como padrão
  const [displayMetric, setDisplayMetric] = useState<'xp' | 'balance' | 'damage'>('damage');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  // Estado para armazenar seleções temporárias no modal
  const [tempSelectedHuntingGrounds, setTempSelectedHuntingGrounds] = useState<string[]>([]);
  // Estado para armazenar seleções aplicadas
  const [selectedHuntingGrounds, setSelectedHuntingGrounds] = useState<string[]>([]);
  // Estado para controlar se há filtros ativos
  const [hasActiveFilters, setHasActiveFilters] = useState(false);
  
  // Extrair todos os hunting grounds únicos dos dados e agrupá-los por data
  const huntingGroundsByDate = useMemo(() => {
    const groundsByDate: Record<string, Set<string>> = {};
    
    chartData.forEach(item => {
      const date = item.date;
      
      if (!groundsByDate[date]) {
        groundsByDate[date] = new Set<string>();
      }
      
      // Extrair hunting grounds da string
      if (item.huntingGrounds) {
        item.huntingGrounds.split(', ').forEach(ground => {
          groundsByDate[date].add(ground);
        });
      }
      
      // Também extrair hunting grounds do objeto damageByHuntingGround
      if (item.damageByHuntingGround) {
        Object.keys(item.damageByHuntingGround).forEach(ground => {
          groundsByDate[date].add(ground);
        });
      }
    });
    
    // Converter para o formato final
    return Object.entries(groundsByDate)
      .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime()) // Ordenar por data (mais recente primeiro)
      .map(([date, grounds]) => ({
        date,
        grounds: Array.from(grounds)
      }));
  }, [chartData]);
  
  // Lista completa de todos os hunting grounds únicos
  const availableHuntingGrounds = useMemo(() => {
    const allGrounds = new Set<string>();
    huntingGroundsByDate.forEach(dateGroup => {
      dateGroup.grounds.forEach(ground => {
        allGrounds.add(ground);
      });
    });
    return Array.from(allGrounds);
  }, [huntingGroundsByDate]);

  // Quando o usuário muda para visualização de dano, verificar se deve mostrar o filtro
  useEffect(() => {
    if (displayMetric === 'damage') {
      // Inicializar seleções temporárias com as seleções atuais
      setTempSelectedHuntingGrounds(selectedHuntingGrounds);
    } else {
      // Limpar filtros quando não estiver no modo damage
      setSelectedHuntingGrounds([]);
      setTempSelectedHuntingGrounds([]);
      setHasActiveFilters(false);
    }
  }, [displayMetric]);

  // Verificar se há filtros ativos
  useEffect(() => {
    setHasActiveFilters(selectedHuntingGrounds.length > 0);
  }, [selectedHuntingGrounds]);
  
  // Abrir modal de filtro
  const openFilterModal = () => {
    setTempSelectedHuntingGrounds([...selectedHuntingGrounds]);
    setIsFilterModalOpen(true);
  };
  
  // Fechar modal de filtro sem aplicar
  const closeFilterModal = () => {
    setIsFilterModalOpen(false);
  };
  
  // Aplicar filtros
  const applyFilters = () => {
    setSelectedHuntingGrounds([...tempSelectedHuntingGrounds]);
    setIsFilterModalOpen(false);
  };
  
  // Resetar filtros
  const resetFilters = () => {
    setSelectedHuntingGrounds([]);
    setTempSelectedHuntingGrounds([]);
    setHasActiveFilters(false);
    setIsFilterModalOpen(false);
  };
  
  // Toggle hunting ground selection (versão temporária para o modal)
  const toggleHuntingGround = (ground: string) => {
    if (tempSelectedHuntingGrounds.includes(ground)) {
      // Se já está selecionado, remove
      setTempSelectedHuntingGrounds(tempSelectedHuntingGrounds.filter(g => g !== ground));
    } else {
      // Se não está selecionado, adiciona
      setTempSelectedHuntingGrounds([...tempSelectedHuntingGrounds, ground]);
    }
  };

  // Selecionar ou desselecionar todos os hunting grounds
  const toggleAllHuntingGrounds = () => {
    if (tempSelectedHuntingGrounds.length === availableHuntingGrounds.length) {
      // Se todos estão selecionados, desseleciona todos
      setTempSelectedHuntingGrounds([]);
    } else {
      // Se nem todos estão selecionados, seleciona todos
      setTempSelectedHuntingGrounds([...availableHuntingGrounds]);
    }
  };

  // Selecionar ou desselecionar todos os hunting grounds de uma data específica
  const toggleDateHuntingGrounds = (date: string, grounds: string[]) => {
    // Verificar se todos os grounds desta data já estão selecionados
    const allSelected = grounds.every(ground => tempSelectedHuntingGrounds.includes(ground));
    
    if (allSelected) {
      // Se todos já estão selecionados, remover todos desta data
      setTempSelectedHuntingGrounds(
        tempSelectedHuntingGrounds.filter(ground => !grounds.includes(ground))
      );
    } else {
      // Se nem todos estão selecionados, adicionar os que faltam
      const newSelected = [...tempSelectedHuntingGrounds];
      grounds.forEach(ground => {
        if (!newSelected.includes(ground)) {
          newSelected.push(ground);
        }
      });
      setTempSelectedHuntingGrounds(newSelected);
    }
  };

  // Format large numbers to millions/thousands with 1 decimal place
  const formatYAxis = (value: number) => {
    // Dividindo por 1000 para simplificar a visualização
    const simplifiedValue = value / 1000;
    return simplifiedValue.toLocaleString();
  };

  // Format tooltip values
  const formatTooltipValue = (value: number, name: string) => {
    if (name === 'xp') {
      return `${value.toLocaleString()} XP`;
    } else if (name === 'balance') {
      return `${value.toLocaleString()} gp`;
    } else if (name === 'damage' || name.startsWith('damage_')) {
      return `${value.toLocaleString()} damage`;
    }
    return value.toLocaleString();
  };

  // Preparar dados para o gráfico com base no modo de exibição e filtros
  const preparedChartData = useMemo(() => {
    if (displayMetric !== 'damage') {
      // Para XP e Balance, retorna os dados originais
      return chartData;
    }
    
    // Para Damage, verificamos se há hunting grounds selecionados
    if (selectedHuntingGrounds.length === 0) {
      // Se nenhum hunting ground estiver selecionado, retorna o damage total
      return chartData;
    }
    
    // Para Damage com hunting grounds selecionados
    return chartData.map(dayData => {
      const filteredData = { ...dayData };
      
      // Se temos dados de damage por hunting ground
      if (dayData.damageByHuntingGround) {
        // Filtrar apenas os hunting grounds selecionados
        let totalDamage = 0;
        
        Object.keys(dayData.damageByHuntingGround).forEach(ground => {
          if (selectedHuntingGrounds.includes(ground)) {
            totalDamage += dayData.damageByHuntingGround![ground];
          }
        });
        
        // Atualizar o damage total com base nos hunting grounds selecionados
        filteredData.damage = totalDamage;
      }
      
      return filteredData;
    });
  }, [chartData, displayMetric, selectedHuntingGrounds]);

  // Custom tooltip component
  const CustomTooltip = ({ 
    active, 
    payload, 
    label 
  }: {
    active?: boolean;
    payload?: Array<{
      value: number;
      name: string;
      color: string;
      payload: {
        huntingGrounds?: string;
        damageByHuntingGround?: Record<string, number>;
      };
    }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-md">
          <p className="font-bold text-gray-800">{label}</p>
          
          {/* Exibir hunting grounds se disponíveis */}
          {data.huntingGrounds && displayMetric !== 'damage' && (
            <p className="text-sm text-gray-600 mb-2">
              <span className="font-medium">Hunting Grounds:</span> {data.huntingGrounds}
            </p>
          )}
          
          {/* Para o modo de damage, mostrar o damage por hunting ground */}
          {displayMetric === 'damage' && data.damageByHuntingGround && (
            <div className="text-sm text-gray-600 mb-2">
              <p className="font-medium mb-1">Hunting Grounds:</p>
              <ul className="pl-4">
                {Object.entries(data.damageByHuntingGround)
                  .filter(([ground]) => selectedHuntingGrounds.length === 0 || selectedHuntingGrounds.includes(ground))
                  .map(([ground, dmg], idx) => (
                    <li key={idx} className="flex justify-between">
                      <span>{ground}:</span>
                      <span className="ml-2 font-medium">{dmg.toLocaleString()}</span>
                    </li>
                  ))}
              </ul>
            </div>
          )}
          
          {payload.map((entry: { color: string; name: string; value: number }, index: number) => (
            <p key={`item-${index}`} className="text-sm" style={{ color: entry.color }}>
              <span className="font-medium">
                {entry.name === 'XP' ? 'XP Gain' : 
                 entry.name === 'Balance' ? 'Balance' : 
                 entry.name === 'Damage' ? 'Damage Total' : 
                 entry.name.startsWith('damage_') ? `Damage (${entry.name.replace('damage_', '')})` : 
                 entry.name}:
              </span> {formatTooltipValue(entry.value, entry.name.toLowerCase())}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Gerar cores diferentes para cada hunting ground
  const getColorForHuntingGround = (index: number) => {
    const colors = [
      '#10b981', // Verde
      '#b7791f', // Dourado escuro
      '#3b82f6', // Azul
      '#ef4444', // Vermelho
      '#8b5cf6', // Roxo
      '#f59e0b', // Laranja
      '#ec4899', // Rosa
      '#14b8a6', // Turquesa
      '#6366f1', // Índigo
      '#84cc16', // Lima
    ];
    
    return colors[index % colors.length];
  };

  return (
    <div className="mt-8 bg-white p-6 rounded-lg shadow-md relative">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Evolução do Personagem</h2>
      
      {/* Toggle buttons para métricas */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2">
          <button 
            onClick={() => setDisplayMetric('xp')}
            className={`px-3 py-1 text-sm rounded ${displayMetric === 'xp' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            XP Only
          </button>
          <button 
            onClick={() => setDisplayMetric('balance')}
            className={`px-3 py-1 text-sm rounded ${displayMetric === 'balance' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Balance Only
          </button>
          <button 
            onClick={() => setDisplayMetric('damage')}
            className={`px-3 py-1 text-sm rounded ${displayMetric === 'damage' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Damage
          </button>
        </div>
        
        {/* Botões de filtro - apenas visíveis no modo damage */}
        {displayMetric === 'damage' && (
          <div className="flex space-x-2">
            <button
              onClick={openFilterModal}
              className={`flex items-center px-3 py-1 text-sm rounded ${
                hasActiveFilters ? 'bg-blue-100 text-blue-700 border border-blue-300' : 'bg-gray-200 text-gray-700'
              }`}
            >
              <FiFilter className="mr-1" />
              {hasActiveFilters ? `Filtros (${selectedHuntingGrounds.length})` : 'Filtrar'}
            </button>
            
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="flex items-center px-3 py-1 text-sm rounded bg-red-100 text-red-700 border border-red-300"
              >
                <MdFilterAltOff className="mr-1" />
                Limpar
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* Modal de filtro */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            {/* Cabeçalho do modal */}
            <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-medium text-gray-900">Filtrar por Hunting Ground</h3>
              <button 
                onClick={closeFilterModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <FiX size={24} />
              </button>
            </div>
            
            {/* Corpo do modal */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-gray-500">
                  {tempSelectedHuntingGrounds.length} de {availableHuntingGrounds.length} selecionados
                </span>
                <button 
                  onClick={toggleAllHuntingGrounds}
                  className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded"
                >
                  {tempSelectedHuntingGrounds.length === availableHuntingGrounds.length 
                    ? 'Desselecionar Todos' 
                    : 'Selecionar Todos'}
                </button>
              </div>
              
              {/* Lista de hunting grounds agrupados por data */}
              <div className="space-y-4">
                {huntingGroundsByDate.map(({ date, grounds }) => (
                  <div key={date} className="border border-gray-200 rounded-md p-3">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-sm font-semibold text-gray-700">{date}</h4>
                      <button 
                        onClick={() => toggleDateHuntingGrounds(date, grounds)}
                        className="text-xs px-2 py-0.5 bg-gray-100 hover:bg-gray-200 rounded"
                      >
                        {grounds.every(g => tempSelectedHuntingGrounds.includes(g)) 
                          ? 'Desselecionar Data' 
                          : 'Selecionar Data'}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {grounds.map((ground, index) => (
                        <button
                          key={`${date}-${ground}`}
                          onClick={() => toggleHuntingGround(ground)}
                          className={`text-xs px-2 py-1 rounded-full ${
                            tempSelectedHuntingGrounds.includes(ground) 
                              ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                              : 'bg-gray-100 text-gray-800 border border-gray-300'
                          }`}
                          style={{ 
                            borderColor: tempSelectedHuntingGrounds.includes(ground) ? getColorForHuntingGround(index) : undefined,
                            color: tempSelectedHuntingGrounds.includes(ground) ? getColorForHuntingGround(index) : undefined
                          }}
                        >
                          {ground}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Rodapé do modal com botões de ação */}
            <div className="border-t border-gray-200 px-6 py-4 flex justify-end space-x-3">
              <button
                onClick={resetFilters}
                className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200"
              >
                Resetar Filtros
              </button>
              <button
                onClick={closeFilterModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={applyFilters}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Aplicar Filtros
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Gráfico */}
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart 
            data={preparedChartData}
            margin={{ top: 20, right: 40, left: 40, bottom: 40 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e0" opacity={0.5} />
            <XAxis 
              dataKey="date" 
              padding={{ left: 30, right: 30 }}
              tick={{ fontSize: 12, fill: "#2d3748", fontWeight: 500 }}
              tickLine={{ stroke: "#2d3748", strokeWidth: 1.5 }}
              axisLine={{ stroke: "#2d3748", strokeWidth: 2 }}
              label={{ 
                value: 'Data', 
                position: 'insideBottomRight', 
                offset: -10,
                fill: "#1a202c",
                fontSize: 14,
                fontWeight: 600
              }}
            />
            <YAxis 
              padding={{ top: 20, bottom: 20 }}
              tick={{ fontSize: 12, fill: "#2d3748", fontWeight: 500 }}
              tickLine={{ stroke: "#2d3748", strokeWidth: 1.5 }}
              axisLine={{ stroke: "#2d3748", strokeWidth: 2 }}
              tickFormatter={formatYAxis}
              label={{ 
                value: displayMetric === 'damage' ? 'Dano (K)' : 'Valores (K)', 
                angle: -90, 
                position: 'insideLeft',
                fill: "#1a202c",
                fontSize: 14,
                fontWeight: 600
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: 15 }}
              iconSize={12}
              iconType="circle"
              formatter={(value) => <span className="text-sm font-medium">{value}</span>}
            />
            
            {displayMetric === 'xp' && (
              <Line 
                type="monotone" 
                dataKey="xp" 
                name="XP" 
                stroke="#10b981" 
                strokeWidth={4}
                dot={{ r: 5, strokeWidth: 3, fill: "#fff", stroke: "#10b981" }}
                activeDot={{ r: 8, strokeWidth: 3, fill: "#10b981" }}
                animationDuration={1500}
                animationEasing="ease-in-out"
              />
            )}
            
            {displayMetric === 'balance' && (
              <Line 
                type="monotone" 
                dataKey="balance" 
                name="Balance" 
                stroke="#b7791f" 
                strokeWidth={4}
                dot={{ r: 5, strokeWidth: 3, fill: "#fff", stroke: "#b7791f" }}
                activeDot={{ r: 8, strokeWidth: 3, fill: "#b7791f" }}
                animationDuration={1500}
                animationEasing="ease-in-out"
              />
            )}
            
            {displayMetric === 'damage' && (
              <Line 
                type="monotone" 
                dataKey="damage" 
                name="Damage" 
                stroke="#ef4444" 
                strokeWidth={4}
                dot={{ r: 5, strokeWidth: 3, fill: "#fff", stroke: "#ef4444" }}
                activeDot={{ r: 8, strokeWidth: 3, fill: "#ef4444" }}
                animationDuration={1500}
                animationEasing="ease-in-out"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}