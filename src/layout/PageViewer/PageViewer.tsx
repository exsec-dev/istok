import React, { useState, useMemo, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  App,
  Flex,
  Splitter,
  Button,
  Typography,
  Skeleton,
  Collapse,
  Pagination,
  Input,
  Empty,
  Card,
  type CollapseProps,
} from "antd";
import { EditOutlined } from "@ant-design/icons";
import { useQuery, useMutation } from "@tanstack/react-query";
import { BackArrowIcon, ImageViewer, TextBlock } from "components";
import {
  useAxios,
  handleSuccess,
  handleError,
  type PageDataType,
  type DocumentType,
  type TextType,
} from "utils";
import "./index.scss";

const getConfidenceColor = (confidence: number, min: number, max: number) => {
  if (confidence >= max) return "var(--success-color)";
  if (confidence >= min) return "var(--warning-color)";
  return "var(--error-color)";
};

interface PageViewerProps {
  documentId: string;
  documentData: DocumentType | undefined;
}

export const PageViewer = ({ documentId, documentData }: PageViewerProps) => {
  const axios = useAxios();
  const navigate = useNavigate();
  const { number } = useParams();
  const pageNumber = number ? parseInt(number, 10) : 0;
  const { notification } = App.useApp();

  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [selectedNode, setSelectedNode] = useState<TextType>();
  const newTextBlocks = useRef<TextType[]>([]);

  const { data, isLoading, refetch } = useQuery<PageDataType | undefined>({
    queryKey: ["list", documentId, pageNumber],
    queryFn: async () => {
      try {
        const { data } = await axios.get(`/documents/${documentId}/get`, {
          params: {
            pageSize: 1,
            page: pageNumber - 1,
          },
        });
        return data;
      } catch (e) {
        handleError(notification);
        return undefined;
      }
    },
    refetchOnWindowFocus: false,
    retry: 0,
    placeholderData: (prev) => prev,
  });
  const pageData = useMemo(() => data?.data?.[0], [data]);

  const changeMutation = useMutation({
    mutationFn: async (values: PageDataType["data"][number]) => {
      // return await axios.post(`/documents/${id}`, {
      //   file: null,
      // });
      console.log("update page: ", values);
    },
    onSuccess: () => {
      refetch();
      handleSuccess(notification);
      setIsEdit(false);
      newTextBlocks.current = [];
    },
    onError: () => {
      handleError(notification);
    },
  });
  const handleSubmit = () => {
    if (!pageData) return;

    return changeMutation.mutateAsync({
      ...pageData,
      fullText: newTextBlocks.current,
    });
  };

  const avgConfidence = useMemo(() => {
    const attrs = pageData?.attrs;
    if (!attrs || attrs.length === 0) return 0;

    const total = attrs.reduce((sum, attr) => sum + (attr.confidence || 0), 0);
    return total / attrs.length;
  }, [pageData]);

  const lowConfidenceCount = useMemo(() => {
    const attrs = pageData?.attrs;
    if (!attrs || attrs.length === 0) return 0;

    return attrs.filter(
      (attr) => (attr.confidence || 0) < (documentData?.min ?? 0.05),
    ).length;
  }, [pageData, documentData]);

  const items: CollapseProps["items"] = useMemo(
    () => [
      {
        key: "text",
        label: (
          <Typography.Title level={5} style={{ margin: 0, fontWeight: 650 }}>
            Текст образа
          </Typography.Title>
        ),
        children: (
          <Card className="text-card">
            {pageData?.fullText?.length ? (
              pageData.fullText.map((block) =>
                isEdit ? (
                  <Input
                    key={block.id}
                    variant="underlined"
                    defaultValue={block.text}
                    onChange={(e) => {
                      const text = e.target.value;
                      newTextBlocks.current = newTextBlocks.current.map((b) =>
                        b.id === block.id ? { ...b, text } : b,
                      );
                    }}
                    style={{ marginBottom: 12 }}
                  />
                ) : (
                  <TextBlock
                    key={block.id}
                    text={block.text}
                    isSelected={selectedNode?.id === block.id}
                    onSelect={() =>
                      setSelectedNode((value) =>
                        value?.id === block.id ? undefined : block,
                      )
                    }
                  />
                ),
              )
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                style={{ marginTop: 65 }}
              />
            )}
          </Card>
        ),
        extra: isEdit ? (
          <Flex gap={8}>
            <Button
              size="small"
              onClick={(event) => {
                event.stopPropagation();
                setIsEdit(false);
                newTextBlocks.current = [];
              }}
            >
              Отмена
            </Button>
            <Button
              size="small"
              type="primary"
              onClick={(event) => {
                event.stopPropagation();
                return handleSubmit();
              }}
            >
              Сохранить
            </Button>
          </Flex>
        ) : (
          <Button
            color="primary"
            variant="outlined"
            size="small"
            icon={<EditOutlined />}
            disabled={!pageData?.fullText?.length}
            onClick={(event) => {
              event.stopPropagation();
              setIsEdit(true);
              setSelectedNode(undefined);
              newTextBlocks.current = pageData?.fullText || [];
            }}
          >
            Редактировать
          </Button>
        ),
      },
      {
        key: "attributes",
        label: (
          <Typography.Title level={5} style={{ margin: 0, fontWeight: 650 }}>
            Атрибуты образа
          </Typography.Title>
        ),
        children: (
          <Card className="attributes-card">
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
          </Card>
        ),
      },
    ],
    [pageData, selectedNode, isEdit],
  );

  return (
    <Flex vertical gap={24} style={{ paddingBottom: 24 }}>
      <Flex vertical gap={12}>
        <Flex align="center" gap={8}>
          <Button
            type="text"
            icon={<BackArrowIcon />}
            onClick={() => navigate(`/${documentId}`)}
            style={{ color: "var(--secondary-color)", width: 28, height: 28 }}
          />
          <Typography.Title level={5} style={{ fontSize: 18, margin: 0 }}>
            Просмотр образа
          </Typography.Title>
        </Flex>
        <Flex align="center" justify="space-between">
          {!(!documentData || isLoading) ? (
            <Flex gap={20}>
              <Typography.Text>
                Уверенность:{" "}
                <span
                  style={{
                    fontWeight: 600,
                    color: getConfidenceColor(
                      avgConfidence,
                      documentData?.min ?? 5,
                      documentData?.max ?? 95,
                    ),
                  }}
                >
                  {avgConfidence.toFixed(2)}%
                </span>
              </Typography.Text>
              <Typography.Text type="secondary">
                Элементов с низкой уверенностью: {lowConfidenceCount}
              </Typography.Text>
            </Flex>
          ) : (
            <Skeleton.Input size="small" style={{ width: 420 }} active />
          )}
          <Pagination
            simple
            size="small"
            current={pageNumber}
            onChange={(page) => {
              navigate(`/${documentId}/${page}`);
            }}
            total={data?.total}
            pageSize={1}
            showSizeChanger={false}
          />
        </Flex>
      </Flex>
      <Splitter
        onResizeStart={() => setSelectedNode(undefined)}
        style={{ gap: 8, minHeight: "calc(100vh - 400px)" }}
      >
        <Splitter.Panel defaultSize="55%" min="30%" max="70%">
          <ImageViewer url={pageData?.original} selectedNode={selectedNode} />
        </Splitter.Panel>
        <Splitter.Panel>
          <Collapse
            ghost
            className="pagedata-collapse"
            defaultActiveKey={["text", "attributes"]}
            items={items}
          />
        </Splitter.Panel>
      </Splitter>
    </Flex>
  );
};
