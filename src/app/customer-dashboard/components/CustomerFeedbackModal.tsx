'use client';
import React, { useState } from 'react';
import { Star, X } from 'lucide-react';
import { toast } from 'sonner';

interface CustomerFeedbackModalProps {
  session: { game: string; room: string; date: string; time: string };
  onClose: () => void;
}

const moodTags = [
  'Great staff',
  'Clean room',
  'Fast start',
  'Good atmosphere',
  'Noise issues',
  'Equipment issue',
];

export default function CustomerFeedbackModal({ session, onClose }: CustomerFeedbackModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    if (rating === 0) return;
    setIsSubmitting(true);
    // Backend integration point: POST /api/sessions/:id/feedback with { rating, tags, notes }
    await new Promise((r) => setTimeout(r, 700));
    toast.success('Thanks! Your feedback has been submitted');
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-md card-base p-6 fade-in">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-bold text-foreground">Rate your experience</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          How was your session of{' '}
          <span className="text-foreground font-semibold">{session.game}</span> in{' '}
          <span className="text-foreground font-semibold">{session.room}</span>?
        </p>

        {/* Star rating */}
        <div className="flex items-center gap-1.5 mb-5">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="transition-transform active:scale-90"
              aria-label={`${star} star${star > 1 ? 's' : ''}`}
            >
              <Star
                size={28}
                className={
                  (hoverRating || rating) >= star
                    ? 'fill-warning text-warning'
                    : 'text-muted-foreground'
                }
              />
            </button>
          ))}
          <span className="ml-2 text-sm font-semibold text-foreground">
            {rating > 0
              ? ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][rating]
              : 'Tap to rate'}
          </span>
        </div>

        {/* Quick tags */}
        <p className="text-xs font-semibold text-muted-foreground mb-2">
          What did you like or notice?
        </p>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {moodTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-150 ${
                selectedTags.includes(tag)
                  ? 'bg-primary/10 border border-primary/30 text-primary'
                  : 'bg-muted border border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Notes */}
        <label className="block text-xs font-semibold text-muted-foreground mb-2">
          Add a note (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          maxLength={300}
          placeholder="Tell us anything about your visit..."
          className="input-field resize-none"
        />
        <p className="text-right text-xs text-muted-foreground mt-1">{notes.length}/300</p>

        <div className="flex items-center gap-2 mt-3">
          <button onClick={onClose} className="btn-secondary flex-1 h-10">
            Not now
          </button>
          <button
            onClick={handleSubmit}
            disabled={rating === 0 || isSubmitting}
            className="btn-primary flex-1 h-10 flex items-center justify-center gap-1.5"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <>
                <Star size={14} />
                Submit Feedback
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
