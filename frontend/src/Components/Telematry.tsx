import ReactGridLayout, { useContainerWidth } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { useState, type RefObject } from "react";
import DynamicPlot from "./DynamicPlot";

type Chart = {
  id: string;
};

type LayoutItem = {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

const cardStyle: React.CSSProperties = {
  height: "100%",
  border: "1px solid #ccc",
  borderRadius: 8,
  padding: 12,
  boxSizing: "border-box",
  position: "relative",
};

function Telematry() {
  const { width, containerRef, mounted } = useContainerWidth();
  // adding id of new charts
  const [charts, setCharts] = useState<Chart[]>([
    { id: "a" },
    { id: "b" },
    { id: "c" },
  ]);

  // maps id to position of item on the viewport
  const [layout, setLayout] = useState<LayoutItem[]>([
    { i: "a", x: 0, y: 0, w: 4, h: 5 },
    { i: "b", x: 4, y: 0, w: 4, h: 5 },
    { i: "c", x: 8, y: 0, w: 4, h: 5 },
  ]);

  // add a chart and set id to curren time
  const addChart = () => {
    const id = String(Date.now());
    const col = (charts.length * 4) % 12;
    setCharts((prev) => [...prev, { id }]);
    setLayout((prev) => [...prev, { i: id, x: col, y: Infinity, w: 4, h: 5 }]);
  };

  // remove a charts from the set
  const removeChart = (id: string) => {
    setCharts((prev) => prev.filter((c) => c.id !== id));
    setLayout((prev) => prev.filter((item) => item.i !== id));
  };

  return (
    <div style={{ padding: 16 }}>
      <div style={{ marginBottom: 16 }}>
        <button onClick={addChart}>Add Plot</button>
      </div>

      <div
        ref={containerRef as RefObject<HTMLDivElement>}
        style={{ width: "100%" }}
      >
        {mounted && (
          <ReactGridLayout
            layout={layout}
            width={width}
            gridConfig={{ cols: 12, rowHeight: 80 }}
            onLayoutChange={(newLayout) => setLayout([...newLayout])}
          >
            {charts.map((chart) => (
              <div key={chart.id} style={cardStyle}>
                <button
                  onClick={() => removeChart(chart.id)}
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 16,
                    lineHeight: 1,
                    zIndex: 10,
                  }}
                >
                  remove
                </button>
                <DynamicPlot />
              </div>
            ))}
          </ReactGridLayout>
        )}
      </div>
    </div>
  );
}

export default Telematry;
