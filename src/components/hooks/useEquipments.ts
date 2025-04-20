import equipmentData from '../data/equipment.json';
import positionData from '../data/equipmentPositionHistory.json';
import stateData from '../data/equipmentStateHistory.json';

export interface Position {
  equipmentId: string;
  lat: number;
  lng: number;
  timestamp: string;
}

export interface State {
  equipmentId: string;
  stateId: 'ativo' | 'parado' | 'ocioso'; 
  timestamp: string;
}

export interface Equipment {
  id: string;
  name: string;
  status: 'ativo' | 'parado' | 'ocioso' | undefined; 
  positions?: Position[]; 
}


const isValidEquipment = (data: any): data is Equipment => {
  return (
    data &&
    typeof data.id === 'string' &&
    typeof data.name === 'string' &&
    typeof data.status === 'string' &&
    Array.isArray(data.positions) &&
    data.positions.every(
      (p: any) => typeof p.lat === 'number' && typeof p.lng === 'number'
    )
  );
};


const equipments: Equipment[] = (equipmentData as any[]).filter(isValidEquipment);

const positions: Position[] = positionData as Position[];
const states: State[] = stateData as State[];

const getLatestPositions = () => {
  return equipments.map((equip) => {
    const positionHistory = positions
      .filter((p) => p.equipmentId === equip.id)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const lastPosition = positionHistory.length > 0 ? positionHistory[0] : null;
    return {
      ...equip,
      positions: lastPosition
        ? [{ lat: lastPosition.lat, lng: lastPosition.lng, timestamp: lastPosition.timestamp }]
        : [{ lat: 0, lng: 0, timestamp: '' }],
    };
  });
};

const getLatestStates = () => {
  return equipments.map((equip) => {
    const stateHistory = states
      .filter((s) => s.equipmentId === equip.id)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const lastState = stateHistory.length > 0 ? stateHistory[0] : null;
    return {
      equipmentId: equip.id,
      status: lastState ? lastState.stateId : 'ativo', 
    };
  });
};

const updateMapPositions = () => {
  const latestPositions = getLatestPositions();
  return latestPositions.map((equip) => {
    return {
      id: equip.id,
      lat: equip.positions[0].lat,
      lng: equip.positions[0].lng,
    };
  });
};

const startPositionUpdater = (callback: Function) => {
  setInterval(() => {
    callback(getLatestPositions());
  }, 5000); 
};

export const useEquipments = () => {
  return {
    equipments,
    positions,
    states,
    getLatestPositions,
    getLatestStates,
    updateMapPositions,
    startPositionUpdater,
  };
};
