"use client";

import { SessionSummary } from './SessionSummary';
import { PlayerSummaryTable } from './PlayerSummaryTable';
import { PerformanceComments } from './PerformanceComments';
import { PaymentInstructions } from './PaymentInstructions';

interface Player {
  name: string;
  loot: number;
  supplies: number;
  balance: number;
  damage?: number;
  healing?: number;
}

interface ParsedData {
  dateFrom: string;
  dateTo: string;
  duration: string;
  lootType: string;
  totalLoot: number;
  totalSupplies: number;
  totalBalance: number;
  players: Player[];
}

interface Payment {
  from: string;
  to: string;
  amount: number;
}

interface AnalysisPanelProps {
  parsedData: ParsedData | null;
  error: string | null;
  calculatePayments: (data: ParsedData) => Payment[];
  classifyPerformance: (data: ParsedData) => Record<string, {
    damageClass?: string;
    healClass?: string;
    balanceClass?: string;
    damageComment?: string;
    healComment?: string;
    balanceComment?: string;
  }>;
}

export function AnalysisPanel({ 
  parsedData, 
  error, 
  calculatePayments,
  classifyPerformance,
}: AnalysisPanelProps) {
  // Calculate payments if we have parsed data
  const payments = parsedData ? calculatePayments(parsedData) : [];
  
  // Classify player performance
  const playerClassifications = parsedData ? classifyPerformance(parsedData) : {};

  return (
    <div className="w-3/4 p-4 bg-gray-50">
      <h2 className="text-lg font-semibold mb-2">Análise da Hunt</h2>
      <div className="h-[calc(100vh-160px)] p-4 border border-gray-300 rounded-md bg-white overflow-auto">
        {error && (
          <div className="text-red-500 mb-3 p-2 bg-red-50 border border-red-200 rounded-md text-sm">
            <strong>Erro:</strong> {error}
          </div>
        )}
        
        {parsedData ? (
          <div className="grid grid-cols-12 gap-4">
            <SessionSummary 
              dateFrom={parsedData.dateFrom}
              dateTo={parsedData.dateTo}
              duration={parsedData.duration}
              lootType={parsedData.lootType}
              totalLoot={parsedData.totalLoot}
              totalSupplies={parsedData.totalSupplies}
              totalBalance={parsedData.totalBalance}
            />
            
            <PlayerSummaryTable 
              players={parsedData.players}
              totalBalance={parsedData.totalBalance}
            />
            
            <PerformanceComments 
              parsedData={parsedData}
              playerClassifications={playerClassifications}
            />
            
            <PaymentInstructions 
              payments={payments}
              totalBalance={parsedData.totalBalance}
              playerCount={parsedData.players.length}
            />
          </div>
        ) : !error && (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p>Digite os dados da hunt na área de entrada e clique em &quot;Analisar Hunt&quot; para ver os resultados</p>
          </div>
        )}
      </div>
    </div>
  );
}