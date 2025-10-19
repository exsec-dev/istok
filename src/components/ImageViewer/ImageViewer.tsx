import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { Button, Flex, Typography } from "antd";
import {
  ZoomInOutlined,
  ZoomOutOutlined,
  ColumnWidthOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
} from "@ant-design/icons";
import {
  TransformWrapper,
  TransformComponent,
  type ReactZoomPanPinchContentRef,
} from "react-zoom-pan-pinch";
import { HighlightBlock } from "components";
import { getConfidenceObj, type TextType, type PointsType } from "utils";

interface ImageViewerProps {
  url?: string;
  min?: number;
  max?: number;
  selectedNode?: TextType;
  zoomBlockId?: string;
  containerRef: HTMLDivElement | null;
  isFullscreen: boolean;
  resetZoom: () => void;
}

export const ImageViewer = ({
  url,
  min,
  max,
  selectedNode,
  zoomBlockId,
  containerRef,
  isFullscreen,
  resetZoom,
}: ImageViewerProps) => {
  const [scale, setScale] = useState(1);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const apiRef = useRef<ReactZoomPanPinchContentRef | null>(null);

  const highlightPoints = useMemo(() => {
    const img = imgRef.current;
    if (!img || !selectedNode) return undefined;

    const { clientWidth, clientHeight, naturalWidth, naturalHeight } = img;
    if (!naturalWidth || !naturalHeight) return undefined;

    const sx = clientWidth / naturalWidth;
    const sy = clientHeight / naturalHeight;
    return [
      { x: selectedNode.x1 * sx, y: selectedNode.y1 * sy },
      { x: selectedNode.x2 * sx, y: selectedNode.y2 * sy },
      { x: selectedNode.x3 * sx, y: selectedNode.y3 * sy },
      { x: selectedNode.x4 * sx, y: selectedNode.y4 * sy },
    ] as PointsType;
  }, [selectedNode]);

  const fitWidth = useCallback(() => {
    const api = apiRef.current;
    const wrap = api?.instance?.wrapperComponent;
    const img = imgRef.current;
    if (!api || !wrap || !img) return;
    const cw = wrap.clientWidth;
    const ch = wrap.clientHeight;
    const iw = img.clientWidth;
    const ih = img.clientHeight;
    if (!iw || !ih) return;

    const s = cw / iw;
    const tx = 0;
    const ty = (ch - ih * s) / 2;
    api.setTransform(tx, ty, s, 0);
  }, []);

  const zoomToBlock = useCallback(
    (points: PointsType) => {
      const api = apiRef.current;
      const wrap = api?.instance?.wrapperComponent;
      const img = imgRef.current;
      if (!api || !wrap || !img || !points || points.length !== 4) return;

      const cw = wrap.clientWidth;
      const ch = wrap.clientHeight;

      let minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity;
      for (const p of points) {
        if (p.x < minX) minX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.x > maxX) maxX = p.x;
        if (p.y > maxY) maxY = p.y;
      }

      const bw = Math.max(1, maxX - minX);
      const bh = Math.max(1, maxY - minY);

      const padding = 24;
      const availW = Math.max(1, cw - 2 * padding);
      const availH = Math.max(1, ch - 2 * padding);

      const s = Math.min(availW / bw, availH / bh);

      const cx = minX + bw / 2;
      const cy = minY + bh / 2;

      const tx = cw / 2 - cx * s;
      const ty = ch / 2 - cy * s;

      api.setTransform(tx, ty, s, 200);
      resetZoom();
    },
    [resetZoom]
  );

  const openFullscreen = () => {
    if (!containerRef) return;

    if (containerRef.requestFullscreen) {
      containerRef.requestFullscreen();
    } else if ((containerRef as any).webkitRequestFullscreen) {
      (containerRef as any).webkitRequestFullscreen();
    } else if ((containerRef as any).msRequestFullscreen) {
      (containerRef as any).msRequestFullscreen();
    }
  };

  const closeFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if ((document as any).webkitExitFullscreen) {
      (document as any).webkitExitFullscreen();
    } else if ((document as any).msExitFullscreen) {
      (document as any).msExitFullscreen();
    }
  };

  useEffect(() => {
    if (zoomBlockId && highlightPoints) {
      zoomToBlock(highlightPoints);
    }
  }, [zoomBlockId, zoomToBlock, highlightPoints]);

  useEffect(() => {
    fitWidth();
  }, [url, fitWidth]);

  const { color, icon } = getConfidenceObj(
    (selectedNode?.confidence ?? 0) * 100,
    min,
    max
  );

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        paddingRight: 8,
        position: "relative",
      }}
    >
      <TransformWrapper
        ref={apiRef}
        minScale={0.1}
        maxScale={10}
        centerOnInit
        disablePadding
        wheel={{ step: 0.2, smoothStep: 0.002 }}
        doubleClick={{ mode: "zoomIn", step: 0.8 }}
        onTransformed={({ state }) => setScale(state.scale)}
      >
        {({ zoomIn, zoomOut }) => (
          <>
            <Flex
              gap={8}
              style={{ position: "absolute", zIndex: 1, padding: "8px 12px" }}
            >
              <Button icon={<ZoomInOutlined />} onClick={() => zoomIn()} />
              <Button icon={<ZoomOutOutlined />} onClick={() => zoomOut()} />
              <Button icon={<ColumnWidthOutlined />} onClick={fitWidth} />
              <Button
                icon={
                  isFullscreen ? (
                    <FullscreenExitOutlined />
                  ) : (
                    <FullscreenOutlined />
                  )
                }
                onClick={isFullscreen ? closeFullscreen : openFullscreen}
              />
            </Flex>
            <TransformComponent
              wrapperStyle={{
                width: "100%",
                height: "100%",
                overflow: "hidden",
                border: "1px solid #f0f0f0",
                borderRadius: 8,
                background: "#fafafa",
                userSelect: "none",
              }}
              contentStyle={{ position: "relative" }}
            >
              <img
                ref={imgRef}
                src={url}
                alt=""
                draggable={false}
                style={{ display: "block" }}
              />
              {highlightPoints && (
                <HighlightBlock
                  scale={scale}
                  points={highlightPoints}
                  color={color}
                />
              )}
            </TransformComponent>
            {selectedNode ? (
              <Flex className="confidence-label">
                {selectedNode.edited ? (
                  <Typography.Text>Отредактировано</Typography.Text>
                ) : (
                  <>
                    <Typography.Text>
                      Уверенность элемента:{" "}
                      {(selectedNode.confidence * 100).toFixed()}%
                    </Typography.Text>
                    {icon}
                  </>
                )}
              </Flex>
            ) : null}
          </>
        )}
      </TransformWrapper>
    </div>
  );
};
