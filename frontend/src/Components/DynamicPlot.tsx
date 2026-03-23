import ReactECharts from "echarts-for-react";
import { useEffect, useRef } from "react";
import keycloak from "../Keycloak";

type Point = [number | string | Date, number];

const baseOption = {
  animation: true,
  xAxis: {
    type: "time",
  },
  yAxis: {
    type: "value",
    scale: true,
  },
  series: [
    {
      type: "line",
      showSymbol: false,
      data: [],
    },
  ],
};

export default function DynamicPlot() {
  const chartRef = useRef<ReactECharts | null>(null);
  const dataRef = useRef<Point[]>([]);
  const sse = new EventSource("http://localhost:8000/stream");

  // SSE event action
  sse.onmessage = (e) => {
    const data = JSON.parse(e.data);
    graphData(data);
  };

  // Graph the Data from the SSE
  const graphData = (data: {
    timestamp: string | number | Date;
    value: number;
  }) => {
    dataRef.current.push([data.timestamp, data.value]);
    if (dataRef.current.length > 50) {
      dataRef.current.shift();
    }
    updateChart();
  };

  // Error Handling
  sse.onerror = () => {
    // error log here
    sse.close();
  };

  const updateChart = () => {
    const chart = chartRef.current?.getEchartsInstance();
    if (!chart) return;

    chart.setOption({
      series: [{ data: dataRef.current }],
    });
  };

  useEffect(() => {
    const id = setInterval(updateChart, 2000);
    return () => clearInterval(id);
  }, []);

  return (
    <ReactECharts ref={chartRef} option={baseOption} style={{ height: 400 }} />
  );
}
