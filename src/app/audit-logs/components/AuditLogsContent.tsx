'use client';
import React, { useState, useEffect } from 'react';
import {
  ScrollText,
  Info,
  AlertTriangle,
  ShieldAlert,
  Search,
  Trash2,
  RefreshCw,
  Inbox,
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { loadAuditLogs, saveAuditLogs } from '@/data/auditLogs';
import type { AuditLogEntry } from '@/data/auditLogs';

type SeverityFilter = 'All' | 'Info' | 'Warning' | 'Critical';

const severityFilters: SeverityFilter[] = ['All', 'Info', 'Warning', 'Critical'];

const severityStyles: Record<AuditLogEntry['severity'], string> = {
  Info: 'bg-info/10 text-info border border-info/20',
  Warning: 'bg-warning/10 text-warning border border-warning/20',
  Critical: 'bg-danger/10 text-danger border border-danger/20',
};

export default function AuditLogsContent() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [clearOpen, setClearOpen] = useState(false);

  const refresh = () => {
    setLogs(loadAuditLogs());
    setLoaded(true);
  };

  useEffect(() => {
    refresh();
  }, []);

  const filtered = logs.filter((log) => {
    const matchesSeverity = severityFilter === 'All' || log.severity === severityFilter;
    const matchesSearch =
      !searchQuery ||
      log.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.target.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSeverity && matchesSearch;
  });

  const infoCount = logs.filter((l) => l.severity === 'Info').length;
  const warningCount = logs.filter((l) => l.severity === 'Warning').length;
  const criticalCount = logs.filter((l) => l.severity === 'Critical').length;

  const handleClear = () => {
    saveAuditLogs([]);
    setLogs([]);
    setClearOpen(false);
    toast.success('Audit logs cleared');
  };

  return (
    <div className="p-4 lg:p-6 xl:p-8 max-w-screen-2xl mx-auto space-y-6">
      <Toaster position="bottom-right" theme="system" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Audit Logs</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Full history of system actions — refreshed automatically
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={refresh} className="btn-secondary flex items-center gap-2 h-9">
            <RefreshCw size={14} />
            Refresh
          </button>
          <button
            onClick={() => setClearOpen(true)}
            disabled={logs.length === 0}
            className="btn-danger flex items-center gap-2 h-9 bg-danger/10 hover:bg-danger/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 size={14} />
            Clear All
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-base p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <ScrollText size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Events</p>
              <p className="text-lg font-bold text-foreground font-tabular">{logs.length}</p>
            </div>
          </div>
        </div>
        <div className="card-base p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-info/10 border border-info/20 flex items-center justify-center">
              <Info size={18} className="text-info" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Info</p>
              <p className="text-lg font-bold text-info font-tabular">{infoCount}</p>
            </div>
          </div>
        </div>
        <div className="card-base p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-warning/10 border border-warning/20 flex items-center justify-center">
              <AlertTriangle size={18} className="text-warning" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Warnings</p>
              <p className="text-lg font-bold text-warning font-tabular">{warningCount}</p>
            </div>
          </div>
        </div>
        <div className="card-base p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-danger/10 border border-danger/20 flex items-center justify-center">
              <ShieldAlert size={18} className="text-danger" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Critical</p>
              <p className="text-lg font-bold text-danger font-tabular">{criticalCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by actor, action, or target..."
            className="input-field pl-9"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {severityFilters.map((s) => (
            <button
              key={s}
              onClick={() => setSeverityFilter(s)}
              className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-colors border ${
                severityFilter === s
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-muted-foreground border-border hover:text-foreground'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card-base overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Severity
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Actor
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Action
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Target
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody>
              {!loaded ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center text-muted-foreground">
                    Loading logs...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center text-muted-foreground">
                    <Inbox size={24} className="mx-auto mb-2 opacity-50" />
                    {logs.length === 0
                      ? 'No audit events yet. Clear all? Logs will reappear when actions occur.'
                      : 'No logs match your filters.'}
                  </td>
                </tr>
              ) : (
                filtered.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-border/60 last:border-0 hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-4 py-3 text-muted-foreground font-tabular whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`status-badge ${severityStyles[log.severity]}`}>
                        {log.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-muted border border-border flex items-center justify-center flex-shrink-0">
                          <span className="text-[10px] font-bold text-muted-foreground">
                            {log.actor
                              .split(' ')
                              .filter(Boolean)
                              .map((w) => w[0])
                              .slice(0, 2)
                              .join('')
                              .toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{log.actor}</p>
                          <p className="text-xs text-muted-foreground">{log.actorRole}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">{log.action}</td>
                    <td className="px-4 py-3 text-muted-foreground">{log.target}</td>
                    <td className="px-4 py-3 text-muted-foreground max-w-[300px]">{log.details}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Clear Confirm Modal */}
      {clearOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60" onClick={() => setClearOpen(false)} />
          <div className="relative w-full max-w-sm card-base p-6 fade-in">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-danger/10 border border-danger/20 mb-4 mx-auto">
              <Trash2 size={22} className="text-danger" />
            </div>
            <h2 className="text-lg font-bold text-foreground text-center mb-1">
              Clear all audit logs?
            </h2>
            <p className="text-sm text-muted-foreground text-center mb-5">
              All {logs.length} events will be permanently removed. This cannot be undone.
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setClearOpen(false)} className="btn-secondary flex-1 h-10">
                Cancel
              </button>
              <button
                onClick={handleClear}
                className="btn-danger flex-1 h-10 bg-danger/10 hover:bg-danger/20"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
