const fs = require('fs');
let content = fs.readFileSync('src/components/DashboardSidebar.tsx', 'utf8');

content = content.replace(
  'import { Tv2, LayoutDashboard, Activity, ShieldCheck, LogOut, Sparkles } from "lucide-react";',
  'import { Tv2, LayoutDashboard, Activity, ShieldCheck, LogOut, Sparkles } from "lucide-react";\nimport { useAuth } from "../contexts/AuthContext";'
);

content = content.replace(
  'export default function DashboardSidebar({ activeConsole, setActiveConsole, onLogout }: DashboardSidebarProps) {',
  `export default function DashboardSidebar({ activeConsole, setActiveConsole, onLogout }: DashboardSidebarProps) {
  const { user } = useAuth();
  const currentRole = user?.role || "Fan";`
);

content = content.replace('    }      <aside', '      <aside');

fs.writeFileSync('src/components/DashboardSidebar.tsx', content);
