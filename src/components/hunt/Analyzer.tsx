"use client";

import { useHuntAnalyzer } from "@/hooks/useHuntAnalyzer";
import { InputPanel } from "@/components/hunt/InputPanel";
import { AnalysisPanel } from "@/components/hunt/AnalysisPanel";

export function Analyzer() {
  const {
    inputText,
    setInputText,
    parsedData,
    error,
    handleAnalyze,
    calculatePayments,
    classifyPerformance,
  } = useHuntAnalyzer();

  return (
    <div className="bg-gray-100 p-4 h-full"> {/* Changed from min-h-screen to h-full */}
      <div className="mx-auto">
        <h1 className="text-2xl font-bold mb-4">Analisador de Hunt</h1>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-4">
          <div className="flex flex-row">
            <InputPanel 
              inputText={inputText}
              setInputText={setInputText}
              handleAnalyze={handleAnalyze}
            />
            
            <AnalysisPanel 
              parsedData={parsedData}
              error={error}
              calculatePayments={calculatePayments}
              classifyPerformance={classifyPerformance}
            />
          </div>
        </div>
      </div>
    </div>
  );
}