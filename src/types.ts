export type Role = 'customer' | 'admin' | 'agent';
export type Zone = 'North' | 'South' | 'East' | 'West';
export type OrderStatus = 'Pending' | 'Assigned' | 'Picked Up' | 'In Transit' | 'Out for Delivery' | 'Delivered' | 'Failed' | 'Rescheduled';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  zone?: Zone; // For agents
}

export interface ApiLog {
  id: string;
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT';
  endpoint: string;
  status: number;
  payload?: string;
  response?: string;
  timestamp: string;
}

export interface OrderHistoryEvent {
  status: OrderStatus;
  timestamp: string;
  actor: string;
  reason?: string;
}

export interface Order {
  id: string;
  customerId: string;
  pickupZone: Zone;
  dropZone: Zone;
  pickupAddress: string;
  dropAddress: string;
  dimensions: { l: number; b: number; h: number };
  actualWeight: number;
  orderType: 'B2B' | 'B2C';
  paymentType: 'Prepaid' | 'COD';
  charge: number;
  status: OrderStatus;
  agentId?: string;
  history: OrderHistoryEvent[];
  createdAt: string;
}

export interface Agent {
  id: string;
  name: string;
  isAvailable: boolean;
  currentZone: Zone;
}

export interface Notification {
  id: string;
  orderId: string;
  agentId: string;
  recipientId?: string;
  message: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

