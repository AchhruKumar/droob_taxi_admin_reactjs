import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div style={styles.container}>
      <h1 style={styles.code}>404</h1>
      <p style={styles.message}>Sorry, the page you're looking for does not exist.</p>
      <Link to="/" style={styles.link}>
        ← Back to Dashboard
      </Link>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#f9f9f9",
    fontFamily: "'Arial', sans-serif",
  },
  code: {
    fontSize: "12rem",
    margin: "0",
    color: "#333",
  },
  message: {
    fontSize: "1.75rem",
    margin: "20px 0",
    color: "#555",
  },
  link: {
    display: "inline-block",
    padding: "12px 24px",
    backgroundColor: "rgb(136, 198, 100)",
    color: "#fff",
    textDecoration: "none",
    borderRadius: "6px",
    fontSize: "1.1rem",
    fontWeight: "bold",
    transition: "background-color 0.3s ease",
  },
};

styles.link[':hover'] = {
  backgroundColor: "rgb(120, 180, 80)",
};

export default NotFound;
