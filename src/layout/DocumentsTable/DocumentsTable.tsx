import React, { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { App, Typography, Table, Tooltip, Button, Flex, Input } from "antd";
import { SearchOutlined, PlusOutlined } from "@ant-design/icons";
import type { TableColumnsType, TableProps } from "antd";
import { useMutation, useQuery } from "@tanstack/react-query";
import { StatusLabel, DeleteIcon, DownloadIcon, UploadModal } from "components";
import {
  ROUTE_PATHS,
  useAxios,
  useDebouncedState,
  useSessionCount,
  formatDate,
  handleError,
  handleSuccess,
} from "utils";
import type { DocumentType, PaginationType, GetDTO, StatusType } from "utils";
import "./index.scss";

export const DocumentsTable = () => {
  const axios = useAxios();
  const navigate = useNavigate();
  const { notification, modal } = App.useApp();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sessionCount, setSessionCount] = useSessionCount();

  const [search, setSearch, debouncedSearch] = useDebouncedState<string>(
    "",
    500
  );
  const [sortBy, setSortBy] = useState<string>();
  const [statusFilter, setStatusFilter] = useState<StatusType>();
  const [pagination, setPagination] = useState<PaginationType>({
    page: 0,
    pageSize: 25,
  });

  const {
    data: tableData,
    isLoading,
    refetch,
  } = useQuery<GetDTO<DocumentType>>({
    queryKey: [
      "/documents",
      debouncedSearch.trim(),
      pagination,
      sortBy,
      statusFilter,
    ],
    queryFn: async () => {
      const { data } = await axios.get("/documents", {
        params: {
          ...pagination,
          sortBy,
          query: debouncedSearch.trim(),
          status: statusFilter,
        },
      });
      return data;
    },
    refetchOnWindowFocus: false,
    retry: 0,
    refetchInterval: (query) =>
      query.state.data?.data.some((doc) => doc.status === "processing")
        ? 2500
        : false,
  });

  const deleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      return Promise.all(
        ids.map((id) =>
          axios.delete("/documents", { params: { documentId: id } })
        )
      );
    },
    onSuccess: () => {
      refetch();
      setSelectedIds([]);
      handleSuccess(notification);
    },
    onError: () => {
      handleError(notification);
    },
  });
  const handleDelete = useCallback(
    (ids: string[]) => {
      modal.confirm({
        title: `Удалить документ${ids.length > 1 ? "ы" : ""}?`,
        width: 400,
        cancelText: "Отмена",
        okText: "Удалить",
        okButtonProps: { danger: true },
        onOk: () => deleteMutation.mutateAsync(ids),
      });
    },
    [deleteMutation, modal]
  );

  const downloadMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      return Promise.all(ids.map((id) => axios.get(`/documents/${id}/export`)));
    },
    onSuccess: () => {
      // TODO
      setSelectedIds([]);
      handleSuccess(notification);
    },
    onError: () => {
      handleError(notification);
    },
  });
  const handleDownload = useCallback(
    (ids: string[]) => {
      return downloadMutation.mutateAsync(ids);
    },
    [downloadMutation]
  );

  const actions = useMemo(
    () => (
      <Flex gap={8} justify="flex-start">
        <Button
          size="small"
          color="primary"
          variant="link"
          disabled={!selectedIds.length}
          icon={<DownloadIcon />}
          onClick={() => handleDownload(selectedIds)}
        >
          Скачать
        </Button>
        <Button
          size="small"
          color="red"
          variant="link"
          disabled={!selectedIds.length}
          icon={<DeleteIcon />}
          onClick={() => handleDelete(selectedIds)}
        >
          Удалить
        </Button>
      </Flex>
    ),
    [selectedIds, handleDelete, handleDownload]
  );

  const columns = useMemo(
    () =>
      [
        {
          title: actions,
          className: "actions-row",
          children: [
            {
              title: "Архивный шифр",
              dataIndex: "code",
              sorter: true,
              showSorterTooltip: false,
              width: 180,
              ellipsis: true,
            },
            {
              title: "Название",
              dataIndex: "name",
              showSorterTooltip: false,
              sorter: true,
              ellipsis: true,
              width: "100%",
              render: (text, record) => (
                <Tooltip
                  title={text}
                  placement="bottomLeft"
                  arrow={false}
                  destroyOnHidden
                >
                  <Typography.Link
                    ellipsis
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(ROUTE_PATHS.DOCUMENT.replace(":id", record.id));
                    }}
                  >
                    {text}
                  </Typography.Link>
                </Tooltip>
              ),
            },
            {
              title: "Статус",
              dataIndex: "status",
              sorter: true,
              showSorterTooltip: false,
              width: 205,
              filterMultiple: false,
              filters: [
                {
                  text: "Обработано",
                  value: "success",
                },
                {
                  text: "Ошибка обработки",
                  value: "error",
                },
                {
                  text: "Обрабатывается",
                  value: "processing",
                },
              ],
              render: (_: any, record: DocumentType) => (
                <StatusLabel status={record.status} />
              ),
            },
            {
              title: "Дата загрузки",
              dataIndex: "createdAt",
              align: "right",
              sorter: true,
              showSorterTooltip: false,
              width: 156,
              render: (date: string) => formatDate(date),
            },
            {
              title: "Действия",
              dataIndex: "id",
              width: 104,
              className: "actions-column",
              render: (id: string) => (
                <Flex gap={8} justify="flex-end">
                  <Button
                    color="primary"
                    variant="text"
                    icon={<DownloadIcon />}
                    onClick={() => handleDownload([id])}
                  />
                  <Button
                    color="red"
                    variant="text"
                    icon={<DeleteIcon />}
                    onClick={() => handleDelete([id])}
                  />
                </Flex>
              ),
            },
          ],
        },
      ] as TableColumnsType<DocumentType>,
    [actions, navigate, handleDelete, handleDownload]
  );

  const paginationConfig = useMemo<TableProps["pagination"]>(() => {
    return {
      pageSize: pagination.pageSize,
      pageSizeOptions: [15, 25, 50],
      current: pagination.page + 1,
      total: tableData?.total ?? 0,
      showSizeChanger: true,
      showQuickJumper: true,
      locale: {
        jump_to: "Перейти к",
        items_per_page: "/стр.",
        page: "",
      },
      onChange: (page, pageSize) => {
        setPagination({
          page: pageSize !== pagination.pageSize ? 0 : page - 1,
          pageSize,
        });
      },
      showTotal: (total) => (
        <Flex gap={24} align="center" style={{ height: "100%" }}>
          <Typography.Text strong>Всего документов: {total}</Typography.Text>
          <Typography.Text>Загружено за сеанс: {sessionCount}</Typography.Text>
        </Flex>
      ),
    };
  }, [pagination, tableData, sessionCount]);

  return (
    <Flex vertical gap={16}>
      <Flex gap={24} style={{ width: "100%" }}>
        <Input
          placeholder="Поиск по названию"
          value={search}
          prefix={
            <SearchOutlined
              style={{ color: "var(--secondary-color)", marginInlineEnd: 20 }}
            />
          }
          allowClear
          onChange={(e) => {
            setSearch(e.target.value);
          }}
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalOpen(true)}
        >
          Загрузить
        </Button>
      </Flex>
      <Table<DocumentType>
        rowKey="id"
        columns={columns}
        loading={isLoading}
        dataSource={tableData?.data ?? []}
        rowSelection={{
          type: "checkbox",
          selectedRowKeys: selectedIds,
          onChange: (selectedRowKeys) => {
            setSelectedIds(selectedRowKeys.map((id) => String(id)));
          },
        }}
        pagination={paginationConfig}
        onChange={(_, filter, sorterConfig) => {
          setStatusFilter(filter?.status?.[0] as StatusType);

          const sorter = Array.isArray(sorterConfig)
            ? sorterConfig[0]
            : sorterConfig;
          setSortBy(
            sorter.field
              ? `${sorter.order === "descend" ? "-" : ""}${sorter.field.toString()}`
              : ""
          );
        }}
        scroll={{ x: "870px", y: "calc(100vh - 380px)" }}
      />
      <UploadModal
        isOpen={isModalOpen}
        onClose={(success) => {
          if (success) {
            setSessionCount((value) => value + 1);
          }
          setIsModalOpen(false);
        }}
      />
    </Flex>
  );
};
