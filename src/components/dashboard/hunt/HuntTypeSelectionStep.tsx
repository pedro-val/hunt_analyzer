"use client";

import { GiHuntingHorn, GiSwordman } from 'react-icons/gi';
// Ou use estes ícones alternativos:
// import { BsPersonFill, BsPeopleFill } from 'react-icons/bs';
// import { MdPersonOutline, MdGroups } from 'react-icons/md';

interface HuntTypeSelectionStepProps {
  onSelectType: (type: 'solo' | 'party') => void;
  onBack: () => void; // Mantemos na interface, mas não usaremos mais
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function HuntTypeSelectionStep({ onSelectType, onBack }: HuntTypeSelectionStepProps) {
  return (
    <div className="py-6">
      <h3 className="text-lg font-medium text-gray-900 mb-6">Selecione o tipo de hunt:</h3>
      
      <div className="grid grid-cols-2 gap-6">
        <button
          onClick={() => onSelectType('solo')}
          className="flex flex-col items-center justify-center p-8 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
        >
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <GiSwordman size={48} className="text-blue-600" />
          </div>
          <span className="text-lg font-medium">Solo Hunt</span>
          <p className="text-sm text-gray-500 text-center mt-2">
            Hunt realizada sozinho, sem outros jogadores.
          </p>
        </button>
        
        <button
          onClick={() => onSelectType('party')}
          className="flex flex-col items-center justify-center p-8 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <GiHuntingHorn size={48} className="text-green-600" />
          </div>
          <span className="text-lg font-medium">Party Hunt</span>
          <p className="text-sm text-gray-500 text-center mt-2">
            Hunt realizada em grupo, com outros jogadores.
          </p>
        </button>
      </div>
      
      {/* Botão de voltar removido */}
    </div>
  );
}