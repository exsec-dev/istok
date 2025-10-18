import React from "react";
import { Result, Button, Typography, Space, Card, Flex } from "antd";
import { FrownOutlined } from "@ant-design/icons";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

type ErrorBoundaryState = {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
};

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    hasError: false,
    error: undefined,
    errorInfo: undefined,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[ErrorBoundary] Uncaught error:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  buildErrorText() {
    const { error, errorInfo } = this.state;
    const lines: string[] = [];
    lines.push(`Time: ${new Date().toISOString()}`);
    lines.push(`URL: ${window.location.href}`);
    lines.push(`UserAgent: ${navigator.userAgent}`);
    if (error) {
      lines.push(`Error: ${error.name}: ${error.message}`);
      if (error.stack) lines.push("Stack:\n" + error.stack);
    }
    if (errorInfo?.componentStack) {
      lines.push("Component stack:\n" + errorInfo.componentStack);
    }
    return lines.join("\n\n");
  }

  renderFallback() {
    const { error } = this.state;
    const errorStack = error?.stack ?? "—";

    return (
      <Flex
        vertical
        justify="center"
        align="center"
        style={{ height: "100vh" }}
      >
        <Result
          icon={<FrownOutlined />}
          title="Что-то пошло не так..."
          extra={
            <Space wrap>
              <Button type="primary" onClick={this.handleRetry}>
                Попробовать снова
              </Button>
              <Button onClick={() => (window.location.href = "/")}>
                На главную
              </Button>
            </Space>
          }
        />
        <Card>
          <Typography.Paragraph style={{ whiteSpace: "pre-wrap" }}>
            {errorStack}
          </Typography.Paragraph>
        </Card>
      </Flex>
    );
  }

  render() {
    if (this.state.hasError) {
      return this.renderFallback();
    }
    return this.props.children;
  }
}
