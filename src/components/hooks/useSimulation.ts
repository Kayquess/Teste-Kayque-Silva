import { useEffect, useState } from 'react';
import { Equipment } from '../hooks/types/Equipment';  
interface SimulationProps {
  equipments: Equipment[];
  isPlaying: boolean;
}

export function useSimulation({ equipments, isPlaying }: SimulationProps) {
  const [equipmentIndexes, setEquipmentIndexes] = useState<Record<string, number>>({});
  
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        advanceSimulation();
      }, 5000);  

      return () => clearInterval(interval); 
    }
  }, [isPlaying]);

  const advanceSimulation = () => {
    setEquipmentIndexes((prevIndexes) => {
      const newIndexes = { ...prevIndexes };

      equipments.forEach((equip) => {
       
        const currentIndex = prevIndexes[equip.id] ?? 0;

        const positionsLength = equip.positions?.length ?? 0; 
        const newIndex = positionsLength > 0 && currentIndex + 1 < positionsLength
          ? currentIndex + 1
          : 0;  
          
        newIndexes[equip.id] = newIndex;
      });

      return newIndexes;
    });
  };

  const manualAdvance = () => {
    advanceSimulation();
  };

  return {
    equipmentIndexes,
    manualAdvance,
  };
}
