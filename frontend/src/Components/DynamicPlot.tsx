import ReactECharts from "echarts-for-react";
import { useEffect, useRef } from "react";
import type { DataTypeKey } from "../types/dataTypes";

type Point = [number, number];

interface DynamicPlotProps {
  dataType: DataTypeKey;
}

const BASE_OPTION = {
  animation: false,
  xAxis: { type: "value", scale: true },
  yAxis: { type: "value", scale: true },
  series: [{ type: "line", showSymbol: false, smooth: false, data: [] }],
} as const;

export default function DynamicPlot({ dataType }: DynamicPlotProps) {
  const chartRef = useRef<ReactECharts | null>(null);
  const dataRef = useRef<Point[]>([]);

  useEffect(() => {
    dataRef.current = [];

    const sse = new EventSource("http://localhost:8000/stream");

    const handler = (e: MessageEvent) => {
      const packet = JSON.parse(e.data);

      if (!(dataType in packet)) return;

      const value: number = packet[dataType];
      dataRef.current.push([packet.ts, value]);
      if (dataRef.current.length > 50) dataRef.current.shift();

      const instance = chartRef.current?.getEchartsInstance();
      if (!instance) return;

      const pts = dataRef.current;
      const ys = pts.map((p) => p[1]);
      const minY = Math.min(...ys);
      const maxY = Math.max(...ys);
      const pad = (maxY - minY) * 0.2 || Math.abs(minY) * 0.2 || 1;

      instance.setOption(
        {
          xAxis: { min: pts[0][0], max: pts[pts.length - 1][0] },
          yAxis: {
            min: Math.floor(minY - pad),
            max: Math.ceil(maxY + pad),
          },
          series: [
            { type: "line", smooth: false, showSymbol: false, data: pts },
          ],
        },
        { replaceMerge: ["series"] },
      );
    };

    sse.addEventListener("message", handler);
    return () => {
      sse.removeEventListener("message", handler);
      sse.close();
    };
  }, [dataType]);

  return (
    <ReactECharts
      ref={chartRef}
      option={BASE_OPTION}
      style={{ height: "100%"}}
    />
  );
}
