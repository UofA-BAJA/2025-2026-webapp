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
  yAxis: { type: "value", scale: true, boundaryGap: ["20", "20%"] },
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

      // Skip frames that don't contain the field we care about
      if (!(dataType in packet)) return;

      const value: number = packet[dataType];
      dataRef.current.push([packet.ts, value]);
      if (dataRef.current.length > 50) dataRef.current.shift();

      const instance = chartRef.current?.getEchartsInstance();
      if (!instance) return;

      const pts = dataRef.current;
      instance.setOption(
        {
          xAxis: { min: pts[0][0], max: pts[pts.length - 1][0] },
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
      style={{ height: "100%" }}
    />
  );
}
