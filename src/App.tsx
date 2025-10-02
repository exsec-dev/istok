import React from "react";
import { App as AntdApp, ConfigProvider } from "antd";
import ruRU from "antd/locale/ru_RU";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { RootLayout, DocumentsTable, Document } from "layout";
import { getTheme } from "utils";

function App() {
  return (
    <AntdApp>
      <ConfigProvider theme={getTheme()} locale={ruRU}>
        <BrowserRouter>
          <Routes>
            <Route element={<RootLayout />}>
              <Route path="/" element={<DocumentsTable />} />
              <Route path=":id" element={<Document />} />
              <Route path=":id/:number" element={<Document isSinglePage />} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ConfigProvider>
    </AntdApp>
  );
}

export default App;
