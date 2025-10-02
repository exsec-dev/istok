import React, { useState } from "react";
import { App, Typography, Tooltip, Button, Flex, Input } from "antd";
import { StatusLabel, ParamsIcon, CopyIcon } from "components";
import {
  formatDate,
  handleError,
  handleSuccess,
  type DocumentType,
} from "utils";
import { ParamsModal } from "components/ParamsModal";

interface DocumentHeaderProps {
  id: string;
  documentData: DocumentType | undefined;
  setSearch: (value: string) => void;
}

export const DocumentHeader = ({
  id,
  documentData,
  setSearch,
}: DocumentHeaderProps) => {
  const { notification } = App.useApp();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const codeDetails = documentData?.code.split("-");

  const copyToClipboard = (text: string) => {
    if (navigator.clipboard && window.isSecureContext) {
      handleSuccess(notification, "Скопировано в буфер обмена");
      return navigator.clipboard.writeText(text);
    } else {
      let textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand("copy");
        handleSuccess(notification, "Скопировано в буфер обмена");
      } catch (err) {
        handleError(notification);
        console.error("Failed to copy: ", err);
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <Flex vertical gap={10}>
      <Flex gap={36}>
        <StatusLabel status={documentData?.status ?? "processing"} />
        <Typography.Text type="secondary">
          Дата загрузки: {formatDate(documentData?.createdAt ?? "")}
        </Typography.Text>
      </Flex>
      <Flex gap={12}>
        <Tooltip
          title={documentData?.name}
          arrow={false}
          placement="bottomLeft"
          destroyOnHidden
          styles={{ body: { maxWidth: 500, width: "max-content" } }}
        >
          <Typography.Title level={4} ellipsis>
            {documentData?.name}
          </Typography.Title>
        </Tooltip>
        <Flex gap={2}>
          <Button
            type="text"
            icon={<CopyIcon />}
            onClick={() => copyToClipboard(documentData?.name ?? "")}
            style={{ color: "var(--grey-color)" }}
          />
          <Button
            type="text"
            icon={<ParamsIcon />}
            style={{ color: "var(--grey-color)" }}
            onClick={() => setIsModalOpen(true)}
          />
        </Flex>
      </Flex>
      <Flex align="center" justify="space-between" gap={36}>
        <Flex gap={10}>
          <Typography.Text>
            Архивный шифр: {documentData?.code ?? ""}
          </Typography.Text>
          <Typography.Text type="secondary">
            Фонд: {codeDetails?.[0] ?? "-"}
          </Typography.Text>
          <Typography.Text type="secondary">
            Опись: {codeDetails?.[1] ?? "-"}
          </Typography.Text>
          <Typography.Text type="secondary">
            Дело: {codeDetails?.[2] ?? "-"}
          </Typography.Text>
        </Flex>
        <Input.Search
          allowClear
          disabled
          placeholder="Поиск по документу"
          onSearch={setSearch}
          style={{ flex: "1", maxWidth: 500, minWidth: 212 }}
        />
      </Flex>
      <ParamsModal
        id={id}
        isOpen={isModalOpen}
        initialData={
          documentData
            ? {
                name: documentData.name,
                code: documentData.code,
                min: documentData.min,
                max: documentData.max,
              }
            : undefined
        }
        onClose={() => setIsModalOpen(false)}
      />
    </Flex>
  );
};
