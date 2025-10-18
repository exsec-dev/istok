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

export type Attribute = "name" | "address" | "date";

export type ExportFormType = {
  format: "csv" | "xlsx" | "xml";
  source: "text" | "attrs";
  attrs?: Attribute[];
  includeCode: boolean;
  includeConf: boolean;
};

export type TextType = {
  id: string;
  text: string;
  confidence: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  x3: number;
  y3: number;
  x4: number;
  y4: number;
  edited?: boolean;
};

export type AttributeType = {
  id: string;
  name: Attribute;
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
  id: string;
  thumb: string;
  original: string;
  number: number;
  fullText: TextType[];
  attrs: AttributeType[];
};

export type GetDTO<T> = {
  data: T[];
  total: number;
};
