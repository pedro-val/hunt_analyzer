"use client";

import { useEffect, useState } from 'react';
import { AddCharacterModal } from '@/components/dashboard/AddCharacterModal';
import { AddHuntModal } from '@/components/dashboard/AddHuntModal';
import { CharacterList } from '@/components/dashboard/CharacterList';
import { CharacterXPChart } from '@/components/dashboard/CharacterXPChart';
import { Character } from '@/types/character';
import Cookies from 'js-cookie';
import { API_BASE_URL } from '@/utils/env';
import { 
  IHuntSessionsByDateAndGround 
} from '@/types/huntData';

export interface CharacterData {
  name: string;
  vocation: "Druid" | "Knight" | "Paladin" | "Sorcerer" | "Monk";
  min_lvl: number;
  max_lvl: number;
};

export default function AddHuntPage() {
  const [isHuntModalOpen, setIsHuntModalOpen] = useState(false);
  const [isCharacterModalOpen, setIsCharacterModalOpen] = useState(false);
  const [showAddCharacterIndicator, setShowAddCharacterIndicator] = useState(false);
  const [characters, setCharacters] = useState<Character[]>([]);

  const fetchCharacters = async () => {
    try {
      const token = Cookies.get('auth_token');
      if (!token) throw new Error('Authentication token not found');

      const response = await fetch(`${API_BASE_URL}/characters/my_characters`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 404) {
        handleNoCharacters();
        return;
      }

      if (!response.ok) throw new Error('Failed to fetch characters');
      
      const data = await response.json();
      setCharacters(data);
      
      if (data.length === 0) {
        handleNoCharacters();
      }
    } catch (error) {
      console.error('Error fetching characters:', error);
    }
  };

  useEffect(() => {
    fetchCharacters();
  }, []);

  const handleAddCharacter = async (data: CharacterData) => {
    try {
      // Atualiza a lista de personagens após adicionar um novo
      await fetchCharacters();
      setShowAddCharacterIndicator(false);
      console.log('New character added:', data);
    } catch (error) {
      console.error('Error updating character list:', error);
    }
  };

  const handleNoCharacters = () => {
    console.log('No characters found, showing indicator');
    setShowAddCharacterIndicator(true);
    
    // Aumentando o tempo para dar mais visibilidade ao usuário
    setTimeout(() => {
      setShowAddCharacterIndicator(false);
    }, 15000); // 15 segundos para dar mais tempo ao usuário
  };

  const [selectedCharacterForChart, setSelectedCharacterForChart] = useState<string | null>(null);
  const [characterHuntData, setCharacterHuntData] = useState<{ date: string; xp: number; balance: number }[]>([]);

  // Simplified character select handler - for XP and balance data
  const handleCharacterSelect = async (characterId: string, huntData: IHuntSessionsByDateAndGround) => {
    setSelectedCharacterForChart(characterId);
    const processedData = processHuntDataForChart(huntData, characterId);
    console.log('Chart data processed:', processedData);
    setCharacterHuntData(processedData);
  };

  // Format date helper function
  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-');
    return `${day}-${month}-${year}`;
  };

  // Updated data processing - for XP and balance
  // Atualizando a função para processar o novo formato de dados
  // Updated function signature with correct type
  const processHuntDataForChart = (data: IHuntSessionsByDateAndGround, characterId: string) => {
    console.log('Processing hunt data for character:', characterId);
    console.log('Raw hunt data received:', data);
    
    // Objeto para armazenar os dados agrupados por data
    const dailyTotals: Record<string, { 
      xp: number, 
      balance: number, 
      damage: number,
      huntingGrounds: Set<string>, // Usar Set para evitar duplicatas
      damageByHuntingGround: Record<string, number> // Armazenar damage por hunting ground
    }> = {};
  
    // Processar cada dia de sessão
    data.forEach(daySession => {
      const formattedDate = formatDate(daySession.date);
      
      // Inicializa o total diário se ainda não existir
      if (!dailyTotals[formattedDate]) {
        dailyTotals[formattedDate] = { 
          xp: 0, 
          balance: 0,
          damage: 0,
          huntingGrounds: new Set<string>(),
          damageByHuntingGround: {}
        };
      }
      
      // Processar cada hunting ground do dia
      daySession.hunting_grounds.forEach(groundItem => {
        // Adicionar o nome do hunting ground à lista do dia
        dailyTotals[formattedDate].huntingGrounds.add(groundItem.name);
        
        // Inicializar o damage para este hunting ground se ainda não existir
        if (!dailyTotals[formattedDate].damageByHuntingGround[groundItem.name]) {
          dailyTotals[formattedDate].damageByHuntingGround[groundItem.name] = 0;
        }
        
        // Processar dados individuais
        if (groundItem.individual_data) {
          const individualDataArray = Array.isArray(groundItem.individual_data) 
            ? groundItem.individual_data 
            : [groundItem.individual_data];
          
          individualDataArray.forEach(indData => {
            // Adicionar XP
            dailyTotals[formattedDate].xp += indData.xp_gain || 0;
            
            // Adicionar damage ao total do dia e ao total do hunting ground específico
            const damageValue = indData.damage || 0;
            dailyTotals[formattedDate].damage += damageValue;
            dailyTotals[formattedDate].damageByHuntingGround[groundItem.name] += damageValue;
            
            // Adicionar balance (loot - supplies) se não houver dados de party hunt
            if (!groundItem.party_hunt_data || 
                (Array.isArray(groundItem.party_hunt_data) && groundItem.party_hunt_data.length === 0)) {
              const individualBalance = (indData.loot || 0) - (indData.supplies || 0);
              dailyTotals[formattedDate].balance += individualBalance;
            }
          });
        }
        
        // Processar dados de party hunt
        if (groundItem.party_hunt_data) {
          const partyDataArray = Array.isArray(groundItem.party_hunt_data) 
            ? groundItem.party_hunt_data 
            : [groundItem.party_hunt_data];
          
          partyDataArray.forEach(partyData => {
            // Adicionar balance da party hunt
            const totalBalance = partyData.balance || 0;
            const partySize = partyData.party_size || 1;
            
            // Calcula a parte individual do balance e adiciona ao total diário
            const individualBalance = Math.floor(totalBalance / partySize);
            dailyTotals[formattedDate].balance += individualBalance;
            
            // Adicionar damage do personagem atual da party hunt
            const currentCharacter = partyData.party_characters.find(
              char => char.character_pid === characterId
            );
            
            if (currentCharacter) {
              const damageValue = currentCharacter.damage || 0;
              dailyTotals[formattedDate].damage += damageValue;
              dailyTotals[formattedDate].damageByHuntingGround[groundItem.name] += damageValue;
            }
          });
        }
      });
    });
  
    // Converte o objeto de totais diários para um array para o gráfico
    const chartData = Object.keys(dailyTotals).map(date => ({
      date,
      xp: dailyTotals[date].xp,
      balance: dailyTotals[date].balance,
      damage: dailyTotals[date].damage,
      huntingGrounds: Array.from(dailyTotals[date].huntingGrounds).join(', '),
      damageByHuntingGround: dailyTotals[date].damageByHuntingGround
    }));
  
    // Ordena os dados por data
    chartData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    console.log('Processed chart data:', chartData);
    return chartData;
  };

  // Update the component to receive hunt data from props or context
  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="w-1/3 p-4 bg-gray-100">
        <h1 className="text-2xl font-bold mb-4">Adicionar Hunt</h1>
        
        {showAddCharacterIndicator && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 rounded shadow-md animate-pulse max-w-md">
            <p className="font-bold text-lg">⚠️ Atenção!</p>
            <p className="mt-2">Você precisa adicionar um personagem antes de adicionar uma hunt.</p>
            <p className="mt-1 font-semibold">Clique no botão destacado abaixo para adicionar seu primeiro personagem.</p>
            <div className="mt-3 flex justify-center">
              <svg className="w-8 h-8 text-yellow-500 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
        )}
        
        <div className="space-y-4">
          <button
            className={`w-full p-3 bg-green-600 hover:bg-green-500 rounded text-white text-lg font-medium transition-all duration-300 flex items-center justify-center ${
              showAddCharacterIndicator ? 'ring-4 ring-yellow-400 shadow-lg transform scale-105 border-2 border-yellow-500 animate-[pulse_1s_ease-in-out_infinite]' : ''
            }`}
            onClick={() => setIsCharacterModalOpen(true)}
          >
            {showAddCharacterIndicator ? (
              <>
                <svg className="w-6 h-6 mr-2 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="animate-pulse">Adicione seu primeiro personagem</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Adicionar Personagem
              </>
            )}
          </button>

          <button
            className={`w-full p-3 bg-blue-600 hover:bg-blue-500 rounded text-white transition-all duration-300 ${
              showAddCharacterIndicator ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={() => setIsHuntModalOpen(true)}
            disabled={showAddCharacterIndicator}
          >
            Adicionar Hunt
          </button>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-2/3 p-4">
        <CharacterList 
          characters={characters} 
          onCharacterSelect={handleCharacterSelect}
        />
        
        {selectedCharacterForChart && characterHuntData.length > 0 && (
          <CharacterXPChart chartData={characterHuntData} />
        )}
      </div>

      <AddHuntModal
        isOpen={isHuntModalOpen}
        onClose={() => setIsHuntModalOpen(false)}
        onNoCharacters={handleNoCharacters}
        characters={characters}
      />

      <AddCharacterModal
        isOpen={isCharacterModalOpen}
        onClose={() => setIsCharacterModalOpen(false)}
        onSubmit={handleAddCharacter}
      />
    </div>
  );
}
