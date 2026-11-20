export interface StdRC {
  nrollno: string;
  stname: string;
  euno: number; // Semester Number
  papercode: string;
  papername: string;
  fee?: number;
}

export type AppearingList = StdRC[];
