export interface INFT_ASSET {
  name: string;
  description: string;
  image: string;
  price: number;
}

export interface INFT_TOKEN {
  id: number;
  cant: number;
  asset: string;
}
