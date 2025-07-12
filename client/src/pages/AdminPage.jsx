import React, { useState } from 'react';
import { FiGrid, FiFilm, FiTv, FiVolume2, FiSettings } from 'react-icons/fi';
import Dashboard from '../components/admin/Dashboard';
import Library from '../components/admin/Library';
import IPTV from '../components/admin/IPTV';
import Ads from '../components/admin/Ads';
import Stream from '../components/admin/Stream';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('Library');

  const navItems = [
    { name: 'Dashboard', icon: <FiGrid /> },
    { name: 'Library', icon: <FiFilm /> },
    { name: 'IPTV', icon: <FiTv /> },
    { name: 'Ads', icon: <FiVolume2 /> },
    { name: 'Stream', icon: <FiSettings /> },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard':
        return <Dashboard />;
      case 'Library':
        return <Library />;
      case 'IPTV':
        return <IPTV />;
      case 'Ads':
        return <Ads />;
      case 'Stream':
        return <Stream />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 p-5">
        <h1 className="text-2xl font-bold mb-10">Admin Panel</h1>
        <nav>
          <ul>
            {navItems.map((item) => (
              <li key={item.name} className="mb-4">
                <button
                  onClick={() => setActiveTab(item.name)}
                  className={`flex items-center w-full text-left p-2 rounded-lg transition-colors ${
                    activeTab === item.name
                      ? 'bg-blue-600'
                      : 'hover:bg-gray-700'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-auto">
        {renderContent()}
      </main>
    </div>
  );
};

export default AdminPage;