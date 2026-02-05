// src/data/argentinaLocations.ts
// Minimal Argentina locations dataset for autocomplete/selectors.
// Extend as needed or replace with backend-driven data.

export const provinces: string[] = [
  'Buenos Aires',
  'Ciudad Autónoma de Buenos Aires',
  'Córdoba',
  'Santa Fe',
  'Mendoza',
  'Tucumán',
  'Entre Ríos',
  'Salta',
  'Neuquén',
  'Río Negro',
  'Chubut',
  'San Luis',
  'San Juan',
  'La Pampa',
  'Santiago del Estero',
  'Corrientes',
  'Misiones',
  'Jujuy',
  'Catamarca',
  'La Rioja',
  'Formosa',
  'Chaco',
  'Santa Cruz',
  'Tierra del Fuego'
];

export const citiesByProvince: Record<string, string[]> = {
  'Buenos Aires': [
    'La Plata', 'Mar del Plata', 'Bahía Blanca', 'Tandil', 'San Nicolás', 'Quilmes', 'Lomas de Zamora', 'Avellaneda'
  ],
  'Ciudad Autónoma de Buenos Aires': [
    'Palermo', 'Recoleta', 'Belgrano', 'Caballito', 'Flores', 'Villa Urquiza', 'Almagro', 'San Telmo'
  ],
  'Córdoba': [
    'Córdoba Capital', 'Villa Carlos Paz', 'Río Cuarto', 'Villa María', 'Alta Gracia'
  ],
  'Santa Fe': [
    'Rosario', 'Santa Fe', 'Rafaela', 'Venado Tuerto'
  ],
  'Mendoza': [
    'Mendoza', 'San Rafael', 'Godoy Cruz', 'Guaymallén', 'Luján de Cuyo'
  ],
  'Tucumán': ['San Miguel de Tucumán', 'Tafí Viejo', 'Yerba Buena'],
  'Entre Ríos': ['Paraná', 'Concordia', 'Gualeguaychú'],
  'Salta': ['Salta', 'Tartagal', 'Orán'],
  'Neuquén': ['Neuquén', 'Plottier', 'Cutral Co'],
  'Río Negro': ['Bariloche', 'General Roca', 'Viedma'],
  'Chubut': ['Comodoro Rivadavia', 'Trelew', 'Puerto Madryn'],
  'San Luis': ['San Luis', 'Villa Mercedes'],
  'San Juan': ['San Juan', 'Rawson'],
  'La Pampa': ['Santa Rosa', 'General Pico'],
  'Santiago del Estero': ['Santiago del Estero', 'La Banda'],
  'Corrientes': ['Corrientes', 'Goya'],
  'Misiones': ['Posadas', 'Oberá'],
  'Jujuy': ['San Salvador de Jujuy', 'Palpalá'],
  'Catamarca': ['San Fernando del Valle de Catamarca'],
  'La Rioja': ['La Rioja', 'Chilecito'],
  'Formosa': ['Formosa'],
  'Chaco': ['Resistencia', 'Barranqueras'],
  'Santa Cruz': ['Río Gallegos', 'Caleta Olivia'],
  'Tierra del Fuego': ['Ushuaia', 'Río Grande']
};
