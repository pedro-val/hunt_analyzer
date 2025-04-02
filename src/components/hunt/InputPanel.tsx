"use client";

interface InputPanelProps {
  inputText: string;
  setInputText: (text: string) => void;
  handleAnalyze: () => void;
}

export function InputPanel({ inputText, setInputText, handleAnalyze }: InputPanelProps) {
  return (
    <div className="w-1/4 p-4 border-r border-gray-200">
      <h2 className="text-lg font-semibold mb-2">Dados da Hunt</h2>
      <textarea
        className="w-full h-[calc(100vh-180px)] p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
        placeholder="Cole seus dados de hunt aqui..."
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
      ></textarea>
      <button 
        onClick={handleAnalyze}
        className="mt-2 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors font-medium text-sm w-full"
      >
        Analisar Hunt
      </button>
    </div>
  );
}