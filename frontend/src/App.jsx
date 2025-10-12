/*import { useState } from 'react'b */
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import React, { useState } from "react";
import "./App.css";

const menuItems = [
  { name: "Dashboard", path: "/" },
  { name: "Procurement & Tenders", path: "/Procurement & Tenders" },
  { name: "Purchase Requests", path: "/Purchase Requests" },
  { name: "Payments", path: "/Payments" }, 
  { name: "Revenue & Recoveries", path: "/Revenue & Recoveries" }
];

function App() {
  const [active, setActive] = useState(menuItems[0].name);

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar Menu */}
      <nav style={{ width: 300, background: "#4e2d58ff", color: "#fff", padding: 20 }}>
        <h5>Main Nagivation</h5>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {menuItems.map(item => (
            <li
              key={item.name}
              style={{
                padding: "10px 0",
                cursor: "pointer",
                fontWeight: active === item.name ? "bold" : "normal",
              }}
              onClick={() => setActive(item.name)}
            >
              {item.name}
            </li>
          ))}
        </ul>
      </nav>

      {/* Main Content */}
      <div style={{ flex: 1, padding: 30 }}>
        {/* Breadcrumb */}
        <div style={{ marginBottom: 20, color: "#888" }}>
          App &gt; {active}
        </div>
        <h1>{active}</h1>
        <p>Welcome to the {active} section of your app.</p>
      </div>
    </div>
  );
}

export default App;
