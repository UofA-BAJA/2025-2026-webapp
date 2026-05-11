import ReactGridLayout, { useContainerWidth } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { useEffect, useState, type RefObject } from "react";
import DynamicPlot from "./DynamicPlot";
import Rssi from "./Rssi";
import { useDarkMode } from "../context/DarkModeContaxt";
import { DATA_TYPE_MAP, type DataTypeKey } from "../types/dataTypes";

// Types
type Chart = {
  id: string;
  dataType: DataTypeKey;
};

type LayoutItem = {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

// Persistence helpers
function getInitialCharts(): Chart[] {
  try {
    const saved = localStorage.getItem("charts");
    if (saved) {
      const parsed: Chart[] = JSON.parse(saved);
      const isValid = parsed.every((c) => c.dataType in DATA_TYPE_MAP);
      if (isValid) return parsed;
      localStorage.removeItem("charts");
      localStorage.removeItem("layout");
    }
  } catch {
    localStorage.removeItem("charts");
    localStorage.removeItem("layout");
  }

  return [
    { id: "a", dataType: "imu_rotation_x" },
    { id: "b", dataType: "imu_rotation_y" },
    { id: "c", dataType: "imu_rotation_z" },
  ];
}

function getInitialLayout(): LayoutItem[] {
  const saved = localStorage.getItem("layout");
  if (saved) return JSON.parse(saved);

  return [
    { i: "a", x: 0, y: 0, w: 4, h: 5 },
    { i: "b", x: 4, y: 0, w: 4, h: 5 },
    { i: "c", x: 8, y: 0, w: 4, h: 5 },
  ];
}

const DATA_TYPE_OPTIONS = Object.entries(DATA_TYPE_MAP) as [
  DataTypeKey,
  (typeof DATA_TYPE_MAP)[DataTypeKey],
][];

const cardStyle: React.CSSProperties = {
  height: "100%",
  border: "1px solid #ccc",
  borderRadius: 8,
  padding: "10px 10px 8px 10px",
  boxSizing: "border-box",
  position: "relative",
  display: "flex",
  flexDirection: "column",
};

export default function Telemetry() {
  const { width, containerRef, mounted } = useContainerWidth();
  const { darkMode } = useDarkMode();

  const [charts, setCharts] = useState<Chart[]>(getInitialCharts);
  const [layout, setLayout] = useState<LayoutItem[]>(getInitialLayout);

  const saveCharts = (updater: (prev: Chart[]) => Chart[]) => {
    setCharts((prev) => {
      const next = updater(prev);
      localStorage.setItem("charts", JSON.stringify(next));
      return next;
    });
  };

  const saveLayout = (
    updater: LayoutItem[] | ((prev: LayoutItem[]) => LayoutItem[]),
  ) => {
    setLayout((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      localStorage.setItem("layout", JSON.stringify(next));
      return next;
    });
  };

  const addChart = () => {
    const id = String(Date.now());
    const col = (charts.length * 4) % 12;
    const defaultType = DATA_TYPE_OPTIONS[0][0];
    saveCharts((prev) => [...prev, { id, dataType: defaultType }]);
    saveLayout((prev) => [...prev, { i: id, x: col, y: Infinity, w: 4, h: 5 }]);
  };

  const updateChartType = (id: string, dataType: DataTypeKey) => {
    saveCharts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, dataType } : c)),
    );
  };

  const removeChart = (id: string) => {
    saveCharts((prev) => prev.filter((c) => c.id !== id));
    saveLayout((prev) => prev.filter((item) => item.i !== id));
  };

  //seEffect(getRSSI());
  return (
    <div style={{ padding: 16 }}>
      <div style={{ marginBottom: 16 }}>
        <button onClick={addChart}>Add Plot</button>
        <Rssi />
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
            onLayoutChange={(newLayout) => saveLayout([...newLayout])}
          >
            {charts.map((chart) => (
              <div key={chart.id} style={cardStyle}>
                {/* Remove button */}
                <button
                  onClick={() => removeChart(chart.id)}
                  style={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    background: "none",
                    color: darkMode ? "white" : "black",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 16,
                    zIndex: 10,
                  }}
                >
                  ✕
                </button>

                {/* Title */}
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                  {DATA_TYPE_MAP[chart.dataType].label}
                </div>

                {/* Plot — fills all remaining vertical space */}
                <div style={{ flex: 1, minHeight: 0 }}>
                  <DynamicPlot dataType={chart.dataType} />
                </div>

                {/* Select — sits below the plot with breathing room */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    paddingTop: 1,
                  }}
                >
                  <select
                    value={chart.dataType}
                    onChange={(e) =>
                      updateChartType(chart.id, e.target.value as DataTypeKey)
                    }
                  >
                    {DATA_TYPE_OPTIONS.map(([key, config]) => (
                      <option key={key} value={key}>
                        {config.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </ReactGridLayout>
        )}
      </div>
    </div>
  );
}
