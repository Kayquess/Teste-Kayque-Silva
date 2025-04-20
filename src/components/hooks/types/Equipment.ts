export type Position = {
  lat: number;
  lng: number;
  timestamp: string; 
};

export type Equipment = {
  id: string;
  name: string;
  positions?: Position[]; 
  status?: 'ativo' | 'parado' | 'ocioso'; 
};
