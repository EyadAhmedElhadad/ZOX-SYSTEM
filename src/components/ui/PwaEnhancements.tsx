'use client';
import React, { useEffect, useState } from 'react';
import { Download, RefreshCw, WifiOff, X } from 'lucide-react';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

export default function PwaEnhancements() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissedInstall, setDismissedInstall] = useState(false);
  const [updateReady, setUpdateReady] = useState(false);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstallEvent(null);
    };
    const onOnline = () => setOffline(false);
    const onOffline = () => setOffline(true);
    const onSwMessage = (e: MessageEvent) => {
      if (e.data?.type === 'ZOOX_SW_UPDATED') {
        setUpdateReady(true);
      }
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    navigator.serviceWorker?.addEventListener('message', onSwMessage);

    if (typeof navigator !== 'undefined' && !navigator.onLine) setOffline(true);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
      navigator.serviceWorker?.removeEventListener('message', onSwMessage);
    };
  }, []);

  const handleInstall = async () => {
    if (!installEvent) return;
    try {
      await installEvent.prompt();
      await installEvent.userChoice;
    } finally {
      setInstallEvent(null);
    }
  };

  const handleUpdate = async () => {
    if (!('serviceWorker' in navigator)) return;
    const reg = await navigator.serviceWorker.getRegistration();
    if (reg?.waiting) {
      reg.waiting.postMessage({ type: 'ZOOX_SKIP_WAITING' });
    }
    window.location.reload();
  };

  return (
    <>
      {/* Offline indicator */}
      {offline && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 bg-card border border-danger/30 text-danger rounded-full px-4 py-2 text-xs font-semibold shadow-xl fade-in">
          <WifiOff size={14} />
          You are offline — showing cached data
        </div>
      )}

      {/* Update available */}
      {updateReady && (
        <div className="fixed bottom-4 right-4 z-[60] card-base border border-primary/30 p-4 max-w-xs shadow-2xl slide-up">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <RefreshCw size={15} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">Update available</p>
                <p className="text-xs text-muted-foreground">A new version of Zoox is ready.</p>
              </div>
            </div>
            <button
              onClick={() => setUpdateReady(false)}
              className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X size={14} />
            </button>
          </div>
          <button
            onClick={handleUpdate}
            className="btn-primary w-full mt-3 flex items-center justify-center gap-2 h-9"
          >
            <RefreshCw size={14} />
            Reload to update
          </button>
        </div>
      )}

      {/* Install prompt */}
      {installEvent && !dismissedInstall && (
        <div className="fixed bottom-4 left-4 z-[60] card-base border border-primary/30 p-4 max-w-xs shadow-2xl slide-up">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Download size={15} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">Install Zoox</p>
                <p className="text-xs text-muted-foreground">
                  Add to home screen for quick access.
                </p>
              </div>
            </div>
            <button
              onClick={() => setDismissedInstall(true)}
              className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X size={14} />
            </button>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setDismissedInstall(true)}
              className="btn-secondary flex-1 h-9 text-xs"
            >
              Not now
            </button>
            <button onClick={handleInstall} className="btn-primary flex-1 h-9 text-xs">
              Install
            </button>
          </div>
        </div>
      )}
    </>
  );
}
