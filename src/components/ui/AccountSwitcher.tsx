'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { Check, X, Repeat } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { DemoAccount, demoAccounts, roleLabels, initialsFor } from '@/lib/demoAccounts';

interface AccountSwitcherProps {
  onClose: () => void;
}

export default function AccountSwitcher({ onClose }: AccountSwitcherProps) {
  const router = useRouter();
  const { user, switchAccount } = useAuth();

  const handleSwitch = (account: DemoAccount) => {
    switchAccount(account.email);
    onClose();
    router.push(homePathFor(account.role));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-md card-base p-6 fade-in">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-foreground">Switch Account</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Sign in as a different role</p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-2">
          {demoAccounts.map((account) => {
            const isActive = user?.email === account.email;
            return (
              <button
                key={account.email}
                onClick={() => handleSwitch(account)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all duration-150 text-left ${
                  isActive
                    ? 'border-primary/50 bg-primary/5 cursor-default'
                    : 'border-border bg-muted/20 hover:border-primary/30 hover:bg-muted/40'
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-primary">
                    {initialsFor(account.name)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{account.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{account.email}</p>
                </div>
                <span className={`text-xs font-bold flex-shrink-0 ${account.color}`}>
                  {roleLabels[account.role]}
                </span>
                {isActive ? (
                  <Check size={15} className="text-accent flex-shrink-0" />
                ) : (
                  <Repeat size={15} className="text-muted-foreground flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function homePathFor(role: DemoAccount['role']): string {
  return role === 'customer' ? '/customer-dashboard' : '/';
}
