"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth';

interface SidebarProps {
  onMenuSelect: (menu: string) => void;
  selectedMenu: string;
}

export function Sidebar({ onMenuSelect, selectedMenu }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const router = useRouter();

  const getUserName = () => {
    const token = authService.decodeToken();
    return token?.name ? token.name : "Visitante";
  };

  const handleLogout = () => {
    authService.logout();
    router.push('/login');
  };

  return (
    <div className={`bg-gray-900 text-white h-screen transition-all duration-300 ${
      isExpanded ? 'w-[15%]' : 'w-[5%]'
    }`}>
      <div className="p-4 h-full flex flex-col">
        {/* Collapse Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-center mb-8 hover:bg-gray-800 p-2 rounded"
        >
          {isExpanded ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          )}
        </button>

        {/* Menu Items */}
        <div className="flex-1">
          <button
            onClick={() => onMenuSelect('add-hunt')}
            className={`w-full flex items-center mb-4 hover:bg-gray-800 p-2 rounded ${
              selectedMenu === 'add-hunt' ? 'bg-gray-700' : ''
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {isExpanded && <span className="ml-2">Adicionar Hunt</span>}
          </button>

          <button
            onClick={() => onMenuSelect('add-rotation')}
            className={`w-full flex items-center mb-4 hover:bg-gray-800 p-2 rounded ${
              selectedMenu === 'add-rotation' ? 'bg-gray-700' : ''
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {isExpanded && <span className="ml-2">Adicionar Rotação</span>}
          </button>

          <button
            onClick={() => onMenuSelect('personal-info')}
            className={`w-full flex items-center mb-4 hover:bg-gray-800 p-2 rounded ${
              selectedMenu === 'personal-info' ? 'bg-gray-700' : ''
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {isExpanded && <span className="ml-2">Informações Pessoais</span>}
          </button>

          <button
            onClick={() => onMenuSelect('reports')}
            className={`w-full flex items-center mb-4 hover:bg-gray-800 p-2 rounded ${
              selectedMenu === 'reports' ? 'bg-gray-700' : ''
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {isExpanded && <span className="ml-2">Relatórios</span>}
          </button>
        </div>

        {/* User Greeting and Back to Analyzer */}
        <div className="border-t border-gray-700 pt-4">
          <p className="text-sm text-center mb-2">Olá, {getUserName()}!</p>
          <button
            onClick={() => onMenuSelect('analyzer')}
            className={`w-full flex items-center hover:bg-gray-800 p-2 rounded ${
              selectedMenu === 'analyzer' ? 'bg-gray-700' : ''
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            {isExpanded && <span className="ml-2">Voltar ao Analyzer</span>}
          </button>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center hover:bg-gray-800 p-2 rounded text-red-400 hover:text-red-300 mt-4"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {isExpanded && <span className="ml-2">Logout</span>}
        </button>
      </div>
    </div>
  );
}