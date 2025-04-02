"use client";

import { useState } from 'react';
import { CharacterData } from '../../app/app/protected/add-hunt/page';
import { API_BASE_URL } from '@/utils/env';
import Cookies from 'js-cookie';

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
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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

      if (!response.ok) throw new Error('Failed to add character');

      // Show success message and close modal after 2 seconds
      setSuccessMessage('Personagem adicionado com sucesso!');
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
        onSubmit(formData); // Isso disparará a atualização no AddHuntPage
      }, 2000);
    } catch (error) {
      console.error('Error adding character:', error);
      alert('Erro ao adicionar personagem. Tente novamente.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Adicionar Personagem</h2>
        
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {successMessage}
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
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-500 rounded"
            >
              Adicionar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}