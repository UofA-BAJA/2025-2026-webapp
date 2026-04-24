import ReactECharts from "echarts-for-react";
import { useEffect, useRef } from "react";

type Point = [number | string | Date, number];
// single point SSE Client
const sse = new EventSource("http://localhost:8000/stream");
interface dataTypeId {
  dataType: number;
}

const baseOption = {
  animation: false,
  xAxis: { type: "time" },
  yAxis: { type: "value", scale: true, interval: 1, min: 0 },
  series: [{ type: "line", showSymbol: false, data: [] }],
};

export default function DynamicPlot({ dataType }: dataTypeId) {
  const chartRef = useRef<ReactECharts | null>(null);
  const dataRef = useRef<Point[]>([]);

  useEffect(() => {
    dataRef.current = [];
    const handler = (e: MessageEvent) => {
      // read the data
      const data = JSON.parse(e.data);
      if (data.dataType == dataType) {
        // push the data to our current chart
        console.log(data.timestamp)
        dataRef.current.push([data.timestamp, data.value]);
        // shift to only show 50 points at a time
        if (dataRef.current.length > 50) {
          dataRef.current.shift();
        }
        // update the full chart
        chartRef.current?.getEchartsInstance()?.setOption({
          series: [{ data: dataRef.current }],
        });
      }
    };
    // each new instance does the action above on every message
    sse.addEventListener("message", handler);
    return () => sse.removeEventListener("message", handler);
  }, [dataType]);

  return (
    <ReactECharts
      ref={chartRef}
      option={baseOption}
      style={{ height: "100%" }}
    />
  );
}
