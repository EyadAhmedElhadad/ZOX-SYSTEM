'use client';
import React, { useState } from 'react';
import { Building2, Tag, Bell, Shield, Save, User } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { loadSettings, saveSettings } from '@/data/settings';
import type { Settings } from '@/data/settings';
import { useAuth } from '@/contexts/AuthContext';

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${
        checked ? 'bg-primary' : 'bg-muted border border-border'
      }`}
    >
      <span
        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-200 ${
          checked ? 'left-[22px]' : 'left-0.5'
        }`}
      />
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-foreground mb-1.5">{label}</label>
      {children}
    </div>
  );
}

export default function SettingsContent() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<Settings>(() => loadSettings());

  const set = <K extends keyof Settings>(key: K, value: Settings[K]) =>
    setSettings((prev) => ({ ...prev, [key]: value }));

  const handleSave = () => {
    saveSettings(settings);
    toast.success('Settings saved');
  };

  return (
    <div className="p-4 lg:p-6 xl:p-8 max-w-screen-2xl mx-auto space-y-6">
      <Toaster position="bottom-right" theme="system" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Configure your center, pricing, and preferences
          </p>
        </div>
        <button
          onClick={handleSave}
          className="btn-primary flex items-center gap-2 h-9 self-start sm:self-auto"
        >
          <Save size={14} />
          Save Settings
        </button>
      </div>

      {/* Center Info */}
      <div className="card-base p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Building2 size={15} className="text-primary" />
          </div>
          <h2 className="text-base font-semibold text-foreground">Center Info</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Center name">
            <input
              value={settings.centerName}
              onChange={(e) => set('centerName', e.target.value)}
              placeholder="Zoox PlayStation Center"
              className="input-field"
            />
          </Field>
          <Field label="Phone">
            <input
              value={settings.centerPhone}
              onChange={(e) => set('centerPhone', e.target.value)}
              placeholder="+20 100 000 0000"
              className="input-field"
            />
          </Field>
          <div className="md:col-span-2">
            <Field label="Address">
              <input
                value={settings.centerAddress}
                onChange={(e) => set('centerAddress', e.target.value)}
                placeholder="Center address"
                className="input-field"
              />
            </Field>
          </div>
          <Field label="Currency">
            <input
              value={settings.currency}
              onChange={(e) => set('currency', e.target.value.toUpperCase())}
              placeholder="EGP"
              className="input-field"
            />
          </Field>
        </div>
      </div>

      {/* Pricing */}
      <div className="card-base p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
            <Tag size={15} className="text-accent" />
          </div>
          <h2 className="text-base font-semibold text-foreground">Pricing</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Field label="Standard hourly">
            <input
              type="number"
              min="0"
              value={settings.standardHourly}
              onChange={(e) => set('standardHourly', Number(e.target.value) || 0)}
              className="input-field"
            />
          </Field>
          <Field label="Premium hourly">
            <input
              type="number"
              min="0"
              value={settings.premiumHourly}
              onChange={(e) => set('premiumHourly', Number(e.target.value) || 0)}
              className="input-field"
            />
          </Field>
          <Field label="VIP hourly">
            <input
              type="number"
              min="0"
              value={settings.vipHourly}
              onChange={(e) => set('vipHourly', Number(e.target.value) || 0)}
              className="input-field"
            />
          </Field>
          <Field label={`Tax rate (%)`}>
            <input
              type="number"
              min="0"
              max="100"
              value={settings.taxRate}
              onChange={(e) => set('taxRate', Number(e.target.value) || 0)}
              className="input-field"
            />
          </Field>
        </div>
      </div>

      {/* Alerts */}
      <div className="card-base p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-warning/10 border border-warning/20 flex items-center justify-center">
            <Bell size={15} className="text-warning" />
          </div>
          <h2 className="text-base font-semibold text-foreground">Alerts & Notifications</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <Field label="Low stock threshold">
            <input
              type="number"
              min="0"
              value={settings.lowStockThreshold}
              onChange={(e) => set('lowStockThreshold', Number(e.target.value) || 0)}
              className="input-field"
            />
          </Field>
          <Field label="Session timeout (minutes)">
            <input
              type="number"
              min="0"
              value={settings.sessionTimeoutMinutes}
              onChange={(e) => set('sessionTimeoutMinutes', Number(e.target.value) || 0)}
              className="input-field"
            />
          </Field>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-t border-border/60">
            <div>
              <p className="text-sm font-semibold text-foreground">Notifications</p>
              <p className="text-xs text-muted-foreground">Show in-app notifications</p>
            </div>
            <Toggle
              checked={settings.notificationsEnabled}
              onChange={(v) => set('notificationsEnabled', v)}
            />
          </div>
          <div className="flex items-center justify-between py-2 border-t border-border/60">
            <div>
              <p className="text-sm font-semibold text-foreground">Sound</p>
              <p className="text-xs text-muted-foreground">Play sound cues for alerts</p>
            </div>
            <Toggle checked={settings.soundEnabled} onChange={(v) => set('soundEnabled', v)} />
          </div>
        </div>
      </div>

      {/* System */}
      <div className="card-base p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-danger/10 border border-danger/20 flex items-center justify-center">
            <Shield size={15} className="text-danger" />
          </div>
          <h2 className="text-base font-semibold text-foreground">System</h2>
        </div>
        <div className="flex items-center justify-between py-2 border-t border-border/60">
          <div>
            <p className="text-sm font-semibold text-foreground">Maintenance mode</p>
            <p className="text-xs text-muted-foreground">
              Temporarily disable staff & customer operations
            </p>
          </div>
          <Toggle checked={settings.maintenanceMode} onChange={(v) => set('maintenanceMode', v)} />
        </div>
        {settings.maintenanceMode && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-warning/10 border border-warning/20 px-3 py-2.5">
            <Shield size={15} className="text-warning flex-shrink-0" />
            <p className="text-xs font-semibold text-warning">
              Maintenance mode is ON — system operations are currently limited.
            </p>
          </div>
        )}
      </div>

      {/* Save footer */}
      <div className="card-base p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <User size={14} className="text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              Changes saved by {user?.name ?? 'Owner'}
            </p>
            <p className="text-xs text-muted-foreground">
              Latest changes persist automatically in this browser
            </p>
          </div>
        </div>
        <button
          onClick={handleSave}
          className="btn-primary flex items-center gap-2 h-10 justify-center"
        >
          <Save size={14} />
          Save Settings
        </button>
      </div>
    </div>
  );
}
