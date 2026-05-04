// import ReactECharts from "echarts-for-react";
// import { useEffect, useRef } from "react";

// type Point = [number, number];

// interface dataTypeId {
//   dataType: number;
// }

// const baseOption = {
//   animation: false,
//   xAxis: {
//     type: "value",
//     scale: true,
//   },
//   yAxis: {
//     type: "value",
//     scale: true,
//     // gap between y axis from min and max so data no cramped
//     boundaryGap: ["30%", "30%"],
//   },
//   series: [
//     {
//       type: "line",
//       showSymbol: false, // no dots
//       smooth: false, // no smooth graph
//       data: [],
//     },
//   ],
// };

// export default function DynamicPlot({ dataType }: dataTypeId) {
//   const chartRef = useRef<ReactECharts | null>(null);
//   const dataRef = useRef<Point[]>([]);

//   useEffect(() => {
//     dataRef.current = [];
//     const sse = new EventSource("http://localhost:8000/stream");

//     const handler = (e: MessageEvent) => {
//       const dataPacked = JSON.parse(e.data);
//       if (dataPacked.type !== dataType) return;

//       dataRef.current.push([dataPacked.ts, dataPacked.data[0]]);
//       if (dataRef.current.length > 50) dataRef.current.shift();

//       const instance = chartRef.current?.getEchartsInstance();
//       if (!instance) return;

//       const data = dataRef.current;
//       const xMin = data[0][0];
//       const xMax = data[data.length - 1][0];

//       instance.setOption(
//         {
//           xAxis: { min: xMin, max: xMax },
//           series: [{ type: "line", smooth: false, showSymbol: false, data }],
//         },
//         { replaceMerge: ["series"] },
//       );
//     };

//     sse.addEventListener("message", handler);
//     return () => {
//       sse.removeEventListener("message", handler);
//       sse.close();
//     };
//   }, [dataType]);

//   return (
//     <ReactECharts
//       ref={chartRef}
//       option={baseOption}
//       style={{ height: "100%" }}
//     />
//   );
// }

import ReactECharts from "echarts-for-react";
import { useEffect, useRef } from "react";
import { DATA_TYPE_MAP, type DataTypeKey } from "../types/dataTypes";

type Point = [number, number];

interface DynamicPlotProps {
  dataType: DataTypeKey;
}

const BASE_OPTION = {
  animation: false,
  xAxis: { type: "value", scale: true },
  yAxis: { type: "value", scale: true, boundaryGap: ["30%", "30%"] },
  series: [{ type: "line", showSymbol: false, smooth: false, data: [] }],
} as const;

export default function DynamicPlot({ dataType }: DynamicPlotProps) {
  const chartRef = useRef<ReactECharts | null>(null);
  const dataRef = useRef<Point[]>([]);

  useEffect(() => {
    const { typeCode, fieldIndex } = DATA_TYPE_MAP[dataType];
    dataRef.current = [];

    const sse = new EventSource("http://localhost:8000/stream");

    const handler = (e: MessageEvent) => {
      const packet = JSON.parse(e.data);

      // Filter by numeric typeCode, then pick the right field from data[]
      if (packet.type !== typeCode) return;

      const value: number = packet.data[fieldIndex];
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
  }, [dataType]); // re-subscribe whenever the key changes

  return (
    <ReactECharts
      ref={chartRef}
      option={BASE_OPTION}
      style={{ height: "100%" }}
    />
  );
}
