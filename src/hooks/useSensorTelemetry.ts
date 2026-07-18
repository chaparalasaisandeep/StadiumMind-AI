import { useState, useEffect, useCallback } from "react";
import { AppNotification } from "../types";

export interface SensorItem {
  id: string;
  name: string;
  type: "turnstile" | "camera" | "environmental" | "power" | "water";
  status: "online" | "warning" | "offline" | "calibrating";
  zone: string;
  value: string;
  lastActive: string;
  battery: number;
}

export function useSensorTelemetry(onNewNotification?: (notif: AppNotification) => void) {
  const [sensors, setSensors] = useState<SensorItem[]>([
    { id: "SEN-01", name: "Gate A Turnstile Tracker", type: "turnstile", status: "online", zone: "Zone A North", value: "128 scans/min", lastActive: "Just now", battery: 94 },
    { id: "SEN-02", name: "AI Concourse Cam 104", type: "camera", status: "online", zone: "Sector 100", value: "88% clarity (High density)", lastActive: "Just now", battery: 100 },
    { id: "SEN-03", name: "Ambient Thermal Sensor West", type: "environmental", status: "online", zone: "Zone B West", value: "74°F / 45% RH", lastActive: "2m ago", battery: 85 },
    { id: "SEN-04", name: "Solar Microgrid Inverter 3", type: "power", status: "online", zone: "Roof Deck", value: "14.2 kW active generation", lastActive: "Just now", battery: 100 },
    { id: "SEN-05", name: "Gate C Scanner Array", type: "turnstile", status: "warning", zone: "Gate C Ingress", value: "Intermittent laser sync issues", lastActive: "1m ago", battery: 42 },
    { id: "SEN-06", name: "Reclaimed Water Pipe Sensor", type: "water", status: "online", zone: "Outer Ring Systems", value: "8.4 L/s Flow Rate", lastActive: "5m ago", battery: 78 },
    { id: "SEN-07", name: "Concourse Mist Cooler North", type: "environmental", status: "offline", zone: "Zone A North", value: "Mister head pressure failure", lastActive: "15m ago", battery: 0 },
    { id: "SEN-08", name: "VIP Deck AI Face Camera", type: "camera", status: "online", zone: "Suite Level East", value: "No active congestion", lastActive: "Just now", battery: 98 },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<string | null>(null);
  const [selectedSensor, setSelectedSensor] = useState<SensorItem | null>(null);

  // Auto-fluctuate values slightly to look highly interactive & realistic
  useEffect(() => {
    const interval = setInterval(() => {
      setSensors((prev) =>
        prev.map((s) => {
          if (s.status !== "online") return s;
          if (s.type === "turnstile") {
            const currentVal = parseInt(s.value);
            const change = Math.floor(Math.random() * 15) - 7;
            const newVal = Math.max(20, currentVal + change);
            return { ...s, value: `${newVal} scans/min`, lastActive: "Just now" };
          }
          if (s.type === "power") {
            const currentVal = parseFloat(s.value);
            const change = (Math.random() * 0.8) - 0.4;
            const newVal = Math.max(1.0, currentVal + change).toFixed(1);
            return { ...s, value: `${newVal} kW active generation`, lastActive: "Just now" };
          }
          return s;
        })
      );
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  const handleRunDiagnostics = useCallback(() => {
    setIsDiagnosing(true);
    setDiagnosticResult(null);
    setTimeout(() => {
      setIsDiagnosing(false);
      const offlineCount = sensors.filter(s => s.status === "offline").length;
      const warningCount = sensors.filter(s => s.status === "warning").length;
      setDiagnosticResult(
        `All active nodes query complete. Total monitored: ${sensors.length}. Online: ${sensors.length - offlineCount - warningCount}. Warnings flagged: ${warningCount}. Fatal faults: ${offlineCount}. Routing telemetry to stadium operations center.`
      );
    }, 2000);
  }, [sensors]);

  const handleRecalibrate = useCallback((sensorId: string) => {
    setSensors((prev) =>
      prev.map((s) => {
        if (s.id === sensorId) {
          return {
            ...s,
            status: "online",
            value: s.type === "turnstile" 
              ? "120 scans/min" 
              : s.type === "environmental" 
                ? "72°F / 40% RH" 
                : s.type === "power" 
                  ? "12.0 kW active generation" 
                  : "Nominal operational value",
            battery: Math.max(s.battery, 80),
            lastActive: "Just now"
          };
        }
        return s;
      })
    );

    const target = sensors.find(s => s.id === sensorId);
    if (target && onNewNotification) {
      onNewNotification({
        id: `notif-recal-${Date.now()}`,
        type: "crowd",
        message: `Sensor Recalibration Complete: ${target.name} (${target.id}) at ${target.zone} successfully reset and online.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        isRead: false
      });
    }

    if (selectedSensor?.id === sensorId) {
      setSelectedSensor((prev) => prev ? { ...prev, status: "online", battery: Math.max(prev.battery, 80) } : null);
    }
  }, [sensors, onNewNotification, selectedSensor?.id]);

  const handleSimulateMalfunction = useCallback((sensorId: string) => {
    setSensors((prev) =>
      prev.map((s) => {
        if (s.id === sensorId) {
          return {
            ...s,
            status: "offline",
            value: "Lost data connection stream",
            battery: 0,
            lastActive: "Disconnected"
          };
        }
        return s;
      })
    );

    const target = sensors.find(s => s.id === sensorId);
    if (target && onNewNotification) {
      onNewNotification({
        id: `notif-malf-${Date.now()}`,
        type: "emergency",
        message: `CRITICAL FAULT DETECTED: ${target.name} (${target.id}) in ${target.zone} reported fatal error and dropped offline!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        isRead: false
      });
    }

    if (selectedSensor?.id === sensorId) {
      setSelectedSensor((prev) => prev ? { ...prev, status: "offline", battery: 0 } : null);
    }
  }, [sensors, onNewNotification, selectedSensor?.id]);

  const filteredSensors = sensors.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.zone.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || s.type === filterType;
    const matchesStatus = filterStatus === "all" || s.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const onlineCount = sensors.filter(s => s.status === "online").length;
  const warningCount = sensors.filter(s => s.status === "warning").length;
  const offlineCount = sensors.filter(s => s.status === "offline").length;

  return {
    sensors,
    searchQuery,
    setSearchQuery,
    filterType,
    setFilterType,
    filterStatus,
    setFilterStatus,
    isDiagnosing,
    diagnosticResult,
    selectedSensor,
    setSelectedSensor,
    handleRunDiagnostics,
    handleRecalibrate,
    handleSimulateMalfunction,
    filteredSensors,
    onlineCount,
    warningCount,
    offlineCount
  };
}
