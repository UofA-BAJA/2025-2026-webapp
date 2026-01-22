import { Link } from "react-router-dom";

function Nave() {
  return (
    <nav
      style={{
        width: "100%",
        backgroundColor: "#1a1a1a",
        padding: "15px",
        justifyContent: "center",
        marginBottom: "30px",
        gap: "2rem",
        textAlign: "center",
        top: 0,
        left: 0,
        zIndex: 1000,
      }}
    >
      <Link to="/" style={{ paddingRight: "5px" }}>
        Home
      </Link>
      <Link to="/about" style={{ paddingRight: "5px" }}>
        About
      </Link>
      <Link to="/contact" style={{ paddingRight: "5px" }}>
        Contact
      </Link>
    </nav>
  );
}

export default Nave;
