"use client";

interface Payment {
  from: string;
  to: string;
  amount: number;
}

interface PaymentInstructionsProps {
  payments: Payment[];
  totalBalance: number;
  playerCount: number;
}

export function PaymentInstructions({ payments, totalBalance, playerCount }: PaymentInstructionsProps) {
  return (
    <div className="col-span-12 grid grid-cols-12 gap-3 mt-3">
      <div className="col-span-8">
        <h3 className="font-bold text-base mb-2">Instruções de Pagamento</h3>
        <div className="bg-green-50 p-3 rounded-md border border-green-100">
          {payments.length > 0 ? (
            payments.map((payment, index) => (
              <div key={index} className="mb-1 pb-1 border-b border-green-100 last:border-0 last:mb-0 last:pb-0 text-sm flex items-center justify-between relative">
                <p>
                  <span className="font-medium">{payment.from}</span> deve pagar <span className="font-medium">{payment.amount.toLocaleString()} gp</span> para <span className="font-medium">{payment.to}</span>
                </p>
                <div className="flex items-center">
                  <span 
                    id={`copy-msg-${index}`} 
                    className="text-xs text-green-700 mr-2 opacity-0 transition-opacity duration-300 ease-in-out"
                  >
                    transfer {payment.amount} to {payment.to} copiado!
                  </span>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(`transfer ${payment.amount} to ${payment.to}`);
                      
                      // Mostrar a mensagem copiada com transição
                      const msg = document.getElementById(`copy-msg-${index}`);
                      const btn = document.getElementById(`copy-btn-${index}`);
                      
                      if (msg) {
                        msg.classList.remove('opacity-0');
                        msg.classList.add('opacity-100');
                        
                        setTimeout(() => {
                          msg.classList.remove('opacity-100');
                          msg.classList.add('opacity-0');
                        }, 2000);
                      }
                      
                      if (btn) {
                        btn.classList.add('bg-green-300');
                        setTimeout(() => btn.classList.remove('bg-green-300'), 500);
                      }
                    }}
                    id={`copy-btn-${index}`}
                    className="px-2 py-1 bg-green-200 hover:bg-green-300 text-green-800 rounded-md text-xs transition-colors flex items-center"
                    title="Copiar comando de transferência"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    Copiar
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-600">Nenhum pagamento necessário - todos contribuíram igualmente.</p>
          )}
        </div>
      </div>
      
      <div className="col-span-4">
        <h3 className="font-bold text-base mb-2">Resumo</h3>
        <div className="p-3 border border-gray-200 rounded-md bg-gray-50 text-sm w-full">
          <p><span className="font-medium">Saldo total:</span> {totalBalance.toLocaleString()} gp</p>
          <p><span className="font-medium">Número de pessoas:</span> {playerCount}</p>
          <p><span className="font-medium">Saldo por pessoa:</span> {Math.floor(totalBalance / playerCount).toLocaleString()} gp</p>
        </div>
      </div>
    </div>
  );
}