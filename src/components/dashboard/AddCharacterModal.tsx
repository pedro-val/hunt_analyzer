"use client";

import { useState } from 'react';
import { CharacterData } from '../../app/app/protected/add-hunt/page';
import { API_BASE_URL } from '@/utils/env';
import Cookies from 'js-cookie';
import { VerifyCharacterModal } from './VerifyCharacterModal';

// Interface para a resposta da API atualizada
interface CharacterResponse extends CharacterData {
  pid: string;
  confirmation_token: string;
  is_verified: boolean;
}

export function AddCharacterModal({ isOpen, onClose, onSubmit }: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CharacterData) => void;
}) {
  const [formData, setFormData] = useState<CharacterData>({
    name: '',
    vocation: 'Knight',
    min_lvl: 0,
    max_lvl: 0,
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // Estados para gerenciar a verificação
  const [showVerificationModal, setShowVerificationModal] = useState<boolean>(false);
  const [characterPid, setCharacterPid] = useState<string>('');
  const [confirmationToken, setConfirmationToken] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    
    try {
      const token = Cookies.get('auth_token');
      if (!token) throw new Error('Authentication token not found');

      const response = await fetch(`${API_BASE_URL}/characters/add_personal_char`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add character');
      }

      // Processar a resposta com as novas chaves
      const data: CharacterResponse = await response.json();
      
      // Armazenar o token de verificação, status e pid do personagem
      setConfirmationToken(data.confirmation_token);
      setCharacterPid(data.pid);
      
      // Se já estiver verificado, fechar o modal e notificar o componente pai
      if (data.is_verified) {
        onClose();
        onSubmit(formData);
      } else {
        // Mostrar o modal de verificação
        setShowVerificationModal(true);
      }
    } catch (error) {
      console.error('Error adding character:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Erro ao adicionar personagem. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerificationClose = () => {
    setShowVerificationModal(false);
    onClose();
  };

  const handleVerified = (data: CharacterData) => {
    onSubmit(data);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Adicionar Personagem</h2>
          
          {errorMessage && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 text-gray-700">Nome do Char</label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 text-gray-700">Vocação</label>
              <div className="flex flex-wrap gap-2">
                {['Knight', 'Paladin', 'Sorcerer', 'Druid', 'Monk'].map((vocation) => (
                  <label key={vocation} className="flex items-center gap-1">
                    <input
                      type="radio"
                      name="vocation"
                      value={vocation}
                      checked={formData.vocation === vocation}
                      onChange={() => setFormData({ ...formData, vocation: vocation as CharacterData['vocation'] })}
                    />
                    <span className="text-gray-700">{vocation}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Adicione uma margem mínima e máxima para sua faixa de level atual.
                Exemplo: para um personagem level 400, coloque mínimo 300 e máximo 500.
              </p>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1 text-gray-700">Level Mínimo</label>
                  <input
                    type="number"
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.min_lvl}
                    onChange={(e) => setFormData({ ...formData, min_lvl: Number(e.target.value) })}
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1 text-gray-700">Level Máximo</label>
                  <input
                    type="number"
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.max_lvl}
                    onChange={(e) => setFormData({ ...formData, max_lvl: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-500 rounded flex items-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processando...
                  </>
                ) : (
                  'Adicionar'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal de verificação */}
      {showVerificationModal && (
        <VerifyCharacterModal
          isOpen={showVerificationModal}
          onClose={handleVerificationClose}
          onVerified={handleVerified}
          characterData={formData}
          characterPid={characterPid}
          confirmationToken={confirmationToken}
        />
      )}
    </>
  );
}