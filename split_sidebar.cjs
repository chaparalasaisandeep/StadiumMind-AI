const fs = require('fs');
let content = fs.readFileSync('src/pages/DashboardPage.tsx', 'utf8');

const sidebarRegex = /\{\/\* LEFT SIDEBAR: Navigation Console \*\/\}\n\s*<aside[\s\S]*?<\/aside>/;
const match = content.match(sidebarRegex);

if (match) {
  const sidebarJSX = match[0];
  const newSidebarComponent = `import React from "react";
import { Tv2, LayoutDashboard, Activity, ShieldCheck, LogOut } from "lucide-react";
import RoleSelector from "./RoleSelector";

interface DashboardSidebarProps {
  activeConsole: "operations" | "telemetry" | "logistics";
  setActiveConsole: (val: "operations" | "telemetry" | "logistics") => void;
  onLogout: () => void;
}

export default function DashboardSidebar({ activeConsole, setActiveConsole, onLogout }: DashboardSidebarProps) {
  return (
    ${sidebarJSX.replace(/<RoleSelector \/>/g, '<RoleSelector />')}
  );
}
`;

  fs.writeFileSync('src/components/DashboardSidebar.tsx', newSidebarComponent);
  
  content = content.replace(sidebarJSX, `<DashboardSidebar activeConsole={activeConsole} setActiveConsole={setActiveConsole} onLogout={onLogout} />`);
  content = `import DashboardSidebar from "../components/DashboardSidebar";\n` + content;
  fs.writeFileSync('src/pages/DashboardPage.tsx', content);
  console.log("Successfully extracted DashboardSidebar");
} else {
  console.log("Failed to match sidebar");
}
