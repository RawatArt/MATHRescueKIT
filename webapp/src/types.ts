export interface Part {
  id: string;
  num: string;
  name: string;
  th: string;
  cardCount: number;
  accent: string;
  gridHTML: string;
}

export interface Subject {
  id: string;
  name: string;
  th: string;
  desc: string;
  glyph: string;
  accent: string;
  parts: Part[];
}

export interface SubjectMeta {
  id: string;
  name: string;
  th: string;
  glyph: string;
  accent: string;
}
