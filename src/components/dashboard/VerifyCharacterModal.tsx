"use client";

import { useEffect, useState } from 'react';
import { CharacterData } from '../../app/app/protected/add-hunt/page';
import { API_BASE_URL } from '@/utils/env';
import Cookies from 'js-cookie';
import { FiCopy, FiCheckCircle } from 'react-icons/fi';

// Interfaces para as respostas de verificação
interface VerificationResponse {
  message: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

interface VerificationStatusResponse {
  is_verified: boolean;
  confirmation_token: string;
  status: string;
}

interface VerifyCharacterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: (data: CharacterData) => void;
  characterData: CharacterData;
  characterPid: string;
  confirmationToken: string;
}

export function VerifyCharacterModal({ 
  isOpen, 
  onClose, 
  onVerified, 
  characterData, 
  characterPid, 
  confirmationToken 
}: VerifyCharacterModalProps) {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [tokenCopied, setTokenCopied] = useState<boolean>(false);
  const [isPolling, setIsPolling] = useState<boolean>(false);
  const [pollingIntervalId, setPollingIntervalId] = useState<NodeJS.Timeout | null>(null);

  const copyTokenToClipboard = () => {
    navigator.clipboard.writeText(confirmationToken)
      .then(() => {
        setTokenCopied(true);
        setTimeout(() => setTokenCopied(false), 3000);
      })
      .catch(err => {
        console.error('Erro ao copiar token:', err);
      });
  };

  const checkVerificationStatus = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setIsPolling(true);
    
    try {
      const token = Cookies.get('auth_token');
      if (!token) throw new Error('Authentication token not found');

      // Iniciar o processo de verificação
      const verifyResponse = await fetch(`${API_BASE_URL}/characters/${characterPid}/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json();
        throw new Error(errorData.message || 'Failed to start verification');
      }

      const verifyData: VerificationResponse = await verifyResponse.json();
      
      // Se o status for 'failed', mostrar mensagem de erro e parar
      if (verifyData.status === 'failed') {
        setErrorMessage(`Falha na verificação: ${verifyData.message}`);
        setIsPolling(false);
        setIsSubmitting(false);
        return;
      }
      
      // Iniciar polling para verificar o status a cada segundo
      const intervalId = setInterval(async () => {
        try {
          const statusResponse = await fetch(`${API_BASE_URL}/characters/${characterPid}/verification-status`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (!statusResponse.ok) {
            clearInterval(intervalId);
            setIsPolling(false);
            setIsSubmitting(false);
            throw new Error('Failed to check verification status');
          }
          
          const statusData: VerificationStatusResponse = await statusResponse.json();
          
          // Se verificado com sucesso
          if (statusData.is_verified) {
            clearInterval(intervalId);
            setIsPolling(false);
            setIsVerified(true);
            setSuccessMessage('Personagem verificado com sucesso!');
            setTimeout(() => {
              setSuccessMessage(null);
              onClose();
              onVerified(characterData);
            }, 2000);
          } 
          // Se falhou
          else if (statusData.status === 'failed') {
            clearInterval(intervalId);
            setIsPolling(false);
            setIsSubmitting(false);
            setErrorMessage('Falha na verificação. Por favor, verifique se o token foi adicionado corretamente aos comentários do personagem.');
          }
          // Caso contrário, continua o polling
        } catch (error) {
          clearInterval(intervalId);
          setIsPolling(false);
          setIsSubmitting(false);
          console.error('Error checking verification status:', error);
          setErrorMessage(error instanceof Error ? error.message : 'Erro ao verificar status. Tente novamente.');
        }
      }, 1000);
      
      setPollingIntervalId(intervalId);
      
    } catch (error) {
      setIsPolling(false);
      setIsSubmitting(false);
      console.error('Error verifying character:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Erro ao iniciar verificação. Tente novamente.');
    }
  };
  
  // Limpar o intervalo quando o componente for desmontado ou o modal for fechado
  useEffect(() => {
    return () => {
      if (pollingIntervalId) {
        clearInterval(pollingIntervalId);
      }
    };
  }, [pollingIntervalId]);
  
  const handleClose = () => {
    // Limpar o intervalo ao fechar o modal
    if (pollingIntervalId) {
      clearInterval(pollingIntervalId);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Verificação de Personagem</h2>
        
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 flex items-center">
            <FiCheckCircle className="mr-2" size={20} />
            <span>{successMessage}</span>
          </div>
        )}
        
        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {errorMessage}
          </div>
        )}
        
        {!isVerified && (
          <div className="mb-6">
            <p className="text-gray-700 mb-4">
              Para verificar que este personagem pertence a você, siga os passos abaixo:
            </p>
            
            <ol className="list-decimal pl-5 space-y-2 text-gray-700 mb-4">
              <li>Acesse o <a href="https://www.tibia.com/community/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">site oficial do Tibia</a></li>
              <li>Faça login na sua conta</li>
              <li>Acesse a página do seu personagem <strong>{characterData.name}</strong></li>
              <li>Clique em &quot;Edit Character Information&quot;</li>
              <li>Cole o token abaixo no campo &quot;Comment&quot;</li>
              <li>Salve as alterações</li>
              <li>Volte aqui e clique em &quot;Verificar&quot;</li>
            </ol>
            
            <div className="bg-gray-100 p-3 rounded-md flex items-center justify-between mb-4">
              <code className="text-sm font-mono break-all">{confirmationToken}</code>
              <button 
                onClick={copyTokenToClipboard}
                className="ml-2 p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
                title="Copiar token"
                disabled={isPolling}
              >
                {tokenCopied ? (
                  <FiCheckCircle className="text-green-500" size={20} />
                ) : (
                  <FiCopy size={20} />
                )}
              </button>
            </div>
            
            <p className="text-sm text-gray-600 italic">
              Nota: Este token é único e válido apenas para este personagem.
            </p>
          </div>
        )}
        
        <div className="flex justify-end gap-2">
          {isPolling ? (
            <div className="flex items-center justify-center w-full py-3">
              <div className="flex items-center space-x-2">
                <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-blue-600 font-medium">Verificando...</span>
              </div>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
              >
                Fechar
              </button>
              
              {!isVerified && (
                <button
                  type="button"
                  onClick={checkVerificationStatus}
                  className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-500 rounded flex items-center"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Verificando...
                    </>
                  ) : (
                    'Verificar'
                  )}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}