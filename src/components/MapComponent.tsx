import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { LatLngExpression } from 'leaflet';
import L from 'leaflet';

function ResetMapControl({ trigger }: { trigger: boolean }) {
  const map = useMap();

  useEffect(() => {
    if (trigger) {
      map.setView([-23.55052, -46.633308], 13); 
    }
  }, [trigger]);

  return null;
}

interface Equipment {
  id: string;
  name: string;
  status: string;
  positions: { lat: number; lng: number }[];
}

const MapComponent: React.FC = () => {
  const position: LatLngExpression = [-23.55052, -46.633308]; 

  const [markers, setMarkers] = useState<any[]>([]); 
  const [previousPositions, setPreviousPositions] = useState<Record<string, { lat: number; lng: number }[]>>({}); 
  const [equipmentIndexes, setEquipmentIndexes] = useState<Record<string, number>>({}); 
  const [resetMap, setResetMap] = useState(false); 

 
  const equipments: Equipment[] = [
    {
      id: '1',
      name: 'Escavadeira 1',
      status: 'Operando',
      positions: [
        { lat: -23.55052, lng: -46.633308 },
        { lat: -23.55152, lng: -46.634308 },
        { lat: -23.55252, lng: -46.635308 },
        { lat: -23.55352, lng: -46.636308 },
        { lat: -23.55000, lng: -46.63000 },
      ],
    },
    {
      id: '2',
      name: 'Trator 2',
      status: 'parado',
      positions: [
        { lat: -23.55100, lng: -46.631308 },
        { lat: -23.55200, lng: -46.632308 },
        { lat: -23.55050, lng: -46.633500 },
        { lat: -23.55150, lng: -46.634500 },
        { lat: -23.55300, lng: -46.635500 },
      ],
    },
    {
      id: '3',
      name: 'Caminhão 3',
      status: 'manutenção',
      positions: [
        { lat: -23.55352, lng: -46.637308 },
        { lat: -23.55452, lng: -46.638308 },
        { lat: -23.55200, lng: -46.639308 },
        { lat: -23.55100, lng: -46.640308 },
        { lat: -23.55000, lng: -46.641308 },
      ],
    },
  ];

  const activeIcon = new L.Icon({
    iconUrl: '/imagens/escavadeira.png',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });

  const inactiveIcon = new L.Icon({
    iconUrl: '/imagens/trator.png',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });

  const maintenanceIcon = new L.Icon({
    iconUrl: '/imagens/caminhao.png',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });

  const advanceSimulation = () => {
    setEquipmentIndexes((prevIndexes) => {
      const newIndexes = { ...prevIndexes };
      equipments.forEach((equip) => {
        if (equip.status === 'parado' || equip.status === 'manutenção') {
          newIndexes[equip.id] = 0;
        } else {
          const currentIndex = prevIndexes[equip.id] ?? 0;
          const newIndex = currentIndex + 1 < equip.positions.length ? currentIndex + 1 : 0;
          newIndexes[equip.id] = newIndex;
        }
      });
      return newIndexes;
    });
  };

  const addMarkers = () => {
    setMarkers(
      equipments.map((equip) => ({
        id: equip.id,
        position: equip.positions[0],
        name: equip.name,
        status: equip.status,
      }))
    );
  };

 
  const handleResetMap = () => {
    setResetMap(true);
    setTimeout(() => setResetMap(false), 200); 
  };

  useEffect(() => {
    equipments.forEach((equip) => {
      setPreviousPositions((prevState) => {
        const newPositions = { ...prevState };
        const currentIndex = equipmentIndexes[equip.id] ?? 0;
        const pos = equip.positions[currentIndex];
        if (pos) {
          if (!newPositions[equip.id]) newPositions[equip.id] = [];
          newPositions[equip.id] = [...newPositions[equip.id], { lat: pos.lat, lng: pos.lng }];
        }
        return newPositions;
      });
    });
  }, [equipmentIndexes]);

  
  useEffect(() => {
    const interval = setInterval(() => {
      advanceSimulation();
    }, 5000);
    return () => clearInterval(interval);
  }, [equipmentIndexes]);

  useEffect(() => {
    addMarkers();
  }, []);


  const ResetButton = () => {
    const map = useMap();

    useEffect(() => {
      const resetButton = L.DomUtil.create('button', 'leaflet-bar leaflet-control leaflet-control-custom');
      resetButton.innerHTML = '🔄';
      resetButton.style.backgroundColor = 'transparent'; 
      resetButton.style.border = 'none';
      resetButton.style.color = 'white'; 
      resetButton.style.fontSize = '20px';
      resetButton.style.padding = '10px';
      resetButton.style.cursor = 'pointer';
      resetButton.style.position = 'absolute';
      resetButton.style.top = '10px';
      resetButton.style.right = '10px';
      resetButton.style.zIndex = '1000'; 

      resetButton.onclick = () => {
        map.setView([-23.55052, -46.633308], 13); 
        handleResetMap();
      };

      map.getContainer().appendChild(resetButton);

      return () => {
        map.getContainer().removeChild(resetButton);
      };
    }, [map]);

    return null;
  };

  return (
    <div style={{ width: '100%', height: '100vh', backgroundColor: 'transparent' }}>
      <MapContainer center={position} zoom={13} style={{ width: '100%', height: '100%' }} scrollWheelZoom={true}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <ResetMapControl trigger={resetMap} />
        <ResetButton /> 

        {markers.map((marker) => {
          const currentIndex = equipmentIndexes[marker.id] ?? 0;
          const pos = equipments.find((equip) => equip.id === marker.id)?.positions[currentIndex];
          if (!pos) return null;

          const status = marker.status ?? 'ativo';
          let icon;
          let color;

          if (status === 'manutenção') {
            icon = maintenanceIcon;
            color = 'red';
          } else if (status === 'parado') {
            icon = inactiveIcon;
            color = 'yellow';
          } else {
            icon = activeIcon;
            color = 'green';
          }

          return (
            <Marker key={marker.id} position={[pos.lat, pos.lng]} icon={icon}>
              <Popup>
                <strong>{marker.name}</strong><br />
                Status: {status}
              </Popup>
            </Marker>
          );
        })}

        {equipments.map((equip) => {
          const positions = previousPositions[equip.id] ?? [];
          if (positions.length > 1) {
            const color =
              equip.status === 'manutenção'
                ? 'red'
                : equip.status === 'parado'
                ? 'yellow'
                : 'green';
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
};

export default MapComponent;
