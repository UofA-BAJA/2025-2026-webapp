import ReactGridLayout, { useContainerWidth } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { useState, type RefObject } from "react";
import DynamicPlot from "./DynamicPlot";
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
      // Discard cache if any entry has a dataType not in the map
      const isValid = parsed.every((c) => c.dataType in DATA_TYPE_MAP);
      if (isValid) return parsed;
      // Stale format detected — wipe both keys together
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

// Dropdown options (derived from the map — no manual list to maintain)
const DATA_TYPE_OPTIONS = Object.entries(DATA_TYPE_MAP) as [
  DataTypeKey,
  (typeof DATA_TYPE_MAP)[DataTypeKey],
][];

// Card style
const cardStyle: React.CSSProperties = {
  height: "100%",
  border: "1px solid #ccc",
  borderRadius: 8,
  padding: 5,
  boxSizing: "border-box",
  position: "relative",
};

// Component
export default function Telemetry() {
  const { width, containerRef, mounted } = useContainerWidth();
  const { darkMode } = useDarkMode();

  const [charts, setCharts] = useState<Chart[]>(getInitialCharts);
  const [layout, setLayout] = useState<LayoutItem[]>(getInitialLayout);

  // Persist helpers
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

  // CRUD
  const addChart = () => {
    const id = String(Date.now());
    const col = (charts.length * 4) % 12;
    // Default new charts to the first key in the map
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

  // Render
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

                {/* Chart title derived from the map */}
                <div
                  style={{
                    fontSize: 12,
                    marginBottom: 4,
                    marginLeft: 10,
                    marginTop: 10,
                    fontWeight: 600,
                  }}
                >
                  {DATA_TYPE_MAP[chart.dataType].label}
                </div>

                {/* The plot — receives a string key, not a magic number */}
                <DynamicPlot dataType={chart.dataType} />

                {/* DataType selector — options come from the map automatically */}
                <select
                  style={{ position: "absolute", left: "30%", bottom: "2%" }}
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
            ))}
          </ReactGridLayout>
        )}
      </div>
    </div>
  );
}
