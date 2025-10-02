import React from "react";
import { Typography, Button } from "antd";
import "./index.scss";

interface TextBlockProps {
  text: string;
  isSelected: boolean;
  onSelect: () => void;
}

export const TextBlock = ({ text, isSelected, onSelect }: TextBlockProps) => {
  return (
    <Button
      className="text-block"
      color="default"
      variant="filled"
      onClick={onSelect}
      style={{
        backgroundColor: isSelected ? "var(--light-grey-color)" : "#ffffff",
      }}
    >
      <Typography.Paragraph>{text}</Typography.Paragraph>
    </Button>
  );
};
