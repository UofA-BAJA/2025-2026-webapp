import ReactECharts from "echarts-for-react";
import { useEffect, useRef } from "react";

type Point = [number, number];

interface dataTypeId {
  dataType: number;
}

const baseOption = {
  animation: false,
  xAxis: {
    type: "value",
    scale: true,
  },
  yAxis: {
    type: "value",
    scale: true,
    // gap between y axis from min and max so data no cramped
    boundaryGap: ["30%", "30%"],
  },
  series: [
    {
      type: "line",
      showSymbol: false, // no dots
      smooth: false, // no smooth graph
      data: [],
    },
  ],
};

export default function DynamicPlot({ dataType }: dataTypeId) {
  const chartRef = useRef<ReactECharts | null>(null);
  const dataRef = useRef<Point[]>([]);

  useEffect(() => {
    dataRef.current = [];
    const sse = new EventSource("http://localhost:8000/stream");

    const handler = (e: MessageEvent) => {
      const dataPacked = JSON.parse(e.data);
      if (dataPacked.type !== dataType) return;

      dataRef.current.push([dataPacked.ts, dataPacked.data[0]]);
      if (dataRef.current.length > 50) dataRef.current.shift();

      const instance = chartRef.current?.getEchartsInstance();
      if (!instance) return;

      const data = dataRef.current;
      const xMin = data[0][0];
      const xMax = data[data.length - 1][0];

      instance.setOption(
        {
          xAxis: { min: xMin, max: xMax },
          series: [{ type: "line", smooth: false, showSymbol: false, data }],
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
      option={baseOption}
      style={{ height: "100%" }}
    />
  );
}
