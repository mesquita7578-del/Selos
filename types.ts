
export enum Continent {
  AFRICA = 'Africa',
  AMERICAS = 'Americas',
  ASIA = 'Asia',
  EUROPE = 'Europe',
  OCEANIA = 'Oceania'
}

export enum ItemCondition {
  MINT = 'MINT',
  NOVO = 'Novo',
  USADO = 'Usado',
  FDC = 'FDC'
}

export enum ItemType {
  STAMP = 'Selo',
  POSTCARD = 'Postal',
  ENVELOPE = 'Envelope FDC',
  OTHER = 'Outro'
}

export interface PhilatelyItem {
  id: string;
  type: ItemType;
  country: string;
  continent: Continent;
  date: string;
  value: string;
  theme: string;
  condition: ItemCondition;
  notes: string;
  imageFront: string;
  imageBack: string;
  createdAt: number;
}

export interface CollectionStats {
  totalItems: number;
  byContinent: Record<string, number>;
  byType: Record<string, number>;
  byCondition: Record<string, number>;
}
