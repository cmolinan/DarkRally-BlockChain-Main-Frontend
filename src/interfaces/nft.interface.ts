export interface INFT_ASSET {
  name: string;
  description: string;
  image: string;
  attributes: Attribute[];
}

export interface INFT_TOKEN {
  id: number;
  cant: number;
  asset: string;
}

export interface Attribute {
  trait_type: string;
  value: string;
}
