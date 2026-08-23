'use client';
import React, { useState } from 'react';
import {
  Users,
  Coins,
  Crown,
  Gift,
  Search,
  Plus,
  Minus,
  X,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { loyaltyApi, rewardsApi, customersApi, useAsyncData, toastApiError } from '@/lib/api';
import type { UiLoyaltyMember, UiReward } from '@/lib/api';

const tiers: UiLoyaltyMember['tier'][] = ['Bronze', 'Silver', 'Gold', 'VIP'];

const tierStyles: Record<UiLoyaltyMember['tier'], string> = {
  Bronze: 'bg-muted text-muted-foreground border border-border',
  Silver: 'bg-info/10 text-info border border-info/20',
  Gold: 'bg-warning/10 text-warning border border-warning/20',
  VIP: 'bg-primary/10 text-primary border border-primary/20',
};

const statusStyles: Record<UiLoyaltyMember['status'], string> = {
  Active: 'bg-accent/10 text-accent border border-accent/20',
  Inactive: 'bg-muted text-muted-foreground border border-border',
};

export default function LoyaltyContent() {
  const {
    data: memberData,
    loading,
    reload: reloadMembers,
  } = useAsyncData(() => loyaltyApi.listMembers(), []);
  const { data: rewardData, reload: reloadRewards } = useAsyncData(() => rewardsApi.list(), []);
  const members = memberData ?? [];
  const rewards = rewardData ?? [];
  const reload = () => {
    reloadMembers();
    reloadRewards();
  };
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<UiLoyaltyMember['tier'] | 'All'>('All');
  const [addOpen, setAddOpen] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', phone: '' });
  const [adjustTarget, setAdjustTarget] = useState<UiLoyaltyMember | null>(null);
  const [adjustDelta, setAdjustDelta] = useState('');
  const [redeemTarget, setRedeemTarget] = useState<UiReward | null>(null);
  const [redeemMemberId, setRedeemMemberId] = useState('');
  const [redeemed, setRedeemed] = useState<number>(() => {
    try {
      const raw = localStorage.getItem('zoox-loyalty-redeemed');
      return raw ? Number(raw) : 0;
    } catch {
      return 0;
    }
  });

  if (loading) {
    return <div className="glass-panel p-10 text-center text-muted-foreground">Loading…</div>;
  }

  const active = members.filter((m) => m.status === 'Active').length;
  const totalPoints = members.reduce((sum, m) => sum + m.points, 0);
  const vip = members.filter((m) => m.tier === 'VIP').length;

  const filtered = members.filter((m) => {
    const matchesSearch =
      !search ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.phone.toLowerCase().includes(search.toLowerCase());
    const matchesTier = tierFilter === 'All' || m.tier === tierFilter;
    return matchesSearch && matchesTier;
  });

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMember.name.trim() || !newMember.phone.trim()) {
      toast.error('Name and phone are required');
      return;
    }
    try {
      await customersApi.create({
        name: newMember.name.trim(),
        phone: newMember.phone.trim(),
      });
      setNewMember({ name: '', phone: '' });
      setAddOpen(false);
      toast.success(`${newMember.name} added to loyalty program`);
      reload();
    } catch (err) {
      toastApiError(err);
    }
  };

  const handleQuickAdjust = async (id: string, delta: number) => {
    try {
      await loyaltyApi.adjustPoints(id, delta);
      toast.success(`${delta > 0 ? '+' : ''}${delta} points`);
      reload();
    } catch (err) {
      toastApiError(err);
    }
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustTarget) return;
    const delta = Number(adjustDelta);
    if (!delta) {
      toast.error('Enter a point amount');
      return;
    }
    try {
      await loyaltyApi.adjustPoints(adjustTarget.id, delta);
      toast.success(`${delta > 0 ? '+' : ''}${delta} points for ${adjustTarget.name}`);
      setAdjustTarget(null);
      setAdjustDelta('');
      reload();
    } catch (err) {
      toastApiError(err);
    }
  };

  const handleToggleReward = async (reward: UiReward) => {
    try {
      await rewardsApi.update(reward.id, { enabled: !reward.enabled });
      toast.success(`${reward.name} ${reward.enabled ? 'disabled' : 'enabled'}`);
      reload();
    } catch (err) {
      toastApiError(err);
    }
  };

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!redeemTarget) return;
    if (!redeemMemberId) {
      toast.error('Select a member to redeem for');
      return;
    }
    const member = members.find((m) => m.id === redeemMemberId);
    if (!member) return;
    if (member.points < redeemTarget.cost) {
      toast.error(`${member.name} does not have enough points`);
      return;
    }
    try {
      await loyaltyApi.adjustPoints(member.id, -redeemTarget.cost);
      const value = redeemed + redeemTarget.cost;
      setRedeemed(value);
      try {
        localStorage.setItem('zoox-loyalty-redeemed', String(value));
      } catch {
        /* ignore */
      }
      toast.success(`Reward redeemed for ${member.name}`);
      setRedeemTarget(null);
      setRedeemMemberId('');
      reload();
    } catch (err) {
      toastApiError(err);
    }
  };

  return (
    <div className="p-4 lg:p-6 xl:p-8 max-w-screen-2xl mx-auto space-y-6">
      <Toaster position="bottom-right" theme="system" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Loyalty</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {members.length} members — manage points, tiers, and rewards
          </p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="btn-primary flex items-center gap-2 h-9 self-start"
        >
          <Plus size={14} />
          Add Member
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-base p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
              <Users size={18} className="text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Active Members</p>
              <p className="text-lg font-bold text-foreground font-tabular">{active}</p>
            </div>
          </div>
        </div>
        <div className="card-base p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-warning/10 border border-warning/20 flex items-center justify-center">
              <Coins size={18} className="text-warning" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Points Issued</p>
              <p className="text-lg font-bold text-foreground font-tabular">
                {totalPoints.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="card-base p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Crown size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">VIP Members</p>
              <p className="text-lg font-bold text-foreground font-tabular">{vip}</p>
            </div>
          </div>
        </div>
        <div className="card-base p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-info/10 border border-info/20 flex items-center justify-center">
              <Gift size={18} className="text-info" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Points Redeemed</p>
              <p className="text-lg font-bold text-foreground font-tabular">
                {redeemed.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Members section */}
      <div className="card-base p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4">
          <h2 className="text-base font-semibold text-foreground">Members</h2>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="relative flex-1 min-w-[220px]">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or phone..."
                className="input-field pl-9 h-9 text-sm"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setTierFilter('All')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-150 ${
                  tierFilter === 'All'
                    ? 'bg-primary/10 border-primary/30 text-primary'
                    : 'bg-muted border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                All
              </button>
              {tiers.map((t) => (
                <button
                  key={t}
                  onClick={() => setTierFilter(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-150 ${
                    tierFilter === t
                      ? 'bg-primary/10 border-primary/30 text-primary'
                      : 'bg-muted border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center gap-3 py-12">
            <div className="w-12 h-12 rounded-2xl bg-muted border border-border flex items-center justify-center">
              <Users size={22} className="text-muted-foreground" />
            </div>
            <p className="text-sm font-semibold text-foreground">No members found</p>
            <p className="text-xs text-muted-foreground max-w-xs">
              Try a different search or add a new member to the loyalty program.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Member
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Tier
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Points
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Visits
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((member) => (
                  <tr
                    key={member.id}
                    className="border-b border-border/60 last:border-0 hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-primary">
                            {member.name
                              .split(' ')
                              .filter(Boolean)
                              .map((w) => w[0])
                              .slice(0, 2)
                              .join('')
                              .toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground truncate">{member.name}</p>
                          <p className="text-xs text-muted-foreground font-tabular">
                            {member.phone}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`status-badge ${tierStyles[member.tier]}`}>
                        {member.tier}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-tabular font-semibold text-foreground">
                      {member.points.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right font-tabular text-muted-foreground">
                      {member.visits}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`status-badge ${statusStyles[member.status]}`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleQuickAdjust(member.id, 100)}
                          className="btn-success flex items-center gap-1 h-8 px-2.5"
                        >
                          <Plus size={13} />
                          100
                        </button>
                        <button
                          onClick={() => handleQuickAdjust(member.id, -50)}
                          className="btn-secondary flex items-center gap-1 h-8 px-2.5"
                        >
                          <Minus size={13} />
                          50
                        </button>
                        <button
                          onClick={() => {
                            setAdjustTarget(member);
                            setAdjustDelta('');
                          }}
                          className="btn-secondary flex items-center gap-1 h-8 px-2.5"
                          title="Adjust points"
                        >
                          <SlidersHorizontal size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Rewards section */}
      <div className="card-base p-5">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-foreground">Rewards Catalog</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {rewards.length} rewards — redeem member points for perks
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {rewards.map((reward) => (
            <div
              key={reward.id}
              className={`card-base p-4 flex flex-col ${reward.enabled ? '' : 'opacity-60'}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-xl">
                  {reward.emoji}
                </div>
                <span
                  className={`status-badge ${
                    reward.enabled
                      ? 'bg-accent/10 text-accent border border-accent/20'
                      : 'bg-muted text-muted-foreground border border-border'
                  }`}
                >
                  {reward.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-foreground">{reward.name}</h3>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed flex-1">
                {reward.description}
              </p>
              <div className="mt-3 flex items-center justify-between">
                <span className="flex items-center gap-1 text-sm font-bold text-primary font-tabular">
                  <Coins size={14} />
                  {reward.cost.toLocaleString()} pts
                </span>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() => handleToggleReward(reward)}
                  className={`flex-1 h-8 rounded-lg text-xs font-semibold border transition-all duration-150 ${
                    reward.enabled
                      ? 'bg-muted border-border text-muted-foreground hover:text-foreground'
                      : 'bg-accent/10 border-accent/25 text-accent hover:bg-accent/20'
                  }`}
                >
                  {reward.enabled ? 'Disable' : 'Enable'}
                </button>
                <button
                  onClick={() => {
                    setRedeemTarget(reward);
                    setRedeemMemberId('');
                  }}
                  disabled={!reward.enabled}
                  className="btn-primary h-8 px-3 text-xs disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <Sparkles size={13} />
                  Redeem
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Member Modal */}
      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60" onClick={() => setAddOpen(false)} />
          <div className="relative w-full max-w-md card-base p-6 fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">Add Member</h2>
              <button
                onClick={() => setAddOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">
                  Full name
                </label>
                <input
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  placeholder="e.g. Ahmed Khalil"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">
                  Phone number
                </label>
                <input
                  value={newMember.phone}
                  onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                  placeholder="e.g. 0100-xxx-4521"
                  className="input-field"
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddOpen(false)}
                  className="btn-secondary flex-1 h-10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1 h-10 flex items-center justify-center gap-2"
                >
                  <Plus size={14} />
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adjust Points Modal */}
      {adjustTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60" onClick={() => setAdjustTarget(null)} />
          <div className="relative w-full max-w-sm card-base p-6 fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">Adjust Points</h2>
              <button
                onClick={() => setAdjustTarget(null)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              <span className="font-semibold text-foreground">{adjustTarget.name}</span> currently
              has{' '}
              <span className="font-semibold text-primary font-tabular">{adjustTarget.points}</span>{' '}
              points.
            </p>
            <form onSubmit={handleAdjustSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">
                  Point delta
                </label>
                <input
                  type="number"
                  value={adjustDelta}
                  onChange={(e) => setAdjustDelta(e.target.value)}
                  placeholder="e.g. 100 or -50"
                  className="input-field"
                />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setAdjustTarget(null)}
                  className="btn-secondary flex-1 h-10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1 h-10 flex items-center justify-center gap-2"
                >
                  <SlidersHorizontal size={14} />
                  Apply
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Redeem Modal */}
      {redeemTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60" onClick={() => setRedeemTarget(null)} />
          <div className="relative w-full max-w-sm card-base p-6 fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">Redeem Reward</h2>
              <button
                onClick={() => setRedeemTarget(null)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              <span className="text-xl mr-1">{redeemTarget.emoji}</span>
              <span className="font-semibold text-foreground">{redeemTarget.name}</span> costs{' '}
              <span className="font-semibold text-primary font-tabular">
                {redeemTarget.cost.toLocaleString()}
              </span>{' '}
              points.
            </p>
            <form onSubmit={handleRedeem} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Member</label>
                <select
                  value={redeemMemberId}
                  onChange={(e) => setRedeemMemberId(e.target.value)}
                  className="input-field"
                >
                  <option value="">Select a member...</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} — {m.points.toLocaleString()} pts
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setRedeemTarget(null)}
                  className="btn-secondary flex-1 h-10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1 h-10 flex items-center justify-center gap-2"
                >
                  <Gift size={14} />
                  Confirm Redeem
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
