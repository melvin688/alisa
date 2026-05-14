
export interface Product {
  id: string;
  name: string;
  name_zh: string;
  description: string;
  description_zh: string;
  price: number;
  image: string;
  tags: string[];
  tags_zh: string[];
  notes: string[];
  notes_zh: string[];
  category: 'beans' | 'drink';
}

export interface CustomizationOptions {
  temperature: 'Hot' | 'Ice';
  sweetness: number; // 0-100
  strength: number; // 0-100
}

export interface CartItem extends Product {
  quantity: number;
  customization?: CustomizationOptions;
}

export enum Page {
  HOME = 'HOME',
  SHOP = 'SHOP',
  ABOUT = 'ABOUT',
  LOCATIONS = 'LOCATIONS'
}

export type Language = 'en' | 'zh';
