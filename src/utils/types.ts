export type PaginationType = {
  pageSize: number;
  page: number;
};

export type StatusType = "success" | "error" | "processing";

export interface DocumentType {
  id: string;
  code: string;
  name: string;
  status: StatusType;
  progress?: number;
  createdAt: string;
  min: number;
  max: number;
}

export type UploadFormType = {
  name: string;
  code: string;
  min: number;
  max: number;
};

export type TextType = {
  id: string;
  text: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  x3: number;
  y3: number;
  x4: number;
  y4: number;
};

export type AttributesType = {
  id: string;
  name: string;
  value: string;
  confidence: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  x3: number;
  y3: number;
  x4: number;
  y4: number;
};

type Point = { x: number; y: number };
export type PointsType = [Point, Point, Point, Point];

export type PageDataType = {
  data: {
    id: string;
    thumb: string;
    original: string;
    number: number;
    fullText: TextType[];
    attrs: AttributesType[];
  }[];
  total: number;
};

export type GetDTO<T> = {
  data: T[];
  total: number;
};
