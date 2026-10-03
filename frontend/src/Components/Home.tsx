import { useState, useEffect } from "react";
import React from "react";
import axios from "axios";
import keycloak from "../Keycloak";
const rootURL = "http://localhost:5269";


function Home() {
  return (
    <div
      className="Home"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100vw",
        textAlign: "center",
        gap: "20px",
      }}
    >
      {/* Title */}
      <h1>!</h1>
    </div>
  );
}

export default Home;
