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
import { VerifyCharacterModal } from '@/components/dashboard/VerifyCharacterModal';

export interface CharacterData {
  name: string;
  vocation: "Druid" | "Knight" | "Paladin" | "Sorcerer" | "Monk";
  min_lvl: number;
  max_lvl: number;
};

// Função para formatar a data
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
};

export default function AddHuntPage() {
  const [isHuntModalOpen, setIsHuntModalOpen] = useState(false);
  const [isCharacterModalOpen, setIsCharacterModalOpen] = useState(false);
  const [showAddCharacterIndicator, setShowAddCharacterIndicator] = useState(false);
  const [characters, setCharacters] = useState<Character[]>([]);
  
  // Estados para gerenciar a verificação de personagem
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [selectedCharacterForVerification, setSelectedCharacterForVerification] = useState<Character | null>(null);
  
  // Estados para o gráfico
  const [selectedCharacterForChart, setSelectedCharacterForChart] = useState<string | null>(null);
  const [characterHuntData, setCharacterHuntData] = useState<{ date: string; xp: number; balance: number }[]>([]);

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

  const handleNoVerifiedCharacters = () => {
    console.log('No verified characters found, showing indicator');
    setIsCharacterModalOpen(true);
  };

  // Função para processar os dados de hunt para o gráfico
  const processHuntDataForChart = (data: IHuntSessionsByDateAndGround, characterId: string) => {
    console.log('Processing hunt data for character:', characterId);
    console.log('Raw hunt data received:', data);
    
    // Objeto para armazenar os dados agrupados por data e hunting ground
    const huntingGroundsByDate: Record<string, Record<string, { 
      xp: number, 
      balance: number, 
      damage: number,
      huntCount: number // Contador para número de hunts
    }>> = {};
  
    // Processar cada dia de sessão
    data.forEach(daySession => {
      const formattedDate = formatDate(daySession.date);
      
      // Inicializa o registro para este dia se ainda não existir
      if (!huntingGroundsByDate[formattedDate]) {
        huntingGroundsByDate[formattedDate] = {};
      }
      
      // Processar cada hunting ground do dia
      daySession.hunting_grounds.forEach(groundItem => {
        const groundName = groundItem.name;
        
        // Inicializa o registro para este hunting ground se ainda não existir
        if (!huntingGroundsByDate[formattedDate][groundName]) {
          huntingGroundsByDate[formattedDate][groundName] = { 
            xp: 0, 
            balance: 0,
            damage: 0,
            huntCount: 0
          };
        }
        
        // Processar dados individuais
        if (groundItem.individual_data) {
          const individualDataArray = Array.isArray(groundItem.individual_data) 
            ? groundItem.individual_data 
            : [groundItem.individual_data];
          
          individualDataArray.forEach(indData => {
            // Incrementar contador de hunts
            huntingGroundsByDate[formattedDate][groundName].huntCount++;
            
            // Adicionar XP
            huntingGroundsByDate[formattedDate][groundName].xp += indData.xp_gain || 0;
            
            // Adicionar damage
            huntingGroundsByDate[formattedDate][groundName].damage += indData.damage || 0;
            
            // Para hunt individual, o balance é loot - supplies
            // Só adicionar se não houver party hunt data para este hunting ground
            if (!groundItem.party_hunt_data || 
                (Array.isArray(groundItem.party_hunt_data) && groundItem.party_hunt_data.length === 0)) {
              const individualBalance = (indData.loot || 0) - (indData.supplies || 0);
              huntingGroundsByDate[formattedDate][groundName].balance += individualBalance;
            }
          });
        }
        
        // Processar dados de party hunt
        if (groundItem.party_hunt_data && 
            (!Array.isArray(groundItem.party_hunt_data) || groundItem.party_hunt_data.length > 0)) {
          const partyDataArray = Array.isArray(groundItem.party_hunt_data) 
            ? groundItem.party_hunt_data 
            : [groundItem.party_hunt_data];
          
          partyDataArray.forEach(partyData => {
            // Incrementar contador de hunts
            huntingGroundsByDate[formattedDate][groundName].huntCount++;
            
            // Encontrar o personagem atual na party
            const currentCharacter = partyData.party_characters.find(
              char => char.character_pid === characterId
            );
            
            if (currentCharacter) {
              // Adicionar damage do personagem atual da party hunt
              huntingGroundsByDate[formattedDate][groundName].damage += currentCharacter.damage || 0;
              
              // Para party hunt, usar o balance do personagem diretamente
              huntingGroundsByDate[formattedDate][groundName].balance += currentCharacter.balance || 0;
            }
          });
        }
      });
    });
    
    // Converter para o formato esperado pelo gráfico, agregando por data
    const dailyTotals: Record<string, { 
      xp: number, 
      balance: number, 
      damage: number,
      huntingGrounds: Set<string>,
      damageByHuntingGround: Record<string, number>
    }> = {};
    
    // Agregar dados por data
    Object.entries(huntingGroundsByDate).forEach(([date, grounds]) => {
      dailyTotals[date] = {
        xp: 0,
        balance: 0,
        damage: 0,
        huntingGrounds: new Set<string>(),
        damageByHuntingGround: {}
      };
      
      // Somar dados de todos os hunting grounds para esta data
      Object.entries(grounds).forEach(([groundName, data]) => {
        dailyTotals[date].xp += data.xp;
        dailyTotals[date].balance += data.balance;
        dailyTotals[date].damage += data.damage;
        dailyTotals[date].huntingGrounds.add(groundName);
        dailyTotals[date].damageByHuntingGround[groundName] = data.damage;
      });
    });
    
    // Converter para o formato final do gráfico
    const chartData = Object.entries(dailyTotals).map(([date, data]) => ({
      date,
      xp: data.xp,
      balance: data.balance,
      damage: data.damage,
      huntingGrounds: Array.from(data.huntingGrounds).join(', '),
      damageByHuntingGround: data.damageByHuntingGround
    }));
    
    // Ordenar por data
    chartData.sort((a, b) => {
      const dateA = new Date(a.date.split('/').reverse().join('-'));
      const dateB = new Date(b.date.split('/').reverse().join('-'));
      return dateA.getTime() - dateB.getTime();
    });
    
    console.log('Processed chart data:', chartData);
    return chartData;
  };

  // Função para lidar com a verificação bem-sucedida
  const handleVerificationSuccess = async () => {
    // Atualizar a lista de personagens para refletir o novo status de verificação
    await fetchCharacters();
    
    // Fechar o modal de verificação
    setIsVerifyModalOpen(false);
    setSelectedCharacterForVerification(null);
  };

  // Função para lidar com a seleção de personagem
  const handleCharacterSelect = async (characterId: string) => {
    // Encontrar o personagem selecionado
    const selectedCharacter = characters.find(char => char.pid === characterId);
    
    if (selectedCharacter && !selectedCharacter.is_verified) {
      // Se o personagem não estiver verificado, abrir o modal de verificação
      console.log('Character not verified, opening verification modal');
      setSelectedCharacterForVerification(selectedCharacter);
      setIsVerifyModalOpen(true);
    } else {
      // Se o personagem estiver verificado, buscar os dados de hunt
      setSelectedCharacterForChart(characterId);
      
      try {
        const token = Cookies.get('auth_token');
        if (!token) throw new Error('Authentication token not found');
        
        const response = await fetch(`${API_BASE_URL}/hunt-sessions/by-character`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ personal_character_pid: characterId })
        });

        if (!response.ok) throw new Error('Failed to fetch hunt sessions');
        
        const data: IHuntSessionsByDateAndGround = await response.json();
        const processedData = processHuntDataForChart(data, characterId);
        console.log('Chart data processed:', processedData);
        setCharacterHuntData(processedData);
      } catch (error) {
        console.error('Error fetching hunt sessions:', error);
      }
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="w-1/3 p-4 bg-gray-100">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Adicionar Hunt</h2>
          <button
            onClick={() => setIsHuntModalOpen(true)}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Adicionar Nova Hunt
          </button>
        </div>
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Adicionar Personagem</h2>
          <button
            onClick={() => setIsCharacterModalOpen(true)}
            className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Adicionar Novo Personagem
          </button>
        </div>
        
        {showAddCharacterIndicator && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Você precisa adicionar um personagem para começar. Clique no botão acima para adicionar.
                </p>
              </div>
            </div>
          </div>
        )}
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
        onNoCharacters={handleNoVerifiedCharacters}
        characters={characters}
      />

      <AddCharacterModal
        isOpen={isCharacterModalOpen}
        onClose={() => setIsCharacterModalOpen(false)}
        onSubmit={handleAddCharacter}
      />

      {/* Modal de verificação de personagem */}
      {isVerifyModalOpen && selectedCharacterForVerification && (
        <VerifyCharacterModal
          isOpen={isVerifyModalOpen}
          onClose={() => {
            setIsVerifyModalOpen(false);
            setSelectedCharacterForVerification(null);
          }}
          onVerified={handleVerificationSuccess}
          characterData={{
            name: selectedCharacterForVerification.name,
            vocation: selectedCharacterForVerification.vocation as CharacterData['vocation'],
            min_lvl: selectedCharacterForVerification.min_lvl,
            max_lvl: selectedCharacterForVerification.max_lvl
          }}
          characterPid={selectedCharacterForVerification.pid}
          confirmationToken={selectedCharacterForVerification.confirmation_token || ''}
        />
      )}
    </div>
  );
}
