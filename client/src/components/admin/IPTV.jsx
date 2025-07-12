import React from 'react';

const IPTV = () => {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">IPTV Management</h2>
      <div className="bg-gray-800 p-6 rounded-lg">
        <p>Here you will be able to add and configure IPTV channels.</p>
        {/* Placeholder for channel list and add form */}
        <div className="mt-4">
          <button className="bg-blue-600 p-2 rounded">Add New Channel</button>
        </div>
      </div>
    </div>
  );
};

export default IPTV;