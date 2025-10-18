import type { TextType, ExportFormType } from "./types";
import { Flex } from "antd";
import { CaretDownFilled, CaretUpFilled } from "@ant-design/icons";

export const ROUTE_PATHS = {
  DOCUMENT: "/view/:id",
  DOCUMENT_PAGE: "/view/:id/:number",
};

export const formatDate = (isoString: string): string => {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
};

export const getConfidenceObj = (
  confidence: number = 0,
  min: number = 30,
  max: number = 85
) => {
  if (confidence === 0) {
    return {
      color: "var(--text-color)",
      icon: null,
    };
  }
  if (confidence >= max) {
    return {
      color: "var(--success-color)",
      icon: (
        <CaretUpFilled
          style={{
            color: "var(--success-color)",
            position: "relative",
            bottom: 2,
            fontSize: "10px",
          }}
        />
      ),
    };
  }
  if (confidence >= min) {
    return {
      color: "var(--warning-color)",
      icon: (
        <Flex
          vertical
          style={{ color: "var(--warning-color)", fontSize: "10px" }}
        >
          <CaretUpFilled style={{ position: "relative", top: 2 }} />
          <CaretDownFilled style={{ position: "relative", bottom: 2 }} />
        </Flex>
      ),
    };
  }
  return {
    color: "var(--error-color)",
    icon: <CaretDownFilled style={{ color: "var(--error-color)" }} />,
  };
};

export const FALLBACK_IMAGE =
  "data:image/png;base64,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";

export const blocksPreprocess = (raw: string): TextType[] => {
  const data = JSON.parse(raw);
  /* Edited text */
  if (Array.isArray(data) && data.length > 0 && Object.hasOwn(data[0], "id"))
    return data;

  /* Raw text */
  if (!Array.isArray(data) || data.length !== 4) return [];
  const [points, texts, confidences] = data;

  const k = data[3] === 0 ? 1 : data[3];
  const result: TextType[] = [];

  for (let i = 0; i < points.length; i++) {
    const block: TextType = {
      id: i.toString(),
      x1: points[i][0][0] * k,
      y1: points[i][0][1] * k,
      x2: points[i][1][0] * k,
      y2: points[i][1][1] * k,
      x3: points[i][2][0] * k,
      y3: points[i][2][1] * k,
      x4: points[i][3][0] * k,
      y4: points[i][3][1] * k,
      text: texts[i],
      confidence: confidences[i],
    };
    result.push(block);
  }

  return result;
};

/*--------------Export utils--------------*/

const round = (n: number): number | string => {
  const s = n.toString();
  if (/\.\d{7,}/.test(s)) return Number(n.toFixed(6));
  return n;
};

const coordsCell = (r: TextType): string => {
  return [
    [r.x1, r.y1],
    [r.x2, r.y2],
    [r.x3, r.y3],
    [r.x4, r.y4],
  ]
    .map((item) => item.map((value) => round(value)).join(":"))
    .join("|");
};

const escapeCSV = (value: unknown): string => {
  const s = value == null ? "" : String(value);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
};

const escapeXMLText = (s: unknown) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const escapeXMLAttr = (s: unknown) =>
  escapeXMLText(s).replace(/"/g, "&quot;").replace(/'/g, "&apos;");

const buildCSV = (
  rows: TextType[],
  codeParts?: [string, string, string],
  includeConf = true
): string => {
  const lines: string[] = [];

  if (codeParts) {
    lines.push(["Фонд", "Опись", "Дело"].map(escapeCSV).join(","));
    lines.push([codeParts].map(escapeCSV).join(","));
    lines.push("");
  }

  if (includeConf) {
    lines.push(
      ["ID", "Текст", "Координаты", "Уверенность"].map(escapeCSV).join(",")
    );
    for (const r of rows) {
      lines.push(
        [r.id, r.text, coordsCell(r), round(r.confidence)]
          .map(escapeCSV)
          .join(",")
      );
    }
  } else {
    lines.push(["ID", "Текст", "Координаты"].map(escapeCSV).join(","));
    for (const r of rows) {
      lines.push([r.id, r.text, coordsCell(r)].map(escapeCSV).join(","));
    }
  }

  return lines.join("\n");
};

const buildXML = (
  rows: TextType[],
  filename: string,
  codeParts?: [string, string, string],
  includeConf = true
): string => {
  const indent = (lvl: number) => "  ".repeat(lvl);
  const lines: string[] = [];

  lines.push('<?xml version="1.0" encoding="UTF-8"?>');
  lines.push(`<${filename}>`);

  if (codeParts) {
    const [fond, opis, delo] = codeParts;
    lines.push(`${indent(1)}<code>`);
    lines.push(`${indent(2)}<fond>${escapeXMLText(fond)}</fond>`);
    lines.push(`${indent(2)}<opis>${escapeXMLText(opis)}</opis>`);
    lines.push(`${indent(2)}<delo>${escapeXMLText(delo)}</delo>`);
    lines.push(`${indent(1)}</code>`);
  }

  lines.push(
    `${indent(1)}<rows includeConfidence="${includeConf ? "true" : "false"}">`
  );

  for (const r of rows) {
    lines.push(`${indent(2)}<row id="${escapeXMLAttr(r.id)}">`);
    lines.push(`${indent(3)}<text>${escapeXMLText(r.text)}</text>`);
    lines.push(`${indent(3)}<coords>${escapeXMLText(coordsCell(r))}</coords>`);
    if (includeConf) {
      lines.push(
        `${indent(3)}<confidence>${escapeXMLText(round(r.confidence))}</confidence>`
      );
    }
    lines.push(`${indent(2)}</row>`);
  }

  lines.push(`${indent(1)}</rows>`);
  lines.push(`</${filename}>`);

  return lines.join("\n");
};

const triggerDownload = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

export async function downloadTexts(
  data: TextType[],
  filename: string,
  format: ExportFormType["format"],
  code?: string,
  includeConf = true
) {
  const codeParts = code?.split("-") as [string, string, string] | undefined;

  /* CSV */
  if (format === "csv") {
    const csv = buildCSV(data, codeParts, includeConf);
    const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" });
    triggerDownload(blob, `${filename}.csv`);
    return;
  }

  /* XLSX */
  if (format === "xlsx") {
    const XLSX = await import("xlsx");
    const aoa: (string | number)[][] = [];

    if (codeParts) {
      aoa.push(["Фонд", "Опись", "Дело"]);
      aoa.push(codeParts);
      aoa.push([]);
    }

    if (includeConf) {
      aoa.push(["ID", "Текст", "Координаты", "Уверенность"]);
      for (const r of data) {
        aoa.push([r.id, r.text, coordsCell(r), round(r.confidence)]);
      }
    } else {
      aoa.push(["ID", "Текст", "Координаты"]);
      for (const r of data) {
        aoa.push([r.id, r.text, coordsCell(r)]);
      }
    }

    const ws = XLSX.utils.aoa_to_sheet(aoa);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, filename);
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    triggerDownload(blob, `${filename}.xlsx`);
  }

  /* XML */
  const xml = buildXML(data, filename, codeParts, includeConf);
  const blob = new Blob([xml], { type: "application/xml;charset=utf-8" });
  triggerDownload(blob, `${filename}.xml`);
  return;
}

export const downloadImage = async (
  url: string,
  filename: string,
  errorCallback: (e: any) => void
) => {
  try {
    const res = await fetch(url, { mode: "cors" });
    if (!res.ok) {
      errorCallback(res.statusText);
    }
    const blob = await res.blob();
    const name = filename || url.split("/").pop()?.split("?")[0] || "image.jpg";

    const a = document.createElement("a");
    const objectUrl = URL.createObjectURL(blob);
    a.href = objectUrl;
    a.download = `${name}.jpg`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(objectUrl);
  } catch (err) {
    errorCallback(err);
  }
};
