// components/Sidebar.tsx
import Link from "next/link";

const Sidebar = () => {
  return (
    <div
      style={{
        width: "200px",
        height: "100vh",
        backgroundColor: "#f8f9fa",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        boxShadow: "2px 0 4px rgba(0, 0, 0, 0.1)",
      }}
    >
      <h2 style={{ marginBottom: "24px", color: "#3b82f6" }}>My App</h2>
      <nav>
        <Link href="/upload">
          <a
            style={{
              display: "block",
              padding: "12px",
              marginBottom: "8px",
              borderRadius: "4px",
              textDecoration: "none",
              color: "#333",
              backgroundColor: "#e0f2fe",
              textAlign: "center",
            }}
          >
            Upload
          </a>
        </Link>
        <Link href="/connect">
          <a
            style={{
              display: "block",
              padding: "12px",
              marginBottom: "8px",
              borderRadius: "4px",
              textDecoration: "none",
              color: "#333",
              backgroundColor: "#e0f2fe",
              textAlign: "center",
            }}
          >
            Connect
          </a>
        </Link>
      </nav>
    </div>
  );
};

export default Sidebar;
