import { ConfigProvider } from "antd";
import type { GetProps } from "antd";

type ConfigProviderProps = GetProps<typeof ConfigProvider>;

export const getTheme = (): ConfigProviderProps["theme"] => {
  return {
    token: {
      colorPrimary: "#1153ec",
      fontSize: 14,
      fontFamily: '"Open Sans", sans-serif',
      colorText: "#201d30",
    },
    components: {
      Layout: {
        bodyBg: "var(--bg-color)",
        headerBg: "none",
        footerBg: "none",
      },
      Button: {
        colorLink: "var(--primary-color)",
        colorPrimary: "#1153ec",
      },
      Typography: {
        colorText: "var(--text-color)",
        colorLink: "var(--primary-color)",
      },
      Table: {
        headerBg: "var(--light-grey-color)",
        headerSortActiveBg: "var(--light-hover-grey-color)",
        headerSortHoverBg: "var(--light-hover-grey-color)",
        rowSelectedBg: "var(--light-blue-color)",
        rowSelectedHoverBg: "var(--light-hover-blue-color)",
        colorText: "var(--text-color)",
      },
      Progress: {
        defaultColor: "var(--primary-color)",
      },
    },
  };
};
