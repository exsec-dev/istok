import React from "react";
import { Input, Space } from "antd";

interface CodeInputProps {
  value?: string;
  onChange?: (value: string) => void;
}

export const CodeInput = ({ value, onChange }: CodeInputProps) => {
  const codeDetails = value?.split("-") || [];

  return (
    <Space.Compact>
      <Input
        value={codeDetails[0]}
        onChange={(e) => {
          const clearValue = e.target.value.replace(/^0+/, "").slice(0, 4);
          const newValue = "0".repeat(4 - clearValue.length) + clearValue;
          const newCode = `${newValue}-${codeDetails[1] ?? ""}-${codeDetails[2] ?? ""}`;
          onChange?.(newCode);
        }}
        placeholder="Фонд"
      />
      <Input
        value={codeDetails[1]}
        onChange={(e) => {
          const clearValue = e.target.value.replace(/^0+/, "").slice(0, 4);
          const newValue = "0".repeat(4 - clearValue.length) + clearValue;
          const newCode = `${codeDetails[0] ?? ""}-${newValue}-${codeDetails[2] ?? ""}`;
          onChange?.(newCode);
        }}
        placeholder="Опись"
      />
      <Input
        value={codeDetails[2]}
        onChange={(e) => {
          const clearValue = e.target.value.replace(/^0+/, "").slice(0, 6);
          const newValue = "0".repeat(6 - clearValue.length) + clearValue;
          const newCode = `${codeDetails[0] ?? ""}-${codeDetails[1] ?? ""}-${newValue}`;
          onChange?.(newCode);
        }}
        placeholder="Дело"
      />
    </Space.Compact>
  );
};
