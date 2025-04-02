/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/utils/env';
import Cookies from 'js-cookie';
import { HuntInputStep } from './hunt/HuntInputStep';
import { parseHuntText, HuntData } from '@/utils/huntParser';
import { parsePartyHuntText, PartyHuntData } from '@/utils/partyHuntParser';
import { Character } from '@/types/character';

// Atualizar a interface Character para usar a importada
interface HuntingGround {
  pid: string;
  name: string;
  description: string;
}

// Adicione esta interface para o novo formato de requisição
interface HuntSessionRequest {
  is_party_hunt: boolean;
  individual_session_data: HuntData | null;
  party_hunt_data: PartyHuntData | null;
}

// Update the interface to include the new callback
interface AddHuntModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNoCharacters?: () => void;
  characters: Character[];
  onHuntAdded?: () => void; // Add this new prop
}

export function AddHuntModal({ isOpen, onClose, onNoCharacters, characters, onHuntAdded }: AddHuntModalProps) {
  const [huntingGrounds, setHuntingGrounds] = useState<HuntingGround[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<string>('');
  const [selectedHuntingGround, setSelectedHuntingGround] = useState<string>('');
  const [huntingGroundSearch, setHuntingGroundSearch] = useState('');
  const [huntText, setHuntText] = useState('');
  const [partyHuntText, setPartyHuntText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [huntSessionId, setHuntSessionId] = useState<string>('');
  const [partyHuntData, setPartyHuntData] = useState<PartyHuntData | null>(null);
  const [individualHuntData, setIndividualHuntData] = useState<HuntData | null>(null);
  const [partyHuntError, setPartyHuntError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchHuntingGrounds();
    }
  }, [isOpen]);

  const fetchHuntingGrounds = async () => {
    try {
      const token = Cookies.get('auth_token');
      if (!token) throw new Error('Authentication token not found');

      const response = await fetch(`${API_BASE_URL}/hunting-grounds`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch hunting grounds');
      
      const data = await response.json();
      // Ordenar os hunting grounds por nome em ordem alfabética
      const sortedData = [...data].sort((a, b) => a.name.localeCompare(b.name));
      setHuntingGrounds(sortedData);
    } catch (error) {
      console.error('Error fetching hunting grounds:', error);
      alert('Erro ao buscar hunting grounds. Tente novamente.');
    }
  };

  // Function to show temporary error message
  const showTemporaryError = (message: string) => {
    setPartyHuntError(message);
    setTimeout(() => setPartyHuntError(null), 5000);
  };

  // Função para resetar todos os estados
  const resetStates = () => {
    setSelectedCharacter('');
    setSelectedHuntingGround('');
    setHuntingGroundSearch('');
    setHuntText('');
    setPartyHuntText('');
    setHuntSessionId('');
    setIndividualHuntData(null);
    setPartyHuntData(null);
  };

  const handleAddHunt = async () => {
    try {
      let individualData: HuntData | null = null;
      let partyData: PartyHuntData | null = null;
      
      // Verificar se temos dados de hunt individual
      if (huntText) {
        const parsedData = parseHuntText(huntText);
        
        if (!parsedData) {
          setPartyHuntError("Erro ao processar os dados da hunt individual. Verifique o formato e tente novamente.");
          return;
        }
        
        if (!selectedCharacter) {
          setPartyHuntError("Por favor, selecione um personagem.");
          return;
        }
        
        if (!selectedHuntingGround) {
          setPartyHuntError("Por favor, selecione um hunting ground.");
          return;
        }
        
        individualData = {
          ...parsedData,
          personal_character_pid: selectedCharacter,
          hunting_ground_pid: selectedHuntingGround
        };
      }
      
      // Verificar se temos dados de hunt em party
      if (partyHuntText) {
        const parsedPartyData = parsePartyHuntText(
          partyHuntText, 
          selectedCharacter, 
          selectedHuntingGround,
          characters
        );
        
        if (!parsedPartyData) {
          setPartyHuntError("Erro ao processar os dados da hunt em party. Verifique o formato e tente novamente.");
          return;
        }
      
      // Verificar se há pelo menos 2 personagens na party
      if (Object.keys(parsedPartyData.party_characters).length < 2) {
        setPartyHuntError("Uma hunt em party deve ter pelo menos 2 personagens.");
        return;
      }
      
      partyData = parsedPartyData;
    }



    // Verificar se todos os campos obrigatórios estão presentes
    if (individualData) {
      const requiredFields = ['data', 'start_hour', 'end_hour', 'loot', 'supplies', 'damage', 'healing'];
      const missingFields = requiredFields.filter(field => !individualData![field as keyof HuntData]);
      
      if (missingFields.length > 0) {
        setPartyHuntError(`Campos obrigatórios faltando na hunt individual: ${missingFields.join(', ')}`);
        return;
      }
    }

    if (partyData) {
      const requiredFields = ['data', 'start_hour', 'end_hour', 'total_loot', 'total_supplies', 'balance'];
      const missingFields = requiredFields.filter(field => !partyData![field as keyof PartyHuntData]);
      
      if (missingFields.length > 0) {
        setPartyHuntError(`Campos obrigatórios faltando na hunt em party: ${missingFields.join(', ')}`);
        return;
      }
    }
    
    // Verificar se as datas são iguais quando ambos os dados existem
    if (individualData && partyData && individualData.data !== partyData.data) {
      showTemporaryError("As datas da hunt individual e da party hunt não coincidem. Verifique os dados e tente novamente.");
      return;
    }
    
    // Se não temos nenhum dos dois, mostrar erro
    if (!individualData && !partyData) {
      showTemporaryError("Por favor, insira os dados de pelo menos um tipo de hunt (individual ou party).");
      return;
    }
    
    // Determinar se é uma party hunt
    const isPartyHunt = !!partyHuntText && !!partyData;
    
    // Montar o objeto para a requisição
    // Modificação: Só incluir party_hunt_data se isPartyHunt for true
    const huntSessionRequest: Partial<HuntSessionRequest> = {
      is_party_hunt: isPartyHunt,
      individual_session_data: individualData
    };
    
    // Adicionar party_hunt_data apenas se for uma party hunt
    if (isPartyHunt) {
      huntSessionRequest.party_hunt_data = partyData;
    }

    try {
      const token = Cookies.get('auth_token');
      if (!token) throw new Error('Authentication token not found');
  
      setIsLoading(true);
      
      const response = await fetch(`${API_BASE_URL}/hunt-sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(huntSessionRequest)
      });
  
      if (!response.ok) {
        throw new Error('Failed to add hunt session');
      }
  
      alert('Hunt adicionada com sucesso!');
      resetStates();
      onClose();
      // Chamar o callback onHuntAdded se existir
      if (onHuntAdded) {
        onHuntAdded();
      }
    } catch (error) {
      console.error('Error adding hunt:', error);
      if (error instanceof Error) {
        setPartyHuntError(error.message);
      } else {
        setPartyHuntError("Erro ao adicionar a hunt. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
    } catch (error) {
      console.error('Error processing hunt data:', error);
      if (error instanceof Error) {
        setPartyHuntError(error.message);
      } else {
        setPartyHuntError("Erro ao processar os dados da hunt. Tente novamente.");
      }
    }
  };


  if (!isOpen) return null;

  // Também precisamos atualizar o onClose para resetar os estados
  const handleClose = () => {
    resetStates();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-[1200px] h-[80vh] shadow-lg overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Adicionar Hunt</h2>
          <button 
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          {/* Lado esquerdo - Hunt Individual */}
          <div className="border-r pr-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Hunt Individual</h3>
            <HuntInputStep
              characters={characters}
              huntingGrounds={huntingGrounds}
              selectedCharacter={selectedCharacter}
              setSelectedCharacter={setSelectedCharacter}
              selectedHuntingGround={selectedHuntingGround}
              setSelectedHuntingGround={setSelectedHuntingGround}
              huntingGroundSearch={huntingGroundSearch}
              setHuntingGroundSearch={setHuntingGroundSearch}
              huntText={huntText}
              setHuntText={setHuntText}
              onSubmit={handleAddHunt}
              onCancel={handleClose}
              isLoading={isLoading}
              showButtons={false}
            />
          </div>
          
          {/* Lado direito - Hunt em Party (Simplificado) */}
          <div className="pl-2">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Hunt em Party</h3>
            <div className="flex flex-col h-full">
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Insira aqui o hunt analyzer da PARTY
              </label>
              <textarea
                className="w-full h-64 p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Cole os dados da hunt em party aqui..."
                value={partyHuntText}
                onChange={(e) => setPartyHuntText(e.target.value)}
              />
              {partyHuntError && (
                <div className="mt-2 text-red-500 text-sm animate-fade-in">
                  {partyHuntError}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Botões de ação */}
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleAddHunt}
            className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-500 rounded flex items-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processando...
              </>
            ) : (
              'Adicionar Hunt'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}