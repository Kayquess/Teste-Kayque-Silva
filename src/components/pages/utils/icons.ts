import L from 'leaflet';

export function getCustomIcon(status: string) {
  let color = 'gray';

  switch (status) {
    case 'ativo':
      color = 'green';
      break;
    case 'parado':
      color = 'red';
      break;
    case 'ocioso':
      color = 'orange';
      break;
  }

  return L.divIcon({
    className: 'custom-icon',
    html: `<div style="
      background-color: ${color};
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 0 6px ${color};
    "></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}
