"use client";

interface PartyDetailsStepProps {
  onBack: () => void;
  onComplete: () => void;
}

export function PartyDetailsStep({ onBack, onComplete }: PartyDetailsStepProps) {
  return (
    <div className="py-6">
      <h3 className="text-lg font-medium text-gray-900 mb-6">Detalhes da Party Hunt</h3>
      
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2 text-gray-700">
          Insira aqui o hunt analyzer da PARTY
        </label>
        <textarea
          className="w-full h-64 p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Cole os dados da hunt em party aqui..."
        />
        <p className="text-sm text-gray-500 mt-2">
          Esta funcionalidade será implementada em breve. Por enquanto, você pode colar os dados para teste.
        </p>
      </div>
      
      <div className="mt-8 flex justify-end">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded mr-2"
        >
          Voltar
        </button>
        <button
          type="button"
          onClick={onComplete}
          className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-500 rounded"
        >
          Concluir
        </button>
      </div>
    </div>
  );
}