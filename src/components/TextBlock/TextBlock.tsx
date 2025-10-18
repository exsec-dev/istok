import React, { useState, useRef, useEffect } from "react";
import {
  Typography,
  Button,
  Input,
  Flex,
  Popconfirm,
  type InputRef,
} from "antd";
import {
  EditOutlined,
  CheckOutlined,
  DeleteOutlined,
  CloseOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import "./index.scss";

interface TextBlockProps {
  text: string;
  isSelected: boolean;
  isEdited: boolean;
  onSelect: (zoom?: boolean) => void;
  isEdit: boolean;
  onEditStart: () => void;
  onEditFinish: (newText?: string, toRemove?: boolean) => void;
  onEditCancel: () => void;
}

export const TextBlock = ({
  text,
  isSelected,
  isEdited,
  isEdit,
  onSelect,
  onEditStart,
  onEditFinish,
  onEditCancel,
}: TextBlockProps) => {
  const [value, setValue] = useState(text);
  const inputRef = useRef<InputRef>(null);

  useEffect(() => {
    if (isEdit && inputRef.current) {
      inputRef.current.focus();
    } else {
      setValue(text);
    }
  }, [isEdit, text]);

  if (isEdit) {
    return (
      <Flex gap={6} align="center" style={{ width: "100%", margin: "2px 0" }}>
        <Input
          ref={inputRef}
          value={value}
          allowClear={{ clearIcon: <CloseOutlined /> }}
          onClear={onEditCancel}
          onChange={(e) => setValue(e.target.value)}
          style={{ paddingRight: 6 }}
        />
        <Flex gap={4}>
          <Button
            color="default"
            variant="filled"
            icon={<CheckOutlined />}
            disabled={!value}
            onClick={() => onEditFinish(value)}
            style={{ color: "var(--grey-color)" }}
          />
          <Popconfirm
            title="Удалить элемент?"
            description="Его нельзя будет восстановить"
            onConfirm={() => onEditFinish(undefined, true)}
            okText="Удалить"
            cancelText="Отмена"
            placement="topRight"
            destroyOnHidden
            okButtonProps={{ danger: true, style: { fontSize: 13 } }}
            cancelButtonProps={{ style: { fontSize: 13 } }}
          >
            <Button color="red" variant="filled" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Flex>
      </Flex>
    );
  }

  return (
    <div className="text-block">
      <Button
        className="text-button"
        color="default"
        variant="filled"
        icon={isEdited ? <HistoryOutlined /> : undefined}
        iconPosition="end"
        onClick={() => onSelect()}
        onDoubleClick={() => onSelect(true)}
        style={{
          backgroundColor: isSelected ? "var(--light-grey-color)" : "#ffffff",
        }}
      >
        <Typography.Paragraph>{text}</Typography.Paragraph>
      </Button>
      <Button
        className="edit-button"
        color="default"
        variant="filled"
        icon={<EditOutlined />}
        onClick={(e) => {
          e.stopPropagation();
          onEditStart();
        }}
        style={{
          visibility: isSelected ? "visible" : undefined,
          opacity: isSelected ? 1 : undefined,
        }}
      />
    </div>
  );
};
