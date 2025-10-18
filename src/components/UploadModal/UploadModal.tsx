import React, { useState } from "react";
import { isAxiosError } from "axios";
import {
  App,
  Modal,
  Form,
  Input,
  InputNumber,
  Upload,
  Select,
  GetProp,
  type UploadProps,
  type UploadFile,
} from "antd";
import { InboxOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CodeInput } from "./CodeInput";
import {
  useAxios,
  handleError,
  handleSuccess,
  type UploadFormType,
} from "utils";
import "./index.scss";

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

interface UploadModalProps {
  isOpen: boolean;
  onClose: (success?: boolean) => void;
}

export const UploadModal = ({ isOpen, onClose }: UploadModalProps) => {
  const axios = useAxios();
  const queryClient = useQueryClient();
  const { notification } = App.useApp();

  const [form] = Form.useForm<UploadFormType>();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploadMode, setUploadMode] = useState<"file" | "directory">("file");

  const uploadMutation = useMutation({
    mutationFn: async (values: UploadFormType) => {
      const formData = new FormData();
      fileList.forEach((file) => {
        formData.append("file", file as FileType);
      });

      return await axios.post(
        `/documents?name=${values.name}&code=${values.code}&min=${values.min}&max=${values.max}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/documents"],
        exact: false,
      });
      handleSuccess(notification);
      onClose(true);
      setFileList([]);
      form.resetFields();
    },
    onError: (e) => {
      if (!isAxiosError(e) || e.status !== 504) {
        handleError(notification);
      }
    },
  });
  const handleSubmit = (values: UploadFormType) => {
    return uploadMutation.mutateAsync(values);
  };

  return (
    <Modal
      open={isOpen}
      title="Добавление документа"
      okText="Добавить"
      onCancel={() => {
        onClose();
        setFileList([]);
        form.resetFields();
      }}
      okButtonProps={{
        disabled: !fileList.length,
        loading: uploadMutation.isPending,
      }}
      onOk={form.submit}
      maskClosable={false}
      getContainer="#root"
      destroyOnHidden
    >
      <Form
        form={form}
        layout="horizontal"
        requiredMark={false}
        validateTrigger={["onChange", "onBlur"]}
        onFinish={handleSubmit}
        style={{ paddingTop: 24 }}
      >
        <Form.Item
          name="name"
          rules={[
            { required: true, message: "Обязательно для заполнения" },
            {
              pattern: /^[a-zA-Zа-яА-Я0-9() .,:;#№"'-]*$/,
              message: "Неверный формат данных",
            },
            {
              max: 120,
              message: "Максимальная длина: 120",
            },
          ]}
        >
          <Input placeholder="Название документа" />
        </Form.Item>
        <Upload.Dragger
          directory={uploadMode === "directory"}
          accept=".jpg,.jpeg,.tif,.tiff,.pdf"
          multiple
          maxCount={500}
          fileList={fileList}
          beforeUpload={(file) => {
            setFileList((value) => [...value, file]);
            return false;
          }}
          onRemove={(file) => {
            const index = fileList.indexOf(file);
            const newFileList = fileList.slice();
            newFileList.splice(index, 1);
            setFileList(newFileList);
          }}
          itemRender={(originNode) => (
            <div style={{ color: "var(--primary-color)", contain: "content" }}>
              {originNode}
            </div>
          )}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <div className="ant-upload-text">
            Нажмите или перенесите{" "}
            <Select
              value={uploadMode}
              options={[
                { label: "файл(ы)", value: "file" },
                { label: "папку", value: "directory" },
              ]}
              onClick={(e) => {
                e.stopPropagation();
              }}
              onChange={(value) => setUploadMode(value)}
              style={{ marginLeft: 4 }}
            />
          </div>
          <p className="ant-upload-hint">
            Поддерживаемые форматы: JPEG/JPG, TIFF, PDF
          </p>
        </Upload.Dragger>
        <Form.Item
          name="code"
          label="Архивный шифр"
          rules={[
            { required: true, message: "Обязательно для заполнения" },
            {
              pattern: /^\d{1,4}-\d{1,4}-\d{1,6}$/,
              message: "Неверный формат данных",
            },
          ]}
          style={{ marginTop: 24 }}
        >
          <CodeInput />
        </Form.Item>
        <Form.Item
          name="min"
          initialValue={30}
          label="Нижний порог уверенности"
          tooltip="Все элементы ниже этого уровня относятся к категории низкой уверенности"
          dependencies={["max"]}
          rules={[
            { required: true, message: "Обязательно для заполнения" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                const max = getFieldValue("max");
                if (value !== undefined && max !== undefined && value >= max) {
                  return Promise.reject(
                    new Error("Минимум не может быть больше максимума")
                  );
                }
                return Promise.resolve();
              },
            }),
          ]}
          style={{ marginTop: 24 }}
        >
          <InputNumber min={0} max={100} suffix="%" style={{ width: 90 }} />
        </Form.Item>
        <Form.Item
          name="max"
          initialValue={85}
          label="Верхний порог уверенности"
          tooltip="Все элементы выше этого уровня относятся к категории высокой уверенности"
          rules={[{ required: true, message: "Обязательно для заполнения" }]}
        >
          <InputNumber min={0} max={100} suffix="%" style={{ width: 90 }} />
        </Form.Item>
      </Form>
    </Modal>
  );
};
