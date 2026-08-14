'use client';
import React, { useState, useMemo } from 'react';
import { Wallet, Monitor, Star, Receipt, TrendingUp } from 'lucide-react';
import { loadSales } from '@/data/sales';
import { loadFeedback } from '@/data/feedback';
import { loadExpenses } from '@/data/expenses';
import { initialSessions } from '@/data/sessions';
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

type RangeKey = '7d' | '30d' | 'all';

const rangeOptions: { id: RangeKey; label: string }[] = [
  { id: '7d', label: 'Last 7 days' },
  { id: '30d', label: 'Last 30 days' },
  { id: 'all', label: 'All time' },
];

const SEED_REVENUE = [1800, 2300, 1500, 2900, 3200, 2700, 2840];
const CATEGORY_COLORS = ['#7c3aed', '#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

const tooltipStyle = {
  background: '#13111f',
  border: '1px solid #2a2640',
  borderRadius: 8,
  fontSize: 12,
};

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;
}

export default function ReportsContent() {
  const [range, setRange] = useState<RangeKey>('7d');

  const sales = useMemo(() => loadSales(), []);
  const feedback = useMemo(() => loadFeedback(), []);
  const expenses = useMemo(() => loadExpenses(), []);

  const filteredSales = useMemo(() => {
    if (range === 'all') return sales;
    const days = range === '7d' ? 7 : 30;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - (days - 1));
    cutoff.setHours(0, 0, 0, 0);
    return sales.filter((s) => {
      const [y, m, d] = s.date.split('-').map(Number);
      return new Date(y, m - 1, d) >= cutoff;
    });
  }, [sales, range]);

  const revenue = filteredSales.reduce((sum, s) => sum + s.total, 0);
  const expenseTotal = expenses.reduce((sum, e) => sum + e.amount, 0);
  const sessionCount = initialSessions.length;
  const avgRating = feedback.length
    ? feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length
    : 0;

  const revenueData = useMemo(() => {
    const salesByDate = new Map<string, number>();
    filteredSales.forEach((s) => {
      salesByDate.set(s.date, (salesByDate.get(s.date) ?? 0) + s.total);
    });
    if (range === 'all') {
      return Array.from(salesByDate.keys())
        .sort()
        .map((d) => ({ date: d.slice(5), revenue: Math.round(salesByDate.get(d) ?? 0) }));
    }
    const days = range === '7d' ? 7 : 30;
    const out: { date: string; revenue: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = dateKey(d);
      const actual = salesByDate.get(key);
      const seedIdx = (days - 1 - i) % SEED_REVENUE.length;
      out.push({
        date: `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`,
        revenue: actual !== undefined ? Math.round(actual) : SEED_REVENUE[seedIdx],
      });
    }
    return out;
  }, [filteredSales, range]);

  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredSales.forEach((s) => {
      s.items.forEach((item) => {
        counts[item.category] = (counts[item.category] ?? 0) + item.price * item.qty;
      });
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value: Math.round(value) }))
      .sort((a, b) => b.value - a.value);
  }, [filteredSales]);

  const sessionData = useMemo(
    () =>
      (['Standard', 'Premium', 'VIP'] as const).map((roomType) => ({
        roomType,
        sessions: initialSessions.filter((s) => s.roomType === roomType).length,
      })),
    []
  );

  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: feedback.filter((f) => f.rating === star).length,
  }));

  return (
    <div className="p-4 lg:p-6 xl:p-8 max-w-screen-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Business analytics and performance overview
          </p>
        </div>
        <select
          value={range}
          onChange={(e) => setRange(e.target.value as RangeKey)}
          className="input-field !w-auto px-3 py-2 text-sm"
        >
          {rangeOptions.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-base p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
              <Wallet size={18} className="text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Revenue</p>
              <p className="text-lg font-bold text-foreground font-tabular">
                {revenue.toLocaleString()} EGP
              </p>
            </div>
          </div>
        </div>
        <div className="card-base p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Monitor size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Active Sessions</p>
              <p className="text-lg font-bold text-foreground font-tabular">{sessionCount}</p>
            </div>
          </div>
        </div>
        <div className="card-base p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-warning/10 border border-warning/20 flex items-center justify-center">
              <Star size={18} className="text-warning fill-warning" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Avg Rating</p>
              <p className="text-lg font-bold text-foreground font-tabular">
                {avgRating.toFixed(1)}
                <span className="text-xs font-semibold text-muted-foreground"> / 5</span>
              </p>
            </div>
          </div>
        </div>
        <div className="card-base p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-danger/10 border border-danger/20 flex items-center justify-center">
              <Receipt size={18} className="text-danger" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Expenses</p>
              <p className="text-lg font-bold text-foreground font-tabular">
                {expenseTotal.toLocaleString()} EGP
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue + Category pie */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 card-base p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-primary" />
            <h2 className="text-base font-semibold text-foreground">
              Revenue Trend ({rangeOptions.find((r) => r.id === range)?.label})
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
            <Wallet size={16} className="text-accent" />
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

      {/* Sessions + Feedback */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 card-base p-5">
          <div className="flex items-center gap-2 mb-4">
            <Monitor size={16} className="text-info" />
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

        <div className="card-base p-5">
          <div className="flex items-center gap-2 mb-4">
            <Star size={16} className="text-warning fill-warning" />
            <h2 className="text-base font-semibold text-foreground">Customer Feedback</h2>
          </div>
          <div className="text-center mb-5">
            <p className="text-4xl font-bold text-foreground font-tabular">
              {avgRating.toFixed(1)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              average of {feedback.length} reviews
            </p>
          </div>
          <div className="space-y-2.5">
            {distribution.map((d) => (
              <div key={`dist-${d.star}`} className="flex items-center gap-3">
                <span className="w-8 text-sm font-semibold font-tabular text-foreground">
                  {d.star}★
                </span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      d.star >= 4 ? 'bg-accent' : d.star === 3 ? 'bg-warning' : 'bg-danger'
                    }`}
                    style={{ width: `${feedback.length ? (d.count / feedback.length) * 100 : 0}%` }}
                  />
                </div>
                <span className="w-6 text-right text-sm text-muted-foreground font-tabular">
                  {d.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
