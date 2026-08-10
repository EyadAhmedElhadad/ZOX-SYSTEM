'use client';
import React, { useState } from 'react';
import { Star, ThumbsUp, Minus, ThumbsDown, AlertTriangle, X } from 'lucide-react';
import type { LiveSession } from './LiveSessionsContent';
import { toast } from 'sonner';

type Rating = 'excellent' | 'good' | 'normal' | 'difficult' | 'problematic';
type Reason = 'noise' | 'argument' | 'aggressive' | 'damage' | 'disrespectful' | 'other';

const ratings: {
  id: Rating;
  label: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  border: string;
}[] = [
  {
    id: 'excellent',
    label: 'Excellent',
    icon: <Star size={20} />,
    color: 'text-warning',
    bg: 'bg-warning/10',
    border: 'border-warning/30',
  },
  {
    id: 'good',
    label: 'Good',
    icon: <ThumbsUp size={20} />,
    color: 'text-accent',
    bg: 'bg-accent/10',
    border: 'border-accent/30',
  },
  {
    id: 'normal',
    label: 'Normal',
    icon: <Minus size={20} />,
    color: 'text-muted-foreground',
    bg: 'bg-muted',
    border: 'border-border',
  },
  {
    id: 'difficult',
    label: 'Difficult',
    icon: <ThumbsDown size={20} />,
    color: 'text-warning',
    bg: 'bg-warning/10',
    border: 'border-warning/30',
  },
  {
    id: 'problematic',
    label: 'Problematic',
    icon: <AlertTriangle size={20} />,
    color: 'text-danger',
    bg: 'bg-danger/10',
    border: 'border-danger/30',
  },
];

const reasons: { id: Reason; label: string }[] = [
  { id: 'noise', label: 'Excessive Noise' },
  { id: 'argument', label: 'Argument' },
  { id: 'aggressive', label: 'Aggressive' },
  { id: 'damage', label: 'Damage' },
  { id: 'disrespectful', label: 'Disrespectful' },
  { id: 'other', label: 'Other' },
];

interface EvaluationPopupProps {
  session: LiveSession;
  onComplete: (sessionId: string) => void;
}

export default function EvaluationPopup({ session, onComplete }: EvaluationPopupProps) {
  const [selectedRating, setSelectedRating] = useState<Rating | null>(null);
  const [selectedReasons, setSelectedReasons] = useState<Reason[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showReasons = selectedRating === 'difficult' || selectedRating === 'problematic';

  const toggleReason = (reason: Reason) => {
    setSelectedReasons((prev) =>
      prev.includes(reason) ? prev.filter((r) => r !== reason) : [...prev, reason]
    );
  };

  const handleSubmit = async () => {
    if (!selectedRating) return;
    setIsSubmitting(true);
    // Backend integration point: POST /api/customers/:id/evaluation with { rating, reasons, sessionId }
    await new Promise((r) => setTimeout(r, 600));
    toast.success(`Evaluation submitted for ${session.customer}`);
    setIsSubmitting(false);
    onComplete(session.id);
  };

  const handleSkip = () => {
    onComplete(session.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/80" />
      <div className="relative bg-card border border-border rounded-2xl w-full max-w-sm shadow-2xl slide-up">
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Session Closed
            </p>
            <h2 className="text-base font-bold text-foreground mt-0.5">Rate this customer</h2>
          </div>
          <button
            onClick={handleSkip}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        <div className="px-5 pb-2">
          <div className="flex items-center gap-2 bg-muted/40 rounded-xl p-3 mb-4">
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-primary">{session.customer.charAt(0)}</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{session.customer}</p>
              <p className="text-xs text-muted-foreground">
                {session.room} · {session.game}
              </p>
            </div>
          </div>

          <p className="text-sm font-medium text-foreground mb-3">How was this customer?</p>
          <div className="grid grid-cols-5 gap-1.5 mb-4">
            {ratings.map((r) => (
              <button
                key={`rating-${r.id}`}
                onClick={() => {
                  setSelectedRating(r.id);
                  if (r.id !== 'difficult' && r.id !== 'problematic') {
                    setSelectedReasons([]);
                  }
                }}
                className={`flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-xl border transition-all duration-150 active:scale-95 ${
                  selectedRating === r.id
                    ? `${r.bg} ${r.border} ${r.color}`
                    : 'bg-muted border-border text-muted-foreground hover:text-foreground hover:border-border/60'
                }`}
              >
                <span className={selectedRating === r.id ? r.color : ''}>{r.icon}</span>
                <span className="text-xs font-semibold leading-tight text-center">{r.label}</span>
              </button>
            ))}
          </div>

          {showReasons && (
            <div className="mb-4 fade-in">
              <p className="text-xs font-semibold text-muted-foreground mb-2">
                What happened? (optional)
              </p>
              <div className="flex flex-wrap gap-1.5">
                {reasons.map((reason) => (
                  <button
                    key={`reason-${reason.id}`}
                    onClick={() => toggleReason(reason.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-150 ${
                      selectedReasons.includes(reason.id)
                        ? 'bg-danger/10 border border-danger/30 text-danger'
                        : 'bg-muted border border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {reason.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="px-5 pb-5 flex gap-2">
          <button onClick={handleSkip} className="btn-secondary flex-1 text-sm">
            Skip
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedRating || isSubmitting}
            className="btn-primary flex-1 text-sm flex items-center justify-center gap-1.5"
          >
            {isSubmitting ? (
              <div className="w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              'Submit'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
