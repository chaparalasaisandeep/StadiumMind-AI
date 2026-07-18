import React from "react";
import { UserRole } from "../types";
import { 
  Users, 
  HeartHandshake, 
  LayoutDashboard, 
  ShieldAlert, 
  Stethoscope, 
  Bus, 
  Settings, 
  Accessibility 
} from "lucide-react";

interface RoleSelectorProps {
  currentRole: UserRole;
  onChangeRole: (role: UserRole) => void;
}

const ROLES_META: { role: UserRole; label: string; icon: any; color: string; desc: string }[] = [
  {
    role: "Fan",
    label: "Fan Experience",
    icon: Users,
    color: "from-blue-500/20 to-sky-500/10 border-blue-500/30 text-blue-400",
    desc: "Interactive maps, queue wait times, restroom cleanliness, schedules, and AI Guest Guide."
  },
  {
    role: "Volunteer",
    label: "Volunteer Desk",
    icon: HeartHandshake,
    color: "from-teal-500/20 to-emerald-500/10 border-teal-500/30 text-teal-400",
    desc: "Task dispatcher, crowd logs, active missions, and hydration unit checks."
  },
  {
    role: "Organizer",
    label: "Tournament Organizers",
    icon: LayoutDashboard,
    color: "from-purple-500/20 to-pink-500/10 border-purple-500/30 text-purple-400",
    desc: "Global dashboard, dynamic timelines, concession overview, and high-thinking simulation advisory."
  },
  {
    role: "Security",
    label: "Stadium Security",
    icon: ShieldAlert,
    color: "from-red-500/20 to-orange-500/10 border-red-500/30 text-red-400",
    desc: "Incident logger, sector pressures, gate flows, camera simulation, and smart threat advisor."
  },
  {
    role: "Medical",
    label: "Medical / Triage",
    icon: Stethoscope,
    color: "from-rose-500/20 to-pink-500/10 border-rose-500/30 text-rose-400",
    desc: "Triage unit status, dispatch queue, emergency coordinates, and medical hub locator."
  },
  {
    role: "Transport",
    label: "Transit & Logistics",
    icon: Bus,
    color: "from-amber-500/20 to-yellow-500/10 border-amber-500/30 text-amber-400",
    desc: "Shuttle schedules, parking lots load, central rail updates, and route optimization maps."
  },
  {
    role: "Admin",
    label: "System Admin",
    icon: Settings,
    color: "from-slate-500/20 to-zinc-500/10 border-slate-500/30 text-slate-300",
    desc: "Core server health status, API key secrets, and role permission settings."
  },
  {
    role: "Accessibility",
    label: "Accessibility Suite",
    icon: Accessibility,
    color: "from-indigo-500/20 to-violet-500/10 border-indigo-500/30 text-indigo-400",
    desc: "Ramp status, audio guides, elevator monitors, and wheelchair escort services."
  }
];

export const RoleSelector = React.memo(function RoleSelector({ currentRole, onChangeRole }: RoleSelectorProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-white flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5 text-[#6EB8E1]" />
            Multi-Role Operational Environment
          </h2>
          <p className="text-xs text-slate-400">
            Select a target system role to interact with role-specific views and permission structures.
          </p>
        </div>
        <div className="mt-2 md:mt-0 px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-[10px] font-mono text-slate-300">
          STAD_OS // SECTOR_ACTIVE
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {ROLES_META.map((meta) => {
          const IconComponent = meta.icon;
          const isActive = currentRole === meta.role;

          return (
            <button
              key={meta.role}
              id={`role-btn-${meta.role.toLowerCase()}`}
              onClick={() => onChangeRole(meta.role)}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all duration-300 group cursor-pointer ${
                isActive
                  ? `bg-gradient-to-br ${meta.color} shadow-lg ring-1 ring-[#6EB8E1]`
                  : "bg-slate-800/40 hover:bg-slate-800 border-slate-800/80 text-slate-400 hover:text-slate-200"
              }`}
            >
              <div className={`p-2 rounded-lg mb-2 transition-transform duration-300 group-hover:scale-110 ${
                isActive ? "bg-slate-900/60" : "bg-slate-800"
              }`}>
                <IconComponent className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold tracking-tight">{meta.role}</span>
            </button>
          );
        })}
      </div>

      {/* Selected Role Description Banner */}
      <div className="mt-4 p-3 bg-slate-950/60 border border-slate-800/50 rounded-xl flex items-start gap-3">
        {(() => {
          const activeMeta = ROLES_META.find((m) => m.role === currentRole)!;
          const Icon = activeMeta.icon;
          return (
            <>
              <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200">
                <Icon className="h-4 w-4 text-[#6EB8E1]" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white">{activeMeta.label} System Mode</h4>
                <p className="text-xs text-slate-400 mt-0.5">{activeMeta.desc}</p>
              </div>
            </>
          );
        })()}
      </div>
    </div>
  );
});

export default RoleSelector;
