import { CSVLink } from "react-csv";
import Nave from "./Nave";
function Convert() {
  const headers = [
    {
      label: "SessionId",
      key: "sessionId",
    },
    {
      label: "Time Stamp",
      key: "ts",
    },
    {
      label: "Sensor",
      key: "sensor",
    },
    {
      label: "Temperature",
      key: "temperature",
    },
  ];
  const carData = [
    {
      sessionId: 12344,
      ts: 123,
      sensor: "BeltA",
      temperature: 23.233,
    },
    {
      sessionId: 12344,
      ts: 124,
      sensor: "BeltB",
      temperature: 34234.233,
    },
    {
      sessionId: 12345,
      ts: 126,
      sensor: "BeltC",
      temperature: 3124.233,
    },
  ];
  const CSVLinkAny = CSVLink as any;
  return (
    <>
      <h1>Convert Data</h1>
      <div>
        <CSVLinkAny data={carData} headers={headers} filename={"data.csv"}>
          Download me
        </CSVLinkAny>
      </div>
    </>
  );
}

export default Convert;
