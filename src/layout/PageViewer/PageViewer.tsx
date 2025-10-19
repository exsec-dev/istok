import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
  useSyncExternalStore,
} from "react";
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
  Empty,
  Card,
  Spin,
  type CollapseProps,
} from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import { useQuery, useMutation } from "@tanstack/react-query";
import { BackArrowIcon, ImageViewer, TextBlock, ExportModal } from "components";
import {
  useAxios,
  handleSuccess,
  handleError,
  getConfidenceObj,
  blocksPreprocess,
  ROUTE_PATHS,
  type PageDataType,
  type DocumentType,
  type TextType,
  type GetDTO,
} from "utils";
import "./index.scss";

interface PageViewerProps {
  documentId: string;
  documentData?: DocumentType;
  search?: string;
}

export const PageViewer = ({
  documentId,
  documentData,
  search,
}: PageViewerProps) => {
  const axios = useAxios();
  const navigate = useNavigate();
  const { number } = useParams();
  const pageNumber = number ? parseInt(number, 10) : 1;
  const { notification } = App.useApp();

  const [selectedNode, setSelectedNode] = useState<TextType>();
  const [zoomBlockId, setZoomBlockId] = useState<string>();
  const [editNode, setEditNode] = useState<TextType>();

  const containerRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const isFullscreen = useSyncExternalStore(
    (callback) => {
      document.addEventListener("fullscreenchange", callback);
      return () => document.removeEventListener("fullscreenchange", callback);
    },
    () => !!document.fullscreenElement
  );

  useEffect(() => {
    setSelectedNode(undefined);
    setEditNode(undefined);
  }, [pageNumber, isFullscreen]);

  const { data, isLoading, isFetching, isRefetching, refetch } = useQuery<
    GetDTO<PageDataType>
  >({
    queryKey: ["list", documentId, pageNumber],
    queryFn: async () => {
      try {
        const { data } = await axios.get(`/documents/${documentId}/get`, {
          params: {
            pageSize: 1,
            page: pageNumber - 1,
          },
        });
        const fullText = data.data?.[0].fullText
          ? blocksPreprocess(data.data?.[0].fullText as string)
          : undefined;
        data.data = [{ ...data.data[0], fullText }];
        return data;
      } catch (e) {
        handleError(notification);
        return undefined;
      }
    },
    refetchOnWindowFocus: false,
    retry: 0,
    refetchInterval: (query) =>
      query.state.data?.data?.[0]?.fullText === undefined ? 2500 : false,
  });
  const pageData = useMemo(() => data?.data?.[0], [data]);

  const changeMutation = useMutation({
    mutationFn: async (values: TextType[]) => {
      return await axios.patch(
        `/documents/${documentId}/${pageData?.id ?? ""}`,
        JSON.stringify(JSON.stringify(values)),
        {
          headers: { "Content-Type": "application/json" },
        }
      );
    },
    onSuccess: () => {
      refetch();
      handleSuccess(notification);
    },
    onError: () => {
      handleError(notification);
    },
  });
  const handleSubmit = useCallback(
    (values: TextType[]) => {
      return changeMutation.mutateAsync(values);
    },
    [changeMutation]
  );

  const avgConfidence = useMemo(() => {
    const blocks = pageData?.fullText;
    if (!blocks || blocks.length === 0) return 0;

    const total = blocks.reduce(
      (sum, block) => sum + (block.confidence || 0),
      0
    );
    return (total / blocks.length) * 100;
  }, [pageData]);

  const lowConfidenceCount = useMemo(() => {
    const blocks = pageData?.fullText;
    if (!blocks || blocks.length === 0) return "—";

    return blocks.filter(
      (block) => block.confidence * 100 < (documentData?.min ?? 30)
    ).length;
  }, [pageData, documentData]);

  const textBlocks = useMemo(() => {
    const blocks = search
      ? pageData?.fullText?.filter?.((block) =>
          block.text.toLocaleLowerCase().includes(search)
        )
      : pageData?.fullText;

    if (blocks?.length) {
      return blocks.map((block) => (
        <TextBlock
          key={block.id}
          text={block.text}
          isSelected={selectedNode?.id === block.id}
          isEdited={!!block?.edited}
          onSelect={(zoom) => {
            setSelectedNode((value) =>
              value?.id === block.id ? undefined : block
            );
            if (zoom) {
              setZoomBlockId(block.id);
            }
          }}
          isEdit={editNode?.id === block.id}
          onEditStart={() => {
            setEditNode(block);
            setSelectedNode(block);
          }}
          onEditFinish={(newText, toRemove) => {
            setEditNode(undefined);

            let newBlocks = blocks;
            if (toRemove) {
              newBlocks = newBlocks.filter((b) => b.id !== block.id);
            } else if (newText) {
              newBlocks = newBlocks.map((b) =>
                b.id === block.id
                  ? {
                      ...b,
                      text: newText,
                      edited: true,
                    }
                  : b
              );
              setSelectedNode(() => ({
                ...block,
                edited: true,
              }));
            }
            handleSubmit(newBlocks);
          }}
          onEditCancel={() => {
            setEditNode(undefined);
          }}
        />
      ));
    }

    const description = search ? "Нет данных по запросу" : "Идет обработка...";
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          pageData?.fullText?.length === 0
            ? "Не удалось распознать текст"
            : description
        }
        style={{ marginTop: 65 }}
      />
    );
  }, [pageData, selectedNode, editNode, handleSubmit, search]);

  const items: CollapseProps["items"] = [
    {
      key: "text",
      label: (
        <Typography.Title level={5} style={{ margin: 0, fontWeight: 650 }}>
          Текст образа
        </Typography.Title>
      ),
      children: (
        <Card
          className="text-card"
          style={{
            maxHeight: isFullscreen
              ? "calc(100vh - 300px)"
              : "calc(100vh - 516px)",
          }}
        >
          {textBlocks}
        </Card>
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
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span>
                Атрибутивное распознавание
                <br />
                не поддерживается
              </span>
            }
          />
        </Card>
      ),
    },
  ];

  return (
    <Flex
      ref={containerRef}
      vertical
      gap={24}
      style={{
        padding: isFullscreen ? 40 : "0 0 24px",
        backgroundColor: "var(--bg-color)",
        overflow: isFullscreen ? "auto" : undefined,
      }}
    >
      <Flex vertical gap={12}>
        <Flex align="center" gap={8}>
          <Button
            type="text"
            icon={<BackArrowIcon />}
            onClick={() =>
              navigate(ROUTE_PATHS.DOCUMENT.replace(":id", documentId))
            }
            style={{ color: "var(--secondary-color)", width: 28, height: 28 }}
          />
          <Typography.Title level={5} style={{ fontSize: 18, margin: 0 }}>
            Просмотр образа
          </Typography.Title>
        </Flex>
        <Flex align="center" justify="space-between">
          {!(!documentData || isLoading || (isFetching && !isRefetching)) ? (
            <Flex gap={20}>
              <Typography.Text>
                Уверенность:{" "}
                <span
                  style={{
                    fontWeight: 600,
                    color: getConfidenceObj(
                      avgConfidence,
                      documentData?.min,
                      documentData?.max
                    ).color,
                  }}
                >
                  {avgConfidence === 0 ? "—" : `${avgConfidence.toFixed(2)}%`}
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
            current={pageNumber}
            onChange={(page) => {
              navigate(
                ROUTE_PATHS.DOCUMENT_PAGE.replace(":id", documentId).replace(
                  ":number",
                  String(page)
                )
              );
            }}
            total={data?.total ?? pageNumber}
            pageSize={1}
            showSizeChanger={false}
          />
          <Button
            color="primary"
            variant="outlined"
            disabled={!pageData?.fullText?.length}
            icon={<DownloadOutlined />}
            onClick={() => setIsModalOpen(true)}
          >
            Экспорт
          </Button>
        </Flex>
      </Flex>
      <Spin spinning={isLoading || (isFetching && !isRefetching)}>
        <Splitter
          onResizeStart={() => setSelectedNode(undefined)}
          style={{ gap: 8, minHeight: "calc(100vh - 400px)" }}
        >
          <Splitter.Panel defaultSize="55%" min="30%" max="70%">
            <ImageViewer
              url={pageData?.original}
              selectedNode={selectedNode}
              min={documentData?.min}
              max={documentData?.max}
              zoomBlockId={zoomBlockId}
              containerRef={containerRef.current}
              isFullscreen={isFullscreen}
              resetZoom={() => setZoomBlockId(undefined)}
            />
          </Splitter.Panel>
          <Splitter.Panel>
            <Collapse
              ghost
              className="pagedata-collapse"
              expandIconPosition="end"
              defaultActiveKey={["text"]}
              items={items}
            />
          </Splitter.Panel>
        </Splitter>
      </Spin>
      <ExportModal
        isOpen={isModalOpen}
        documentId={documentId}
        code={documentData?.code}
        imageUrl={pageData?.original}
        pageNumber={pageNumber}
        fullText={pageData?.fullText}
        attrs={pageData?.attrs}
        onClose={() => setIsModalOpen(false)}
      />
    </Flex>
  );
};
