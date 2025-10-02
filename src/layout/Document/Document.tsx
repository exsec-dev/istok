import React from "react";
import { useParams } from "react-router-dom";
import { App, Flex, Empty, Skeleton } from "antd";
import { useQuery } from "@tanstack/react-query";
import { DocumentHeader } from "components";
import { PagesList } from "layout/PagesList";
import { PageViewer } from "layout/PageViewer";
import type { DocumentType } from "utils";
import { handleError, useAxios } from "utils";

interface DocumentProps {
  isSinglePage?: boolean;
}

export const Document = ({ isSinglePage }: DocumentProps) => {
  const { id } = useParams();
  const axios = useAxios();
  const { notification } = App.useApp();
  // const [search, setSearch] = useState<string>("");

  const { data: documentData, isLoading } = useQuery<DocumentType | undefined>({
    queryKey: ["/documents/{id}", id],
    queryFn: async () => {
      try {
        const { data } = await axios.get<{ data: DocumentType }>(
          `/documents/${id}`,
        );
        return data.data;
      } catch (e) {
        handleError(notification);
        return undefined;
      }
    },
    refetchOnWindowFocus: false,
    retry: 0,
  });

  return id ? (
    <Flex vertical gap={30}>
      {isLoading ? (
        <Skeleton active />
      ) : (
        <DocumentHeader
          id={id}
          documentData={documentData}
          // setSearch={setSearch}
          setSearch={() => {}}
        />
      )}
      {isSinglePage ? (
        <PageViewer documentId={id} documentData={documentData} />
      ) : (
        <PagesList documentId={id} />
      )}
    </Flex>
  ) : (
    <Empty />
  );
};
