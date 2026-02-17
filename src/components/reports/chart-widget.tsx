"use client"
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

const COLORS = ["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ef4444", "#06b6d4"]

interface ChartWidgetProps {
  type: "bar" | "line" | "pie" | "area"
  data: any[]
  dataKey: string
  nameKey: string
  height?: number
}

export function ChartWidget({ type, data, dataKey, nameKey, height = 300 }: ChartWidgetProps) {
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">No data available</div>
  }

  if (type === "pie") {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie data={data} dataKey={dataKey} nameKey={nameKey} cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`}>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    )
  }

  if (type === "area") {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey={nameKey} className="text-xs" />
          <YAxis className="text-xs" />
          <Tooltip />
          <Area type="monotone" dataKey={dataKey} stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} />
        </AreaChart>
      </ResponsiveContainer>
    )
  }

  if (type === "line") {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey={nameKey} className="text-xs" />
          <YAxis className="text-xs" />
          <Tooltip />
          <Line type="monotone" dataKey={dataKey} stroke="#6366f1" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey={nameKey} className="text-xs" />
        <YAxis className="text-xs" />
        <Tooltip />
        <Bar dataKey={dataKey} radius={[4, 4, 0, 0]}>
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
