import React from "react";
import { Typography } from "antd";
import type { NotificationInstance } from "antd/es/notification/interface";

export const handleSuccess = (
  notification: NotificationInstance,
  message?: string,
) => {
  notification.open({
    type: "success",
    closable: false,
    placement: "bottomRight",
    message: message ?? (
      <Typography.Text style={{ fontSize: 16 }}>
        Операция завершена успешно
      </Typography.Text>
    ),
  });
};

export const handleError = (notification: NotificationInstance, e?: any) => {
  notification.error({
    closable: false,
    placement: "bottomRight",
    message: (
      <Typography.Text style={{ fontSize: 16 }}>
        Операция завершена с ошибкой
      </Typography.Text>
    ),
    description: e ?? undefined,
  });
};
