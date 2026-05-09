import { Route, Routes } from "react-router-dom";
import "./App.css";
import Home from "./Components/Home";
import Contact from "./Components/Contact";
import Nave from "./Components/Nave";
import About from "./Components/About";
import TestSecure from "./Components/TestSecure";
import Convert from "./Components/Convert";
import Telemetry from "./Components/Telemetry";
import { DarkModeProvider } from "./context/DarkModeContaxt";

function App() {
  return (
    <div className="App">
      <DarkModeProvider>
        <Nave />
        <Routes>
          <Route path="/secure-test" element={<TestSecure />} />
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/convert" element={<Convert />} />
          <Route path="/telemetry" element={<Telemetry />} />
        </Routes>
      </DarkModeProvider>
    </div>
  );
}

export default App;
