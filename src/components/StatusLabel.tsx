import React from "react";
import { Flex } from "antd";
import { SyncOutlined } from "@ant-design/icons";
import { SuccessIcon, ErrorIcon } from "components";
import type { StatusType } from "utils";

const statusMap = {
  processing: {
    label: "Обрабатывается",
    icon: <SyncOutlined spin style={{ color: "var(--primary-color)" }} />,
  },
  success: { label: "Обработано", icon: <SuccessIcon /> },
  error: { label: "Ошибка обработки", icon: <ErrorIcon /> },
};

interface StatusLabelProps {
  status: StatusType;
}

export const StatusLabel = ({ status }: StatusLabelProps) => {
  return (
    <Flex align="center" gap={8}>
      {statusMap[status]?.icon}
      {statusMap[status]?.label ?? "Статус неизвествен"}
    </Flex>
  );
};
