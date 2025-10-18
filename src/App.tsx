import React from "react";
import { App as AntdApp, ConfigProvider } from "antd";
import ruRU from "antd/locale/ru_RU";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { RootLayout, DocumentsTable, Document } from "layout";
import { ErrorBoundary } from "components";
import { ROUTE_PATHS, getTheme } from "utils";

function App() {
  return (
    <AntdApp>
      <ConfigProvider theme={getTheme()} locale={ruRU}>
        <ErrorBoundary>
          <BrowserRouter>
            <Routes>
              <Route element={<RootLayout />}>
                <Route index element={<DocumentsTable />} />
                <Route path={ROUTE_PATHS.DOCUMENT} element={<Document />} />
                <Route
                  path={ROUTE_PATHS.DOCUMENT_PAGE}
                  element={<Document isPageView />}
                />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </ErrorBoundary>
      </ConfigProvider>
    </AntdApp>
  );
}

export default App;
