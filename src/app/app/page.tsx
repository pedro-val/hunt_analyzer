"use client";

import { useState } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Analyzer } from '@/components/hunt/Analyzer';
import ProtectedAddHunt from './protected/add-hunt/page';
import ProtectedAddRotation from './protected/add-rotation/page';
import ProtectedReports from './protected/reports/page';
import PersonalInfoPage from './personal-info/page';

export default function DashboardPage() {
  const [selectedMenu, setSelectedMenu] = useState('analyzer');

  return (
    <div className="flex h-screen">
      <Sidebar 
        onMenuSelect={setSelectedMenu} 
        selectedMenu={selectedMenu}
      />
      
      <div className="flex-1 overflow-auto">
        {selectedMenu === 'analyzer' && (
          <div className="bg-gray-100 p-4 h-full">
            <Analyzer />
          </div>
        )}
        {selectedMenu === 'add-hunt' && <ProtectedAddHunt />}
        {selectedMenu === 'add-rotation' && <ProtectedAddRotation />}
        {selectedMenu === 'reports' && <ProtectedReports />}
        {selectedMenu === 'personal-info' && <PersonalInfoPage />}
      </div>
    </div>
  );
}
