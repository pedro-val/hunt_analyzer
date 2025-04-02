"use client";

import { CharacterSelector } from './CharacterSelector';
import { HuntingGroundSelector } from './HuntingGroundSelector';

interface Character {
  pid: string;
  name: string;
  vocation: string;
}

interface HuntingGround {
  pid: string;
  name: string;
  description: string;
}

// Adicione o parâmetro showButtons à interface
interface HuntInputStepProps {
  characters: Character[];
  huntingGrounds: HuntingGround[];
  selectedCharacter: string;
  setSelectedCharacter: (pid: string) => void;
  selectedHuntingGround: string;
  setSelectedHuntingGround: (pid: string) => void;
  huntingGroundSearch: string;
  setHuntingGroundSearch: (search: string) => void;
  huntText: string;
  setHuntText: (text: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isLoading: boolean;
  showButtons?: boolean;
}

export function HuntInputStep({
  characters,
  huntingGrounds,
  selectedCharacter,
  setSelectedCharacter,
  selectedHuntingGround,
  setSelectedHuntingGround,
  huntingGroundSearch,
  setHuntingGroundSearch,
  huntText,
  setHuntText,
  onSubmit,
  onCancel,
  isLoading,
  showButtons = true
}: HuntInputStepProps) {
  return (
    <>
      <div className="grid grid-cols-2 gap-6 h-[calc(100%-120px)]">
        {/* Left Column */}
        <div className="flex flex-col space-y-4">
          <CharacterSelector
            characters={characters}
            selectedCharacter={selectedCharacter}
            setSelectedCharacter={setSelectedCharacter}
          />

          <HuntingGroundSelector
            huntingGrounds={huntingGrounds}
            selectedHuntingGround={selectedHuntingGround}
            setSelectedHuntingGround={setSelectedHuntingGround}
            huntingGroundSearch={huntingGroundSearch}
            setHuntingGroundSearch={setHuntingGroundSearch}
          />
        </div>

        {/* Right Column */}
        <div className="flex flex-col h-full">
          <label className="block text-sm font-medium mb-1 text-gray-700">
            Insira aqui seu hunt analyzer INDIVIDUAL
          </label>
          <textarea
            className="w-full flex-grow p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Cole os dados da sua hunt aqui..."
            value={huntText}
            onChange={(e) => setHuntText(e.target.value)}
          />
        </div>
      </div>

      {showButtons && (
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onSubmit}
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
      )}
    </>
  );
}