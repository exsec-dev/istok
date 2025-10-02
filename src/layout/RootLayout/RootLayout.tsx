import React from "react";
import { Outlet } from "react-router-dom";
import { Layout } from "antd";
import { Header } from "layout/Header";

export const RootLayout = () => {
  return (
    <Layout className="layout">
      <Header />
      <Layout.Content>
        <Outlet />
      </Layout.Content>
    </Layout>
  );
};
