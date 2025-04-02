"use client";

import Image from 'next/image';
import { Character } from '@/types/character';
import Cookies from 'js-cookie';
import { API_BASE_URL } from '@/utils/env';
import { IHuntSessionsByDateAndGround } from '@/types/huntData';

interface CharacterListProps {
  characters: Character[];
  onCharacterSelect: (characterId: string, huntData: IHuntSessionsByDateAndGround) => void;
}

const getVocationIcon = (vocation: string) => {
  const vocationName = vocation.toLowerCase();
  switch (vocationName) {
    case 'sorcerer':
      return '/sorcerer.gif';
    case 'knight':
      return '/knight.gif';
    case 'paladin':
      return '/paladin.gif';
    case 'druid':
      return '/druid.gif';
    default:
      return '/knight.gif';
  }
};

export function CharacterList({ characters, onCharacterSelect }: CharacterListProps) {
  const handleCharacterClick = async (pid: string) => {
    try {
      const token = Cookies.get('auth_token');
      if (!token) throw new Error('Authentication token not found');
      
      const response = await fetch(`${API_BASE_URL}/hunt-sessions/by-character`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ personal_character_pid: pid })
      });

      if (!response.ok) throw new Error('Failed to fetch hunt sessions');
      
      const data: IHuntSessionsByDateAndGround = await response.json();
      onCharacterSelect(pid, data);
    } catch (error) {
      console.error('Error fetching hunt sessions:', error);
    }
  };

  return (
    <div className="w-96 mt-6">
      <h3 className="text-lg font-medium mb-4">Meus Personagens</h3>
      <div className="space-y-3">
        {characters.map((character) => (
          <div 
            key={character.pid} 
            className="flex items-center p-3 bg-white rounded-lg shadow cursor-pointer hover:bg-gray-50"
            onClick={() => handleCharacterClick(character.pid)}
          >
            <Image
              src={getVocationIcon(character.vocation)}
              alt={character.vocation}
              width={32}
              height={32}
              className="mr-3"
            />
            <div>
              <p className="font-medium">{character.name}</p>
              <p className="text-sm text-gray-500 capitalize">{character.vocation.toLowerCase()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}