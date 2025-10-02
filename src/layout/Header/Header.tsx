import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Layout, Flex, Button } from "antd";
import { LogoIcon, HomeIcon, ProfileIcon } from "components";
import "./index.scss";

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Layout.Header className="header">
      <Flex justify="space-between" align="center">
        <Link to="/">
          <LogoIcon />
        </Link>
        <Flex gap={36} align="center" style={{ height: 36 }}>
          <Button
            type="link"
            icon={<HomeIcon />}
            onClick={(e) => {
              e.preventDefault();
              navigate("/");
            }}
            style={{
              alignItems: "stretch",
              padding: 0,
              height: 24,
              fontSize: 16,
              color:
                location.pathname === "/"
                  ? "var(--primary-color)"
                  : "var(--grey-color)",
            }}
          >
            Главная
          </Button>
          <Button
            type="link"
            icon={<ProfileIcon />}
            disabled
            style={{
              alignItems: "stretch",
              color: "var(--grey-color)",
              padding: 0,
              height: 24,
              fontSize: 16,
            }}
          >
            Профиль
          </Button>
        </Flex>
      </Flex>
    </Layout.Header>
  );
};
