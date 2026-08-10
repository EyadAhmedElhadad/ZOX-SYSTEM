'use client';
import React, { useState } from 'react';
import LiveSessionsHeader from './LiveSessionsHeader';
import SessionsGrid from './SessionsGrid';
import PaymentModal from './PaymentModal';
import EvaluationPopup from './EvaluationPopup';
import AddProductModal from './AddProductModal';
import { Toaster } from 'sonner';

export interface SessionProduct {
  id: string;
  name: string;
  price: number;
  qty: number;
}

export interface LiveSession {
  id: string;
  room: string;
  roomType: 'Standard' | 'Premium' | 'VIP';
  customer: string;
  phone: string;
  game: string;
  controllers: string[];
  startTime: string;
  startMinutesAgo: number;
  players: number;
  hourlyRate: number;
  sessionType: 'open' | 'fixed';
  fixedDurationMinutes?: number;
  products: SessionProduct[];
  status: 'active' | 'paused';
}

export const initialSessions: LiveSession[] = [
  {
    id: 'ls-001',
    room: 'Room 1',
    roomType: 'Standard',
    customer: 'Mohamed Khalil',
    phone: '0100-xxx-4521',
    game: 'FC 26',
    controllers: ['CTR-01', 'CTR-02'],
    startTime: '14:30',
    startMinutesAgo: 47,
    players: 2,
    hourlyRate: 80,
    sessionType: 'open',
    products: [{ id: 'prod-001', name: 'Pepsi', price: 25, qty: 2 }],
    status: 'active',
  },
  {
    id: 'ls-002',
    room: 'Room 2',
    roomType: 'Standard',
    customer: 'Ahmed Samir & Group',
    phone: '0112-xxx-8834',
    game: 'GTA V',
    controllers: ['CTR-03', 'CTR-04', 'CTR-05', 'CTR-06'],
    startTime: '13:45',
    startMinutesAgo: 92,
    players: 4,
    hourlyRate: 120,
    sessionType: 'fixed',
    fixedDurationMinutes: 120,
    products: [
      { id: 'prod-002', name: 'Pepsi', price: 25, qty: 4 },
      { id: 'prod-003', name: 'Chips', price: 20, qty: 2 },
    ],
    status: 'active',
  },
  {
    id: 'ls-003',
    room: 'Room 4',
    roomType: 'VIP',
    customer: 'Karim Mostafa',
    phone: '0111-xxx-2267',
    game: 'FC 26',
    controllers: ['CTR-13', 'CTR-14', 'CTR-15', 'CTR-16', 'CTR-17', 'CTR-18'],
    startTime: '14:00',
    startMinutesAgo: 77,
    players: 6,
    hourlyRate: 200,
    sessionType: 'open',
    products: [
      { id: 'prod-004', name: 'Water', price: 15, qty: 6 },
      { id: 'prod-005', name: 'Juice', price: 35, qty: 3 },
      { id: 'prod-006', name: 'Indomie', price: 30, qty: 2 },
    ],
    status: 'active',
  },
  {
    id: 'ls-004',
    room: 'Room 6',
    roomType: 'Premium',
    customer: 'Youssef Mahmoud',
    phone: '0100-xxx-9901',
    game: 'PES 2024',
    controllers: ['CTR-21', 'CTR-22'],
    startTime: '15:10',
    startMinutesAgo: 27,
    players: 2,
    hourlyRate: 100,
    sessionType: 'fixed',
    fixedDurationMinutes: 60,
    products: [{ id: 'prod-007', name: 'Pepsi', price: 25, qty: 1 }],
    status: 'active',
  },
  {
    id: 'ls-005',
    room: 'Room 9',
    roomType: 'Standard',
    customer: 'Hassan Nour',
    phone: '0115-xxx-3312',
    game: 'Call of Duty',
    controllers: ['CTR-31', 'CTR-32'],
    startTime: '14:50',
    startMinutesAgo: 47,
    players: 2,
    hourlyRate: 80,
    sessionType: 'open',
    products: [],
    status: 'paused',
  },
  {
    id: 'ls-006',
    room: 'Room 10',
    roomType: 'Premium',
    customer: 'Sara & Nadia',
    phone: '0106-xxx-7741',
    game: 'FC 26',
    controllers: ['CTR-37', 'CTR-38'],
    startTime: '15:20',
    startMinutesAgo: 17,
    players: 2,
    hourlyRate: 100,
    sessionType: 'fixed',
    fixedDurationMinutes: 90,
    products: [
      { id: 'prod-008', name: 'Juice', price: 35, qty: 2 },
      { id: 'prod-009', name: 'Chips', price: 20, qty: 1 },
    ],
    status: 'active',
  },
];

export default function LiveSessionsContent() {
  const [sessions, setSessions] = useState<LiveSession[]>(initialSessions);
  const [paymentTarget, setPaymentTarget] = useState<LiveSession | null>(null);
  const [evaluationTarget, setEvaluationTarget] = useState<LiveSession | null>(null);
  const [addProductTarget, setAddProductTarget] = useState<LiveSession | null>(null);

  const handleAddProduct = (sessionId: string, product: SessionProduct) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== sessionId) return s;
        const existing = s.products.find((p) => p.name === product.name);
        if (existing) {
          return {
            ...s,
            products: s.products.map((p) =>
              p.name === product.name ? { ...p, qty: p.qty + product.qty } : p
            ),
          };
        }
        return { ...s, products: [...s.products, product] };
      })
    );
    setAddProductTarget(null);
  };

  const handleTogglePause = (sessionId: string) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId ? { ...s, status: s.status === 'active' ? 'paused' : 'active' } : s
      )
    );
  };

  const handleEndSession = (session: LiveSession) => {
    setPaymentTarget(session);
  };

  const handlePaymentComplete = (sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (session) {
      setPaymentTarget(null);
      setEvaluationTarget(session);
    }
  };

  const handleEvaluationComplete = (sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    setEvaluationTarget(null);
  };

  return (
    <div className="p-4 lg:p-6 xl:p-8 max-w-screen-2xl mx-auto">
      <Toaster position="bottom-right" theme="system" />
      <LiveSessionsHeader sessionCount={sessions.length} />
      <SessionsGrid
        sessions={sessions}
        onAddProduct={(s) => setAddProductTarget(s)}
        onTogglePause={handleTogglePause}
        onEndSession={handleEndSession}
      />
      {paymentTarget && (
        <PaymentModal
          session={paymentTarget}
          onClose={() => setPaymentTarget(null)}
          onPaymentComplete={handlePaymentComplete}
        />
      )}
      {evaluationTarget && (
        <EvaluationPopup session={evaluationTarget} onComplete={handleEvaluationComplete} />
      )}
      {addProductTarget && (
        <AddProductModal
          session={addProductTarget}
          onClose={() => setAddProductTarget(null)}
          onAdd={handleAddProduct}
        />
      )}
    </div>
  );
}
