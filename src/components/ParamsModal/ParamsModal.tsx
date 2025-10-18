import React, { useEffect } from "react";
import { App, Modal, Form, InputNumber, Input } from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CodeInput } from "components/UploadModal/CodeInput";
import {
  useAxios,
  handleError,
  handleSuccess,
  type UploadFormType,
} from "utils";

interface ParamsModalProps {
  id: string;
  initialData?: UploadFormType;
  isOpen: boolean;
  onClose: () => void;
}

export const ParamsModal = ({
  id,
  initialData,
  isOpen,
  onClose,
}: ParamsModalProps) => {
  const axios = useAxios();
  const queryClient = useQueryClient();
  const { notification } = App.useApp();
  const [form] = Form.useForm<UploadFormType>();

  useEffect(() => {
    form.resetFields();
  }, [form, initialData]);

  const changeMutation = useMutation({
    mutationFn: async (values: UploadFormType) => {
      return await axios.patch(`/documents/${id}`, values);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["/documents/{documentId}", id],
      });
      handleSuccess(notification);
      onClose();
    },
    onError: () => {
      handleError(notification);
    },
  });
  const handleSubmit = (values: UploadFormType) => {
    return changeMutation.mutateAsync(values);
  };

  return (
    <Modal
      open={isOpen}
      title="Параметры документа"
      okText="Сохранить"
      onCancel={() => {
        onClose();
        form.resetFields();
      }}
      onOk={form.submit}
      okButtonProps={{
        loading: changeMutation.isPending,
      }}
      maskClosable={false}
      getContainer="#root"
      destroyOnHidden
      forceRender
    >
      <Form
        form={form}
        layout="horizontal"
        validateTrigger={["onChange", "onBlur"]}
        initialValues={initialData}
        requiredMark={false}
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
        >
          <InputNumber min={0} max={100} suffix="%" style={{ width: 90 }} />
        </Form.Item>
        <Form.Item
          name="max"
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
