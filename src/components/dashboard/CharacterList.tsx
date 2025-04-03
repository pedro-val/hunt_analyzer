"use client";

import { Character } from '@/types/character';
import { useState } from 'react';
import { IHuntSessionsByDateAndGround } from '@/types/huntData';
import { FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';
import Image from 'next/image';

interface CharacterListProps {
  characters: Character[];
  onCharacterSelect: (characterId: string, huntData: IHuntSessionsByDateAndGround | null) => void;
}

export function CharacterList({ characters, onCharacterSelect }: CharacterListProps) {
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingCharacterId, setLoadingCharacterId] = useState<string | null>(null);

  const handleCharacterClick = async (character: Character) => {
    if (isLoading) return;
    
    setSelectedCharacter(character.pid);
    setIsLoading(true);
    setLoadingCharacterId(character.pid);
    
    try {
      // Simplesmente passamos o ID do personagem para o componente pai
      // O componente pai (AddHuntPage) será responsável por fazer a requisição correta
      // ou abrir o modal de verificação
      onCharacterSelect(character.pid, null);
    } catch (error) {
      console.error('Error handling character click:', error);
    } finally {
      setIsLoading(false);
      setLoadingCharacterId(null);
    }
  };

  // Função para obter o caminho da imagem da vocação
  const getVocationImagePath = (vocation: string) => {
    const vocationLower = vocation.toLowerCase();
    return `/${vocationLower}.gif`;
  };

  // Função para renderizar o indicador de verificação
  const renderVerificationStatus = (character: Character) => {
    if (character.is_verified) {
      return (
        <div className="flex flex-col items-center">
          <div className="flex items-center text-green-600 mb-2">
            <FiCheckCircle className="mr-1" />
            <span className="text-xs">Verificado</span>
          </div>
          <div className="mt-1">
            <Image 
              src={getVocationImagePath(character.vocation)}
              alt={character.vocation}
              width={32}
              height={32}
              className="rounded-full"
            />
          </div>
        </div>
      );
    } else {
      return (
        <div className="flex flex-col items-center">
          <div className="flex items-center text-orange-500 mb-2">
            <FiAlertTriangle className="mr-1" />
            <span className="text-xs">Clique para verificar</span>
          </div>
          <div className="mt-1">
            <Image 
              src={getVocationImagePath(character.vocation)}
              alt={character.vocation}
              width={32}
              height={32}
              className="rounded-full"
            />
          </div>
        </div>
      );
    }
  };

  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-4">Meus Personagens</h2>
      
      {characters.length === 0 ? (
        <div className="bg-gray-100 p-4 rounded-md text-gray-600 text-center">
          Nenhum personagem encontrado. Adicione um personagem para começar.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {characters.map((character) => (
            <div
              key={character.pid}
              className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                selectedCharacter === character.pid
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
              }`}
              onClick={() => handleCharacterClick(character)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-800">{character.name}</h3>
                  <p className="text-sm text-gray-600">{character.vocation}</p>
                  <p className="text-xs text-gray-500">
                    Level: {character.min_lvl} - {character.max_lvl}
                  </p>
                </div>
                
                {loadingCharacterId === character.pid ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                ) : (
                  renderVerificationStatus(character)
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}