import { useEffect, useState } from 'react';
import { Equipment } from '../hooks/types/Equipment';  
import { useSimulation } from '../hooks/useSimulation';
import { MapContainer, Marker, Popup, TileLayer, Polyline } from 'react-leaflet';
import { getCustomIcon } from './utils/icons';
import 'leaflet/dist/leaflet.css';

interface DashboardProps {
  equipments: Equipment[];
  isPlaying: boolean;
}

export default function Dashboard({ equipments, isPlaying }: DashboardProps) {
  const { equipmentIndexes } = useSimulation({
    equipments,
    isPlaying,
  });

 
  const [previousPositions, setPreviousPositions] = useState<Record<string, { lat: number; lng: number }[]>>({});

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
       
        setPreviousPositions((prevState) => {
          const newPositions = { ...prevState };
          equipments.forEach((equip) => {
            const currentIndex = equipmentIndexes[equip.id] ?? 0;
            const pos = equip.positions?.[currentIndex];
            if (pos) {
              
              if (!newPositions[equip.id]) newPositions[equip.id] = [];
              newPositions[equip.id] = [...newPositions[equip.id], { lat: pos.lat, lng: pos.lng }];
            }
          });
          return newPositions;
        });
      }, 5000);  

      return () => clearInterval(interval);
    }
  }, [isPlaying, equipmentIndexes, equipments]);

  return (
    <div>
      <MapContainer center={[-15, -55]} zoom={5} style={{ height: '100vh', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {equipments.map((equip) => {
          const currentIndex = equipmentIndexes[equip.id] ?? 0;
          const pos = equip.positions?.[currentIndex]; 
          
          if (!pos) return null;  

          const status = equip.status ?? 'ativo';

          return (
            <Marker
              key={equip.id}
              position={[pos.lat, pos.lng]} 
              icon={getCustomIcon(status)}
            >
              <Popup>
                <strong>{equip.name}</strong><br />
                Status: {status}
              </Popup>
            </Marker>
          );
        })}

        {equipments.map((equip) => {
          const positions = previousPositions[equip.id] ?? [];
          
          if (positions.length > 1) {
            const color = equip.status === 'ativo' ? 'green' : 'yellow';  
            return (
              <Polyline
                key={`line-${equip.id}`}
                positions={positions}
                color={color}
                weight={4}
                opacity={0.7}
              />
            );
          }

          return null;
        })}
      </MapContainer>
    </div>
  );
}
