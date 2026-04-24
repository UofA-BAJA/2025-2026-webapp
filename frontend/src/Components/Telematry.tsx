import ReactGridLayout, { useContainerWidth } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { useState, type RefObject } from "react";
import DynamicPlot from "./DynamicPlot";
import { useDarkMode } from "../context/DarkModeContaxt";

type Chart = {
  id: string;
  dataType: number;
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

/*
{
	data_type: number
	data: array or float 
	ts: float
}
*/
const dataTypeList = [
  { data_type: "2", data: 2 },
  { data_type: "8", data: 8 },
];

// pull from localstorage if pst chart if saved
function getInitialCharts(): Chart[] {
  const oldChart = localStorage.getItem("charts");
  // old chart exist
  if (oldChart) {
    return JSON.parse(oldChart);
  }

  return [
    { id: "a", dataType: 8 },
    { id: "b", dataType: 2 },
    { id: "c", dataType: 2 },
  ];
}

// same idea as getInitialCharts()
function getInitialLayout(): LayoutItem[] {
  const oldLayout = localStorage.getItem("layout");

  if (oldLayout) {
    return JSON.parse(oldLayout);
  }

  return [
    { i: "a", x: 0, y: 0, w: 4, h: 5 },
    { i: "b", x: 4, y: 0, w: 4, h: 5 },
    { i: "c", x: 8, y: 0, w: 4, h: 5 },
  ];
}

function Telematry() {
  const { width, containerRef, mounted } = useContainerWidth();
  const { darkMode } = useDarkMode();

  // adding id of new charts
  const [charts, setCharts] = useState<Chart[]>(getInitialCharts);

  // maps id to position of item on the viewport
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

  // add a chart and set id to current time
  const addChart = () => {
    const id = String(Date.now());
    const col = (charts.length * 4) % 12;
    saveCharts((prev) => [...prev, { id, dataType: 1 }]);
    saveLayout((prev) => [...prev, { i: id, x: col, y: Infinity, w: 4, h: 5 }]);
  };

  const updateChartType = (id: string, dataType: number) => {
    saveCharts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, dataType } : c)),
    );
  };

  // remove a charts from the set
  const removeChart = (id: string) => {
    saveCharts((prev) => prev.filter((c) => c.id !== id));
    saveLayout((prev) => prev.filter((item) => item.i !== id));
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
            onLayoutChange={(newLayout) => saveLayout([...newLayout])}
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
                    color: darkMode ? "white" : "black",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 16,
                    lineHeight: 1,
                    zIndex: 10,
                  }}
                >
                  remove
                </button>

                {/* Dynamic Plot graphs spacific data type */}
                <DynamicPlot dataType={chart.dataType} />
                {/* Selection for changing type of chart*/}
                <select
                  style={{ position: "absolute", left: "40%", bottom: "5%" }}
                  value={chart.dataType}
                  onChange={(e) => {
                    updateChartType(chart.id, parseInt(e.target.value));
                  }}
                >
                  {dataTypeList.map((aDataType) => (
                    <option key={aDataType.data} value={aDataType.data}>
                      {aDataType.data_type}
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

export default Telematry;
