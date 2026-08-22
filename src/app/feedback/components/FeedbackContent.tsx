'use client';
import React, { useState } from 'react';
import { Star, MessageSquare, TrendingUp, AlertTriangle, Check, X, Inbox } from 'lucide-react';
import { toast } from 'sonner';
import { feedbackApi, useAsyncData, toastApiError } from '@/lib/api';
import type { UiFeedbackEntry } from '@/lib/api';

type RatingFilter = 'all' | '5' | '4' | '3' | '2' | '1';

const filterOptions: { id: RatingFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: '5', label: '5 Stars' },
  { id: '4', label: '4 Stars' },
  { id: '3', label: '3 Stars' },
  { id: '2', label: '2 Stars' },
  { id: '1', label: '1 Star' },
];

const ratingColors: Record<number, string> = {
  5: 'text-accent',
  4: 'text-accent',
  3: 'text-warning',
  2: 'text-danger',
  1: 'text-danger',
};

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={`star-${rating}-${star}`}
          size={14}
          className={star <= rating ? 'fill-warning text-warning' : 'text-muted-foreground/40'}
        />
      ))}
    </div>
  );
}

export default function FeedbackContent() {
  const { data, loading, reload } = useAsyncData(() => feedbackApi.list(), []);
  const entries = data ?? [];
  const [filter, setFilter] = useState<RatingFilter>('all');
  const [showReviewed, setShowReviewed] = useState(false);

  if (loading) {
    return <div className="glass-panel p-10 text-center text-muted-foreground">Loading…</div>;
  }

  const total = entries.length;
  const average = total ? entries.reduce((sum, e) => sum + e.rating, 0) / total : 0;
  const positive = entries.filter((e) => e.rating >= 4).length;
  const positivePct = total ? Math.round((positive / total) * 100) : 0;
  const critical = entries.filter((e) => e.rating <= 2).length;
  const unread = entries.filter((e) => e.status === 'new').length;

  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: entries.filter((e) => e.rating === star).length,
  }));

  const visible = entries.filter((e) => {
    if (!showReviewed && e.status === 'reviewed') return false;
    if (filter !== 'all' && e.rating !== Number(filter)) return false;
    return true;
  });

  const handleToggleReviewed = async (entry: UiFeedbackEntry) => {
    const nextStatus = entry.status === 'new' ? 'reviewed' : 'new';
    try {
      await feedbackApi.setStatus(entry.id, nextStatus);
      toast.success(`Marked as ${nextStatus}`);
      reload();
    } catch (err) {
      toastApiError(err);
    }
  };

  return (
    <div className="p-4 lg:p-6 xl:p-8 max-w-screen-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Customer Feedback</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {unread > 0
              ? `${unread} new piece${unread !== 1 ? 's' : ''} of feedback awaiting review`
              : 'All caught up — no unreviewed feedback'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowReviewed((prev) => !prev)}
            className={`btn-secondary flex items-center gap-2 h-9 ${
              showReviewed ? 'text-primary border-primary/30' : ''
            }`}
          >
            {showReviewed ? <Check size={14} /> : <X size={14} />}
            {showReviewed ? 'Showing Reviewed' : 'Hide Reviewed'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-base p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-warning/10 border border-warning/20 flex items-center justify-center">
              <Star size={18} className="text-warning fill-warning" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Average Rating</p>
              <p className="text-lg font-bold text-foreground font-tabular">
                {average.toFixed(1)}
                <span className="text-xs font-semibold text-muted-foreground"> / 5</span>
              </p>
            </div>
          </div>
        </div>
        <div className="card-base p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <MessageSquare size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Feedback</p>
              <p className="text-lg font-bold text-foreground font-tabular">{total}</p>
            </div>
          </div>
        </div>
        <div className="card-base p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
              <TrendingUp size={18} className="text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Positive (4–5★)</p>
              <p className="text-lg font-bold text-foreground font-tabular">{positivePct}%</p>
            </div>
          </div>
        </div>
        <div className="card-base p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-danger/10 border border-danger/20 flex items-center justify-center">
              <AlertTriangle size={18} className="text-danger" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Needs Attention</p>
              <p className="text-lg font-bold text-foreground font-tabular">{critical}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: rating distribution */}
        <div className="xl:col-span-1">
          <div className="card-base p-5">
            <h2 className="text-base font-semibold text-foreground mb-4">Rating Breakdown</h2>
            <div className="space-y-3">
              {distribution.map((d) => (
                <div key={`dist-${d.star}`} className="flex items-center gap-3">
                  <span
                    className={`w-8 text-sm font-semibold font-tabular ${ratingColors[d.star]}`}
                  >
                    {d.star}★
                  </span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        d.star >= 4 ? 'bg-accent' : d.star === 3 ? 'bg-warning' : 'bg-danger'
                      }`}
                      style={{ width: `${total ? (d.count / total) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-sm text-muted-foreground font-tabular">
                    {d.count}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">Most common tags</p>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(
                  entries.reduce<Record<string, number>>((acc, e) => {
                    e.tags.forEach((t) => {
                      acc[t] = (acc[t] ?? 0) + 1;
                    });
                    return acc;
                  }, {})
                )
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 6)
                  .map(([tag, count]) => (
                    <span
                      key={`tag-${tag}`}
                      className="px-2.5 py-1 rounded-lg bg-muted border border-border text-xs font-semibold text-muted-foreground"
                    >
                      {tag} <span className="text-primary font-bold">{count}</span>
                    </span>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: feedback list */}
        <div className="xl:col-span-2">
          <div className="flex flex-wrap items-center gap-1.5 mb-4">
            {filterOptions.map((opt) => (
              <button
                key={`f-${opt.id}`}
                onClick={() => setFilter(opt.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-150 ${
                  filter === opt.id
                    ? 'bg-primary/10 border-primary/30 text-primary'
                    : 'bg-muted border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {visible.length === 0 ? (
            <div className="card-base flex flex-col items-center justify-center text-center gap-3 py-16">
              <div className="w-12 h-12 rounded-2xl bg-muted border border-border flex items-center justify-center">
                <Inbox size={22} className="text-muted-foreground" />
              </div>
              <p className="text-sm font-semibold text-foreground">No feedback here</p>
              <p className="text-xs text-muted-foreground max-w-xs">
                {entries.length === 0
                  ? 'Customers have not submitted any feedback yet.'
                  : 'Try a different filter to see more feedback.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {visible.map((entry) => (
                <div
                  key={entry.id}
                  className={`card-base p-4 ${entry.status === 'new' ? 'border-primary/30' : 'opacity-80'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-primary">
                          {entry.customer.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {entry.customer}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {entry.game} · {entry.room}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Stars rating={entry.rating} />
                      {entry.status === 'new' && (
                        <span className="px-1.5 py-0.5 rounded-md bg-primary/10 border border-primary/30 text-[10px] font-bold text-primary uppercase tracking-wider">
                          New
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    {entry.tags.map((tag) => (
                      <span
                        key={`${entry.id}-${tag}`}
                        className="px-2 py-0.5 rounded-md bg-muted border border-border text-[11px] font-semibold text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {entry.notes && (
                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                      “{entry.notes}”
                    </p>
                  )}

                  <div className="mt-3 pt-3 border-t border-border/60 flex items-center justify-between gap-3">
                    <p className="text-xs text-muted-foreground font-tabular">
                      {entry.date} · {entry.time}
                    </p>
                    <button
                      onClick={() => handleToggleReviewed(entry)}
                      className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-all duration-150 ${
                        entry.status === 'new'
                          ? 'bg-accent/10 border border-accent/25 text-accent hover:bg-accent/20'
                          : 'bg-muted border border-border text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {entry.status === 'new' ? (
                        <>
                          <Check size={12} /> Mark reviewed
                        </>
                      ) : (
                        <>
                          <X size={12} /> Mark as new
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
