import React from "react";
import { Flex, Progress } from "antd";
import { SyncOutlined } from "@ant-design/icons";
import { useLocation } from "react-router-dom";
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
  progress?: number;
}

export const StatusLabel = ({ status, progress }: StatusLabelProps) => {
  const location = useLocation();

  if (status === "processing" && location.pathname === "/") {
    return <Progress percent={progress} />;
  }

  return (
    <Flex align="center" gap={8}>
      {statusMap[status].icon}
      {statusMap[status].label}
    </Flex>
  );
};
