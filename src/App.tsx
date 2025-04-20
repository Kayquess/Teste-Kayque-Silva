import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import MapComponent from './components/MapComponent';

const App = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const handleResetMap = () => {
    console.log('Mapa resetado'); 
  };

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        closeSidebar={closeSidebar}
        onResetMap={handleResetMap}
      />
      <div
        style={{
          flex: 1,
          marginLeft: isSidebarOpen ? '250px' : '0',
          transition: 'margin-left 0.3s',
        }}
      >
        <MapComponent />
      </div>
    </div>
  );
};

export default App;
