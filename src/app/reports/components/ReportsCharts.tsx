'use client';
import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

const CATEGORY_COLORS = ['#7c3aed', '#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

const tooltipStyle = {
  background: '#13111f',
  border: '1px solid #2a2640',
  borderRadius: 8,
  fontSize: 12,
};

interface ReportsChartsProps {
  rangeLabel: string;
  revenueData: { date: string; revenue: number }[];
  categoryData: { name: string; value: number }[];
  sessionData: { roomType: string; sessions: number }[];
}

export default function ReportsCharts({
  rangeLabel,
  revenueData,
  categoryData,
  sessionData,
}: ReportsChartsProps) {
  return (
    <>
      {/* Revenue + Category pie */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 card-base p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUpIcon />
            <h2 className="text-base font-semibold text-foreground">
              Revenue Trend ({rangeLabel})
            </h2>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2640" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#8b85a0"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis stroke="#8b85a0" fontSize={11} tickLine={false} axisLine={false} width={50} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#7c3aed"
                strokeWidth={2}
                fill="url(#revenueGradient)"
                name="Revenue"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card-base p-5">
          <div className="flex items-center gap-2 mb-4">
            <WalletIcon />
            <h2 className="text-base font-semibold text-foreground">Sales by Category</h2>
          </div>
          {categoryData.length === 0 ? (
            <div className="flex items-center justify-center h-[260px] text-sm text-muted-foreground">
              No sales in this period
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  stroke="#13111f"
                >
                  {categoryData.map((entry, index) => (
                    <Cell
                      key={`cell-${entry.name}`}
                      fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12, color: '#8b85a0' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Sessions */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 card-base p-5">
          <div className="flex items-center gap-2 mb-4">
            <MonitorIcon />
            <h2 className="text-base font-semibold text-foreground">Sessions by Room Type</h2>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={sessionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2640" vertical={false} />
              <XAxis
                dataKey="roomType"
                stroke="#8b85a0"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#8b85a0"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                width={40}
                allowDecimals={false}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="sessions" name="Sessions" radius={[6, 6, 0, 0]}>
                {sessionData.map((entry, index) => (
                  <Cell
                    key={`cell-${entry.roomType}`}
                    fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}

function TrendingUpIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-primary"
    >
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}

function WalletIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-accent"
    >
      <path d="M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
      <path d="M21 12a2 2 0 0 0-2-2h-4a2 2 0 0 0 0 4h4a2 2 0 0 0 2-2z" />
    </svg>
  );
}

function MonitorIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-info"
    >
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}
