import type { AiEntityConfig } from "../aiEntityTypes";

export interface Audience {
  id: string;
  name: string;
  size: string;
  cpm: string;
  overlap: string;
  region: string;
}

export const AUDIENCE_CONFIG: AiEntityConfig<Audience> = {
  getKey: (a) => a.id,
  single: {
    getTitle: (a) => a.name,
    columns: [
      { key: "size",    getDescription: (a) => a.size },
      { key: "cpm",     getDescription: (a) => a.cpm },
      { key: "overlap", getDescription: (a) => a.overlap },
      { key: "region",  getDescription: (a) => a.region },
    ],
  },
  multiple: {
    getTitle: (a) => a.name,
    columns: [
      { key: "size", getDescription: (a) => a.size },
      { key: "cpm",  getDescription: (a) => a.cpm },
    ],
  },
};
