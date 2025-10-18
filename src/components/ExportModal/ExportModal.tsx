import React from "react";
import { App, Modal, Radio, Checkbox, Form, Flex, Button } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import type { CheckboxGroupProps } from "antd/es/checkbox";
import {
  downloadTexts,
  downloadImage,
  handleSuccess,
  handleError,
  type ExportFormType,
  type TextType,
  type AttributeType,
} from "utils";

const initialValues: ExportFormType = {
  format: "csv",
  source: "text",
  includeCode: true,
  includeConf: true,
  attrs: [],
};

const formatOptions: CheckboxGroupProps<string>["options"] = [
  { label: ".csv", value: "csv" },
  { label: ".xlsx", value: "xlsx" },
  { label: ".xml", value: "xml" },
];

const sourceOptions: CheckboxGroupProps<string>["options"] = [
  { label: "Сквозное распознавание", value: "text" },
  { label: "Атрибутивное распознавание", value: "attrs", disabled: true },
];

interface ExportModalProps {
  isOpen: boolean;
  documentId: string;
  pageNumber?: number;
  code?: string;
  imageUrl?: string;
  fullText?: TextType[];
  attrs?: AttributeType[];
  onClose: () => void;
}

export const ExportModal = ({
  isOpen,
  documentId,
  pageNumber,
  code,
  imageUrl,
  fullText,
  attrs,
  onClose,
}: ExportModalProps) => {
  const { notification } = App.useApp();
  const [form] = Form.useForm<ExportFormType>();
  const sourceWatch = Form.useWatch("source", form);

  const handleDownloadImage = () => {
    if (!imageUrl) return;
    downloadImage(imageUrl, `${documentId}_${pageNumber}`, (e) =>
      handleError(notification, e)
    );
  };

  const handleSubmit = async () => {
    if (!fullText?.length) return;

    const options = form.getFieldsValue();
    if (sourceWatch === "text") {
      try {
        await downloadTexts(
          fullText,
          `${documentId}_${pageNumber}`,
          options.format,
          options.includeCode ? code : undefined,
          options.includeConf
        );
        handleSuccess(notification);
        onClose();
      } catch (e) {
        handleError(notification, e);
      }
    }
  };

  const isSaveDisabled =
    sourceWatch === "text" ? !fullText?.length : !attrs?.length;

  return (
    <Modal
      open={isOpen}
      title="Экспорт результатов"
      okText="Сохранить"
      onCancel={onClose}
      onOk={handleSubmit}
      okButtonProps={{
        disabled: !documentId || !pageNumber || isSaveDisabled,
      }}
      maskClosable={false}
      width={580}
      getContainer="#root"
      destroyOnHidden
      forceRender
      footer={(originNode) => (
        <Flex justify="space-between">
          <Button
            icon={<DownloadOutlined />}
            disabled={!imageUrl}
            onClick={handleDownloadImage}
          >
            Изображение
          </Button>
          <Flex gap={8}>{originNode}</Flex>
        </Flex>
      )}
    >
      <Form
        form={form}
        labelAlign="left"
        initialValues={initialValues}
        style={{ paddingTop: 24, paddingBottom: 4 }}
      >
        <Form.Item name="format">
          <Radio.Group block options={formatOptions} optionType="button" />
        </Form.Item>
        <Form.Item name="source">
          <Radio.Group block options={sourceOptions} optionType="button" />
        </Form.Item>
        <Form.Item
          label="Атрибуты"
          name="attrs"
          hidden={sourceWatch !== "attrs"}
        >
          <Radio.Group options={[]} />
        </Form.Item>
        <Form.Item label="Дополнительно:" layout="vertical">
          <Form.Item name="includeCode" valuePropName="checked">
            <Checkbox>Добавить архивный шифр</Checkbox>
          </Form.Item>
          <Form.Item name="includeConf" valuePropName="checked">
            <Checkbox>Добавить уверенность</Checkbox>
          </Form.Item>
        </Form.Item>
      </Form>
    </Modal>
  );
};
