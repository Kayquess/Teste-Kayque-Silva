import React, { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  onResetMap: () => void;
}

interface Machine {
  id: number;
  name: string;
  status: 'operando' | 'parada' | 'manutenção';
  lastStatusChange: number;
  hourlyRate: { operating: number, maintenance: number };
}

const Sidebar = ({ isOpen, toggleSidebar, closeSidebar, onResetMap }: SidebarProps) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [workedSeconds, setWorkedSeconds] = useState(0);
  const [inactiveSeconds, setInactiveSeconds] = useState(0);
  const [maintenanceSeconds, setMaintenanceSeconds] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const machines: Machine[] = [
    { id: 1, name: 'Escavadeira', status: 'operando', lastStatusChange: Date.now() - 1000 * 60 * 10, hourlyRate: { operating: 100, maintenance: -20 } },
    { id: 2, name: 'Trator', status: 'parada', lastStatusChange: Date.now() - 1000 * 60 * 30, hourlyRate: { operating: 100, maintenance: -20 } },
    { id: 3, name: 'Caminhão', status: 'manutenção', lastStatusChange: Date.now() - 1000 * 60 * 20, hourlyRate: { operating: 100, maintenance: -20 } }
  ];

  const totalAvailableSeconds = 24 * 60 * 60;

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}min`;
  };

  const filteredMachines = machines.filter((machine) => machine.name.toLowerCase().includes(searchTerm.toLowerCase()));

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      setWorkedSeconds((prev) => prev + 1);

      machines.forEach((machine) => {
        if (machine.status === 'parada') {
          setInactiveSeconds((prev) => prev + 1);
        } else if (machine.status === 'manutenção') {
          setMaintenanceSeconds((prev) => prev + 1);
        } else if (machine.status === 'operando') {
          setWorkedSeconds((prev) => prev + 1);
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [machines]);

  const workedPercent = Math.min((workedSeconds / totalAvailableSeconds) * 100, 100);
  const inactivePercent = Math.min((inactiveSeconds / totalAvailableSeconds) * 100, 100);
  const maintenancePercent = Math.min((maintenanceSeconds / totalAvailableSeconds) * 100, 100);

  const resetDashboard = () => {
    setWorkedSeconds(0);
    setInactiveSeconds(0);
    setMaintenanceSeconds(0);
    onResetMap();
  };

  const calculateProductivity = (machine: Machine) => {
    const operatingHours = machine.status === 'operando' ? workedSeconds : 0;
    return (operatingHours / totalAvailableSeconds) * 100;
  };

  const calculateEarnings = (machine: Machine) => {
    const operatingHours = machine.status === 'operando' ? workedSeconds : 0;
    const maintenanceHours = machine.status === 'manutenção' ? workedSeconds : 0;
    return (operatingHours * machine.hourlyRate.operating) + (maintenanceHours * machine.hourlyRate.maintenance);
  };

  const chartData = {
    labels: ['Operando', 'Parada', 'Manutenção'],
    datasets: [
      {
        label: 'Distribuição de tempo (%)',
        data: [workedPercent, inactivePercent, maintenancePercent],
        backgroundColor: ['#00ff88', '#ffcc00', '#ff5733'],
        borderColor: ['#00c470', '#e6b800', '#cc4626'],
        borderWidth: 1
      }
    ]
  };

  return (
    <div>
      {!isOpen && (
        <button
          onClick={toggleSidebar}
          style={{
            position: 'absolute',
            top: '10px',
            left: '80px',
            backgroundColor: '#28a745',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            padding: '10px',
            fontSize: '30px',
            cursor: 'pointer',
            zIndex: 1010
          }}
        >
          ☰
        </button>
      )}

      <div
        style={{
          width: isOpen ? '260px' : '0',
          transition: 'none',
          backgroundColor: '#111',
          color: '#fff',
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          overflowX: 'hidden',
          padding: isOpen ? '20px' : '0',
          zIndex: 1000,
          fontFamily: 'Arial, sans-serif',
        }}
      >
        {isOpen && (
          <>
            <button
              onClick={closeSidebar}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontSize: '30px',
                cursor: 'pointer'
              }}
            >
              ×
            </button>

            <h2 style={{
              marginTop: '40px',
              fontSize: '22px',
              fontWeight: 'bold',
              color: '#00ff88',
              borderBottom: '1px solid #333',
              paddingBottom: '10px'
            }}>
              Informações Gerais
            </h2>

            <input
              type="text"
              placeholder="Pesquisar por equipamento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '10px',
                marginTop: '10px',
                marginBottom: '20px',
                width: '100%',
                borderRadius: '5px',
                border: '1px solid #ccc',
                color: 'black',
              }}
            />

            {filteredMachines.map((machine) => (
              <div key={machine.id} style={{
                backgroundColor: '#444',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '15px',
                boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
                transition: 'background-color 0.3s',
              }}>
                <h3 style={{
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  color: '#fff'
                }}>
                  {machine.name}
                </h3>
                <p style={{ color: '#fff' }}>
                  Status: {machine.status}
                </p>
                <p style={{ color: '#fff' }}>
                  Produtividade: {calculateProductivity(machine).toFixed(2)}%
                </p>
                <p style={{ color: '#fff' }}>
                  Ganho: R${calculateEarnings(machine).toFixed(2)}
                </p>
              </div>
            ))}

            <div style={{ marginTop: '30px', height: '200px' }}>
              <Doughnut data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
