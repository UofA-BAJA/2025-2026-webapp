import ReactECharts from "echarts-for-react";
import { useEffect, useRef } from "react";

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

  const fetchData = async () => {
    const res = await fetch("/api/metrics");
    const json = await res.json();

    dataRef.current.push([json.timestamp, json.value]);

    if (dataRef.current.length > 50) {
      dataRef.current.shift();
    }

    updateChart();
  };

  const updateChart = () => {
    const chart = chartRef.current?.getEchartsInstance();
    if (!chart) return;

    chart.setOption({
      series: [{ data: dataRef.current }],
    });
  };

  useEffect(() => {
    const id = setInterval(fetchData, 2000);
    return () => clearInterval(id);
  }, []);

  return (
    <ReactECharts ref={chartRef} option={baseOption} style={{ height: 400 }} />
  );
}
