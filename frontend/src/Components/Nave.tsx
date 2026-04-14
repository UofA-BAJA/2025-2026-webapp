import { Link } from "react-router-dom";
import { useDarkMode } from "../context/DarkModeContaxt";

function Nave() {
  const { darkMode, toggleDarkMode } = useDarkMode();
  const ankerStyle: React.CSSProperties = {
    paddingRight: "5px",
    textDecoration: "none",
    color: darkMode ? "#fafafa" : "#1a1a1a",
  };
  return (
    <nav
      style={{
        width: "100%",
        backgroundColor: darkMode ? "#1a1a1a" : "#fafafa",
        padding: "15px",
        marginBottom: "30px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "2rem",
        top: 0,
        left: 0,
        zIndex: 1000,
        position: "relative",
      }}
    >
      <Link to="/" style={ankerStyle}>
        Home
      </Link>
      <Link to="/about" style={ankerStyle}>
        About
      </Link>
      <Link to="/contact" style={ankerStyle}>
        Contact
      </Link>
      <Link to="/convert" style={ankerStyle}>
        CSVConvert
      </Link>
      <Link to="/telematry" style={ankerStyle}>
        Telematry
      </Link>

      <button
        onClick={toggleDarkMode}
        style={{ position: "absolute", right: "50px" }}
      >
        {darkMode ? "Light" : "Dark"}
      </button>
    </nav>
  );
}

export default Nave;
