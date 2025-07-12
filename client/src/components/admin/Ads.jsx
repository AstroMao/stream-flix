import React, { useState, useEffect } from 'react';
// Import pb for listing all ads, and settingsAPI for settings
import pb, { settingsAPI } from '../../services/pocketbase';
import { toast } from 'react-hot-toast';

const Ads = () => {
  const [ads, setAds] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Your adsAPI is for active/random ads. For the admin panel, we need all of them.
      // So, a direct call here is appropriate.
      const adsData = await pb.collection('ads').getFullList();
      
      // Use the new settingsAPI
      const settingsData = await settingsAPI.getSettings();

      setAds(adsData);
      setSettings(settingsData);
    } catch (error) {
      console.error('Failed to fetch ads/settings:', error);
      toast.error('Failed to load data.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);
  
  const handleSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value);
    setSettings(prev => ({...prev, [name]: val}));
  }

  const handleSaveSettings = async () => {
    if (!settings) return;
    try {
        // Use the new settingsAPI to update
        await settingsAPI.updateSettings(settings);
        toast.success('Settings updated!');
    } catch (error) {
        toast.error('Failed to save settings.');
        console.error(error);
    }
  }

  if (loading) return <p>Loading ad management...</p>;

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Advertisement Management</h2>
      
      {settings && (
        <div className="bg-gray-800 p-6 rounded-lg mb-8">
            <h3 className="text-xl font-bold mb-4">General Ad Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block mb-1">Ad Skip Delay (seconds)</label>
                    <input type="number" name="adSkipDelay" value={settings.adSkipDelay || ''} onChange={handleSettingsChange} className="bg-gray-700 p-2 rounded w-full text-white" />
                </div>
                 <div>
                    <label className="block mb-1">Ads Amount (per break)</label>
                    <input type="number" name="adsAmount" value={settings.adsAmount || ''} onChange={handleSettingsChange} className="bg-gray-700 p-2 rounded w-full text-white" />
                </div>
                <div>
                    <label className="block mb-1">Ad Volume (0 to 1)</label>
                    <input type="range" min="0" max="1" step="0.1" name="adVolume" value={settings.adVolume || 0} onChange={handleSettingsChange} className="w-full" />
                </div>
                <div className="flex items-center gap-2">
                     <input id="adsEnabledCheck" type="checkbox" name="adsEnabled" checked={settings.adsEnabled || false} onChange={handleSettingsChange} className="h-4 w-4 rounded" />
                    <label htmlFor="adsEnabledCheck">Ads Enabled</label>
                </div>
            </div>
            <button onClick={handleSaveSettings} className="bg-blue-600 p-2 rounded mt-4">Save Settings</button>
        </div>
      )}

      <div>
        <h3 className="text-xl font-bold mb-4">Available Ads</h3>
        <div className="bg-gray-800 p-4 rounded-lg">
            {ads.map(ad => (
                <div key={ad.id} className="flex justify-between items-center p-2 border-b border-gray-700">
                    <div>
                        <p className="font-bold">{ad.title}</p>
                        <p className="text-sm text-gray-400">Duration: {ad.duration}s | Weight: {ad.weight}</p>
                    </div>
                    <div>
                        <button className={`text-sm p-1 rounded mr-2 ${ad.enabled ? 'bg-green-600' : 'bg-gray-600'}`}>{ad.enabled ? 'Enabled' : 'Disabled'}</button>
                        <button className="text-sm bg-yellow-600 p-1 rounded mr-2">Edit</button>
                        <button className="text-sm bg-red-600 p-1 rounded">Remove</button>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Ads;