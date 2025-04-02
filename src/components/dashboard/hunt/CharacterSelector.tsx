"use client";

import Image from 'next/image';

interface Character {
  pid: string;
  name: string;
  vocation: string;
}

interface CharacterSelectorProps {
  characters: Character[];
  selectedCharacter: string;
  setSelectedCharacter: (pid: string) => void;
}

export function CharacterSelector({ 
  characters, 
  selectedCharacter, 
  setSelectedCharacter 
}: CharacterSelectorProps) {
  
  const getVocationIcon = (vocation: string | undefined) => {
    if (!vocation) {
      return <Image src="/knight.gif" alt="Unknown" width={32} height={32} className="ml-2" />;
    }
    
    const vocation_name = vocation.toLowerCase(); 
    switch (vocation_name) {
      case 'sorcerer':
        return <Image src="/sorcerer.gif" alt="Sorcerer" width={32} height={32} className="ml-2" />;
      case 'knight':
        return <Image src="/knight.gif" alt="Knight" width={32} height={32} className="ml-2" />;
      case 'paladin':
        return <Image src="/paladin.gif" alt="Paladin" width={32} height={32} className="ml-2" />;
      case 'druid':
        return <Image src="/druid.gif" alt="Druid" width={32} height={32} className="ml-2" />;
      default:
        return <Image src="/knight.gif" alt="Unknown" width={32} height={32} className="ml-2" />;
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
      <h3 className="font-medium text-gray-800 mb-3">Selecione seu personagem:</h3>
      <div className="grid grid-cols-1 gap-3">
        {characters.map((char) => (
          <label 
            key={char.pid} 
            className={`flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-100 ${
              selectedCharacter === char.pid ? 'bg-blue-50 border-blue-300' : 'border-gray-200'
            }`}
          >
            <input
              type="radio"
              name="character"
              value={char.pid}
              checked={selectedCharacter === char.pid}
              onChange={() => setSelectedCharacter(char.pid)}
              className="mr-3"
            />
            <div className="flex items-center justify-between w-full">
              <span className="font-medium">{char.name}</span>
              {getVocationIcon(char.vocation)}
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}