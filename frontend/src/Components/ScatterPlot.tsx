import ReactECharts from "echarts-for-react";
import { useState, useEffect } from "react";
import keycloak from "../Keycloak";
import axios from "axios";
const rootURL = "http://localhost:5269";

function ScatterPlot() {
  type Temp = {
    id: number;
    epoch: number;
    value: number;
    beltId: number;
  };

  type Belt = {
    id: number;
    name: string;
  };

  const [belts, setBelts] = useState<Belt[]>([]);
  const [temps, setTemps] = useState<Temp[]>([]);
  useEffect(() => {
    let canceled = false;

    async function getAllTemps() {
      try {
        await keycloak.updateToken(30);
        const response = await axios.get(`${rootURL}/temp`, {
          headers: {
            Authorization: `Bearer ${keycloak.token}`,
            "Content-Type": "application/json",
          },
        });
        if (!canceled) {
          setTemps(response.data);
        }
      } catch (error) {
        if (!canceled) {
          console.error("Error fetching Temps:", error);
        }
      }
    }

    async function getAllBelts() {
      try {
        await keycloak.updateToken(30);
        const response = await axios.get(`${rootURL}/Belts`, {
          headers: {
            Authorization: `Bearer ${keycloak.token}`,
            "Content-Type": "application/json",
          },
        });
        if (!canceled) {
          setBelts(response.data);
        }
      } catch (error) {
        if (!canceled) {
          console.error("Error fetching belts:", error);
        }
      }
    }
    getAllBelts();
    getAllTemps();

    return () => {
      canceled = true;
    };
  }, []);

  let options = {
    xAxis: {
      type: "category",
      data: belts.map((t) => t.id),
    },
    darkmode: false,
    yAxis: {
      type: "value",
    },
    tooltip: {
      trigger: "none",
      axisPointer: {
        type: "cross",
      },
    },
    series: [
      {
        data: temps.map(t => [t.beltId, t.value]),
        type: "line",
        sampling: "lttb",
        smooth: true,
      },
    ],
  };
  return (
    <ReactECharts option={options} style={{ height: "400px", width: "100%" }} />
  );
}

export default ScatterPlot;
