import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { App, Empty, Skeleton, List, Card, Image, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  ROUTE_PATHS,
  FALLBACK_IMAGE,
  useAxios,
  handleError,
  type StatusType,
} from "utils";
import "./index.scss";

const PAGE_SIZE = 25;

interface PagesListProps {
  documentId: string;
  status?: StatusType;
}

export const PagesList = ({ documentId, status }: PagesListProps) => {
  const axios = useAxios();
  const navigate = useNavigate();
  const { notification } = App.useApp();

  const {
    data: listData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ["list", documentId],
    queryFn: async ({ pageParam }) => {
      try {
        const { data } = await axios.get(`/documents/${documentId}/get`, {
          params: {
            pageSize: PAGE_SIZE,
            page: pageParam,
          },
        });
        return data;
      } catch (e) {
        handleError(notification);
        return undefined;
      }
    },
    getNextPageParam: (lastPage, _, lastPageParam) => {
      const total = lastPage?.total ?? 0;
      const loaded = (lastPageParam + 1) * PAGE_SIZE;
      return loaded < total ? lastPageParam + 1 : undefined;
    },
    initialPageParam: 0,
    refetchOnWindowFocus: false,
    retry: 0,
    refetchInterval: status === "processing" ? 2000 : false,
  });

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    if (!hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting) {
          fetchNextPage();
        }
      },
      { rootMargin: "1px 0px 1px 0px", threshold: 0 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage]);

  const items = listData?.pages.flatMap((p) => p?.data) ?? [];

  return (
    <Spin
      size="large"
      spinning={isLoading}
      indicator={<LoadingOutlined spin />}
    >
      {isError ? (
        <Empty description="Ошибка загрузки" />
      ) : (
        <>
          <List
            grid={{ gutter: 16, xs: 2, sm: 3, md: 4, lg: 5, xl: 6, xxl: 7 }}
            dataSource={items}
            renderItem={(item, i) => (
              <List.Item key={item?.id}>
                <Card
                  hoverable
                  onClick={() => {
                    navigate(
                      ROUTE_PATHS.DOCUMENT_PAGE.replace(
                        ":id",
                        documentId
                      ).replace(":number", String(i + 1))
                    );
                  }}
                  styles={{
                    body: {
                      padding: 0,
                      borderRadius: 8,
                      position: "relative",
                    },
                  }}
                  style={{
                    width: "fit-content",
                    minWidth: 100,
                    margin: "auto",
                    borderColor: "var(--header-text-color)",
                    backgroundColor: "var(--header-text-color)",
                    borderRadius: 10,
                    borderWidth: 2,
                  }}
                >
                  <Image
                    src={item?.thumb}
                    fallback={FALLBACK_IMAGE}
                    preview={false}
                    style={{
                      width: "100%",
                      height: 160,
                      objectFit: "cover",
                      borderRadius: 8,
                    }}
                  />
                  <div className="image-label">{i + 1}</div>
                </Card>
              </List.Item>
            )}
          />
          <div ref={sentinelRef} />
          <div
            style={{ display: "flex", justifyContent: "center", padding: 64 }}
          >
            {isFetchingNextPage && (
              <Spin size="large" indicator={<LoadingOutlined spin />} />
            )}
          </div>
        </>
      )}
    </Spin>
  );
};
