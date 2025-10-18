import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { App, Flex, Empty, Skeleton } from "antd";
import { useQuery } from "@tanstack/react-query";
import { DocumentHeader } from "components";
import { PagesList } from "layout/PagesList";
import { PageViewer } from "layout/PageViewer";
import type { DocumentType } from "utils";
import { handleError, useAxios } from "utils";

interface DocumentProps {
  isPageView?: boolean;
}

export const Document = ({ isPageView }: DocumentProps) => {
  const { id } = useParams();
  const axios = useAxios();
  const { notification } = App.useApp();
  const [search, setSearch] = useState<string>("");

  const { data: documentData, isLoading } = useQuery<DocumentType>({
    queryKey: ["/documents/{documentId}", id],
    queryFn: async () => {
      try {
        const { data } = await axios.get(`/documents/${id}`);
        return data.data;
      } catch (e) {
        handleError(notification);
        return undefined;
      }
    },
    refetchOnWindowFocus: false,
    retry: 0,
    refetchInterval: (query) =>
      query.state.data?.status === "processing" ? 2000 : false,
  });

  return id ? (
    <Flex vertical gap={30}>
      {isLoading ? (
        <Skeleton active />
      ) : (
        <DocumentHeader
          id={id}
          documentData={documentData}
          setSearch={setSearch}
        />
      )}
      {isPageView ? (
        <PageViewer
          documentId={id}
          documentData={documentData}
          search={search.toLocaleLowerCase()}
        />
      ) : (
        <PagesList documentId={id} status={documentData?.status} />
      )}
    </Flex>
  ) : (
    <Empty />
  );
};
