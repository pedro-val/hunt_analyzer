"use client";

interface SessionSummaryProps {
  dateFrom: string;
  dateTo: string;
  duration: string;
  lootType: string;
  totalLoot: number;
  totalSupplies: number;
  totalBalance: number;
}

export function SessionSummary({
  dateFrom,
  dateTo,
  duration,
  lootType,
  totalLoot,
  totalSupplies,
  totalBalance
}: SessionSummaryProps) {
  return (
    <div className="col-span-12 bg-orange-50 p-3 rounded-md border border-orange-100">
      <h3 className="font-bold text-base mb-2 text-orange-800">Resumo da Sessão</h3>
      <div className="grid grid-cols-6 gap-2 text-sm w-full">
        <p><span className="font-medium">Data:</span> {dateFrom} até {dateTo}</p>
        <p><span className="font-medium">Duração:</span> {duration}</p>
        <p><span className="font-medium">Tipo de Loot:</span> {lootType}</p>
        <p><span className="font-medium">Loot Total:</span> {totalLoot.toLocaleString()} gp</p>
        <p><span className="font-medium">Supplys Totais:</span> {totalSupplies.toLocaleString()} gp</p>
        <p><span className="font-medium">Saldo Total:</span> {totalBalance.toLocaleString()} gp</p>
      </div>
    </div>
  );
}