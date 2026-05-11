import { useEffect, useState } from "react";

let showRssiLevel = (rssi: number) => {
  if (rssi >= -30) {
    return `[■■■■■■■■■□] ${rssi}`;
  } else if (rssi >= -70) {
    return `[■■■■■■■□□□] ${rssi}`;
  } else if (rssi >= -100) {
    return `[■■■■■□□□□□] ${rssi}`;
  } else {
    return `[■■□□□□□□□□] ${rssi}`;
  }
};

export default function Rssi() {
  const [rssi, setRssi] = useState(0);

  // get rssi and update value
  useEffect(() => {
    const sse = new EventSource("http://localhost:8000/stream");

    sse.onmessage = (e) => {
      const packet = JSON.parse(e.data);
      setRssi(packet.rssi);
    };

    return () => {
      sse.close();
    };
  }, []);

  return <p>{showRssiLevel(rssi)}</p>;
}
