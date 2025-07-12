import React, { useState, useEffect } from 'react';
// Import the new settingsAPI
import { settingsAPI } from '../../services/pocketbase';
import { toast } from 'react-hot-toast';

const Stream = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        // Use the new settingsAPI
        const settingsData = await settingsAPI.getSettings();
        setSettings(settingsData);
      } catch (error) {
        console.error('Failed to fetch settings:', error);
        toast.error('Failed to load settings.');
      }
      setLoading(false);
    };

    fetchSettings();
  }, []);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({...prev, [name]: value}));
  }

  const handleSave = async () => {
    if (!settings) return;
    try {
        // Use the new settingsAPI to update
        await settingsAPI.updateSettings({
            publicStreamUrl: settings.publicStreamUrl,
            cdnStreamUrl: settings.cdnStreamUrl
        });
        toast.success('Stream settings updated!');
    } catch (error) {
        toast.error('Failed to save settings.');
    }
  }

  if (loading) return <p>Loading stream settings...</p>;
  if (!settings) return <p>Could not load settings.</p>;

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Stream Settings</h2>
      <div className="bg-gray-800 p-6 rounded-lg">
        <div className="mb-4">
          <label className="block mb-1">Public Player URL</label>
          <input type="text" name="publicStreamUrl" value={settings.publicStreamUrl || ''} onChange={handleChange} className="bg-gray-700 p-2 rounded w-full text-white" />
        </div>
        <div className="mb-4">
          <label className="block mb-1">CDN Stream URL</label>
          <input type="text" name="cdnStreamUrl" value={settings.cdnStreamUrl || ''} onChange={handleChange} className="bg-gray-700 p-2 rounded w-full text-white" />
        </div>
        <button onClick={handleSave} className="bg-blue-600 p-2 rounded">Save Changes</button>
      </div>
    </div>
  );
};

export default Stream;