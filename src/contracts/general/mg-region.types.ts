export interface MGRegionPhone {
  id: number;
  region: {
    id: number;
    title: string;
  };
  phone: string;
  city: string;
}

export interface MGRegion {
  region: {
    id: number;
    title: string;
  };
  city: string;
  phones: string[];
} 