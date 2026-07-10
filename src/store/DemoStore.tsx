import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Order, Agent, Role, OrderStatus, User, ApiLog, Zone, Notification } from '../types';

export interface RateCard {
  intraZone: number;
  interZone: number;
  perKg: number;
}

export interface RateCardsConfig {
  B2C: RateCard;
  B2B: RateCard;
}

interface DemoContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (name: string, email: string, role: Role, zone?: Zone) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  apiLogs: ApiLog[];
  addApiLog: (method: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT', endpoint: string, status: number, payload?: any, response?: any) => void;
  clearApiLogs: () => void;
  orders: Order[];
  agents: Agent[];
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'history' | 'status'>) => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus, actor: string, reason?: string) => Promise<void>;
  assignAgent: (orderId: string, agentId?: string) => Promise<void>;
  rescheduleOrder: (orderId: string) => Promise<void>;
  notifications: Notification[];
  acceptOrderOffer: (notificationId: string) => Promise<void>;
  declineOrderOffer: (notificationId: string) => Promise<void>;
  
  // Rate Engine Configuration state
  rateCards: RateCardsConfig;
  updateRateCards: (newConfig: RateCardsConfig) => void;
  codSurcharge: number;
  updateCodSurcharge: (val: number) => void;
  volumetricDivisor: number;
  updateVolumetricDivisor: (val: number) => void;

  // Sandbox helper functions
  setAgentAvailable: (agentId: string, available: boolean) => void;
  setAgentZone: (agentId: string, zone: Zone) => void;
  switchUserRoleDirectly: (role: Role) => void;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

const initialAgents: Agent[] = [
  { id: 'a1', name: 'Rahul Sharma', isAvailable: true, currentZone: 'North' },
  { id: 'a2', name: 'Amit Patel', isAvailable: true, currentZone: 'South' },
  { id: 'a3', name: 'Rajesh Kumar', isAvailable: false, currentZone: 'East' },
];

const initialOrders: Order[] = [
  {
    id: 'ORD-1001',
    customerId: 'cust1',
    pickupZone: 'North',
    dropZone: 'South',
    pickupAddress: 'Sector 62, Noida Industrial Area (North Hub)',
    dropAddress: 'HSR Layout Sector 4, Bengaluru (South Hub)',
    dimensions: { l: 20, b: 20, h: 20 },
    actualWeight: 2,
    orderType: 'B2C',
    paymentType: 'Prepaid',
    charge: 110,
    status: 'In Transit',
    agentId: 'a3',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    history: [
      { status: 'Pending', timestamp: new Date(Date.now() - 3600000).toISOString(), actor: 'Customer' },
      { status: 'Assigned', timestamp: new Date(Date.now() - 3000000).toISOString(), actor: 'System Auto-Assign' },
      { status: 'Picked Up', timestamp: new Date(Date.now() - 1800000).toISOString(), actor: 'Rajesh Kumar' },
      { status: 'In Transit', timestamp: new Date(Date.now() - 900000).toISOString(), actor: 'Rajesh Kumar' },
    ]
  },
  {
    id: 'ORD-1002',
    customerId: 'cust1',
    pickupZone: 'East',
    dropZone: 'West',
    pickupAddress: 'Salt Lake Sector V, Kolkata (East Hub)',
    dropAddress: 'Bandra West, Link Road, Mumbai (West Hub)',
    dimensions: { l: 15, b: 10, h: 10 },
    actualWeight: 0.5,
    orderType: 'B2B',
    paymentType: 'COD',
    charge: 100,
    status: 'Failed',
    agentId: 'a1',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    history: [
      { status: 'Pending', timestamp: new Date(Date.now() - 7200000).toISOString(), actor: 'Customer' },
      { status: 'Assigned', timestamp: new Date(Date.now() - 7000000).toISOString(), actor: 'System Auto-Assign' },
      { status: 'Picked Up', timestamp: new Date(Date.now() - 6000000).toISOString(), actor: 'Rahul Sharma' },
      { status: 'Out for Delivery', timestamp: new Date(Date.now() - 3600000).toISOString(), actor: 'Rahul Sharma' },
      { status: 'Failed', timestamp: new Date(Date.now() - 1800000).toISOString(), actor: 'Rahul Sharma', reason: 'Customer unavailable' },
    ]
  }
];

const defaultUsers: Record<string, { user: User; pass: string }> = {
  'admin@zonepilot.app': {
    user: { id: 'admin1', email: 'admin@zonepilot.app', name: 'Krupal (Admin)', role: 'admin' },
    pass: 'admin123'
  },
  'customer@zonepilot.app': {
    user: { id: 'cust1', email: 'customer@zonepilot.app', name: 'Krupal Warale', role: 'customer' },
    pass: 'demo123'
  },
  'agent@zonepilot.app': {
    user: { id: 'a1', email: 'agent@zonepilot.app', name: 'Rahul Sharma', role: 'agent', zone: 'North' },
    pass: 'demo123'
  }
};

const defaultRateCards: RateCardsConfig = {
  B2C: { intraZone: 50, interZone: 100, perKg: 10 },
  B2B: { intraZone: 40, interZone: 80, perKg: 8 },
};

export function DemoProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<Record<string, { user: User; pass: string }>>(() => {
    const saved = localStorage.getItem('zp_registered_users');
    const parsed = saved ? JSON.parse(saved) : {};
    delete parsed['customer@demo.com'];
    delete parsed['agent@demo.com'];
    return { ...parsed, ...defaultUsers };
  });

  const [activeRole, setActiveRole] = useState<Role>(() => {
    const params = new URLSearchParams(window.location.search);
    const queryRole = params.get('role') as Role;
    if (queryRole && ['customer', 'agent', 'admin'].includes(queryRole)) {
      sessionStorage.setItem('zp_active_role', queryRole);
      return queryRole;
    }
    const role = sessionStorage.getItem('zp_active_role') as Role;
    return role || 'customer';
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const params = new URLSearchParams(window.location.search);
    let role = params.get('role');
    if (!role || !['customer', 'agent', 'admin'].includes(role)) {
      role = sessionStorage.getItem('zp_active_role') || 'customer';
    }
    const savedPool = localStorage.getItem('zp_logged_in_users');
    const pool = savedPool ? JSON.parse(savedPool) : {};
    if (!pool.customer) pool.customer = defaultUsers['customer@zonepilot.app'].user;
    if (!pool.agent) pool.agent = defaultUsers['agent@zonepilot.app'].user;
    if (!pool.admin) pool.admin = defaultUsers['admin@zonepilot.app'].user;
    localStorage.setItem('zp_logged_in_users', JSON.stringify(pool));
    return pool[role] || null;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('zp_orders');
    return saved ? JSON.parse(saved) : initialOrders;
  });

  const [agents, setAgents] = useState<Agent[]>(() => {
    const saved = localStorage.getItem('zp_agents');
    if (!saved) return initialAgents;
    const parsed = JSON.parse(saved) as Agent[];
    return parsed.map(p => {
      const init = initialAgents.find(ia => ia.id === p.id);
      return init ? { ...p, name: init.name } : p;
    });
  });

  const [apiLogs, setApiLogs] = useState<ApiLog[]>([]);

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('zp_notifications');
    return saved ? JSON.parse(saved) : [];
  });

  // Configuration States
  const [rateCards, setRateCardsState] = useState<RateCardsConfig>(() => {
    const saved = localStorage.getItem('zp_rate_cards');
    return saved ? JSON.parse(saved) : defaultRateCards;
  });

  const [codSurcharge, setCodSurchargeState] = useState<number>(() => {
    const saved = localStorage.getItem('zp_cod_surcharge');
    return saved ? Number(saved) : 20;
  });

  const [volumetricDivisor, setVolumetricDivisorState] = useState<number>(() => {
    const saved = localStorage.getItem('zp_volumetric_divisor');
    return saved ? Number(saved) : 5000;
  });

  // Persist items
  useEffect(() => {
    localStorage.setItem('zp_registered_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('zp_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('role')) {
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('zp_agents', JSON.stringify(agents));
  }, [agents]);

  useEffect(() => {
    const syncState = () => {
      const savedOrders = localStorage.getItem('zp_orders');
      if (savedOrders) setOrders(JSON.parse(savedOrders));

      const savedNotifications = localStorage.getItem('zp_notifications');
      if (savedNotifications) setNotifications(JSON.parse(savedNotifications));

      const savedAgents = localStorage.getItem('zp_agents');
      if (savedAgents) setAgents(JSON.parse(savedAgents));

      const role = sessionStorage.getItem('zp_active_role') || 'customer';
      setActiveRole(role as Role);
      const savedPool = localStorage.getItem('zp_logged_in_users');
      const pool = savedPool ? JSON.parse(savedPool) : {};
      setCurrentUser(pool[role] || null);
    };

    window.addEventListener('storage', syncState);
    const interval = setInterval(syncState, 1000);
    return () => {
      window.removeEventListener('storage', syncState);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('zp_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const addApiLog = (method: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT', endpoint: string, status: number, payload?: any, response?: any) => {
    const log: ApiLog = {
      id: `api-${Math.floor(1000 + Math.random() * 9000)}`,
      method,
      endpoint,
      status,
      payload: payload ? JSON.stringify(payload, null, 2) : undefined,
      response: response ? JSON.stringify(response, null, 2) : undefined,
      timestamp: new Date().toISOString()
    };
    setApiLogs(prev => [log, ...prev].slice(0, 30));
  };

  const clearApiLogs = () => setApiLogs([]);

  // Config setters
  const updateRateCards = (newConfig: RateCardsConfig) => {
    setRateCardsState(newConfig);
    localStorage.setItem('zp_rate_cards', JSON.stringify(newConfig));
    addApiLog('PUT', '/api/admin/rate-cards', 200, newConfig, { success: true, message: 'Rate cards updated successfully' });
  };

  const updateCodSurcharge = (val: number) => {
    setCodSurchargeState(val);
    localStorage.setItem('zp_cod_surcharge', String(val));
    addApiLog('PUT', '/api/admin/cod-surcharge', 200, { codSurcharge: val }, { success: true });
  };

  const updateVolumetricDivisor = (val: number) => {
    setVolumetricDivisorState(val);
    localStorage.setItem('zp_volumetric_divisor', String(val));
    addApiLog('PUT', '/api/admin/volumetric-divisor', 200, { divisor: val }, { success: true });
  };

  // Authenticate methods with simulated server lag for API feel
  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const matched = users[email.toLowerCase().trim()];
        if (matched && matched.pass === password) {
          const role = matched.user.role;
          sessionStorage.setItem('zp_active_role', role);
          setActiveRole(role);
          setCurrentUser(matched.user);
          
          const savedPool = localStorage.getItem('zp_logged_in_users');
          const pool = savedPool ? JSON.parse(savedPool) : {};
          pool[role] = matched.user;
          localStorage.setItem('zp_logged_in_users', JSON.stringify(pool));

          addApiLog('POST', '/api/auth/login', 200, { email }, { token: 'jwt-mock-token-abc123xyz', user: matched.user });
          resolve({ success: true, message: 'Logged in successfully' });
        } else {
          addApiLog('POST', '/api/auth/login', 401, { email }, { error: 'Unauthorized', message: 'Invalid credentials' });
          resolve({ success: false, message: 'Invalid email or password' });
        }
      }, 700);
    });
  };

  const register = async (name: string, email: string, role: Role, zone?: Zone): Promise<{ success: boolean; message: string }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const normalizedEmail = email.toLowerCase().trim();
        if (users[normalizedEmail]) {
          addApiLog('POST', '/api/auth/register', 400, { name, email, role }, { error: 'Bad Request', message: 'User already exists' });
          resolve({ success: false, message: 'User with this email already exists' });
          return;
        }

        const newId = role === 'agent' ? `a-${Math.floor(100 + Math.random() * 900)}` : `u-${Math.floor(1000 + Math.random() * 9000)}`;
        const newUser: User = {
          id: newId,
          email: normalizedEmail,
          name,
          role,
          zone
        };

        setUsers(prev => ({
          ...prev,
          [normalizedEmail]: {
            user: newUser,
            pass: 'demo123'
          }
        }));

        if (role === 'agent') {
          const newAgent: Agent = {
            id: newId,
            name,
            isAvailable: true,
            currentZone: zone || 'North'
          };
          setAgents(prev => [...prev, newAgent]);
        }

        addApiLog('POST', '/api/auth/register', 201, { name, email, role, zone }, { message: 'Created successfully', user: newUser });
        resolve({ success: true, message: 'Registration successful! Default password is "demo123"' });
      }, 700);
    });
  };

  const logout = () => {
    addApiLog('POST', '/api/auth/logout', 200, null, { success: true });
    const role = sessionStorage.getItem('zp_active_role') || 'customer';
    const savedPool = localStorage.getItem('zp_logged_in_users');
    const pool = savedPool ? JSON.parse(savedPool) : {};
    delete pool[role];
    localStorage.setItem('zp_logged_in_users', JSON.stringify(pool));
    setCurrentUser(null);
  };

  const addOrder = async (orderData: Omit<Order, 'id' | 'createdAt' | 'history' | 'status'>) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
        const newOrder: Order = {
          ...orderData,
          id: orderId,
          status: 'Pending',
          createdAt: new Date().toISOString(),
          history: [
            { status: 'Pending', timestamp: new Date().toISOString(), actor: currentUser?.name || 'Customer' }
          ]
        };

        setOrders(prev => [newOrder, ...prev]);
        addApiLog('POST', '/api/orders', 201, orderData, newOrder);

        // Find agent to offer this order
        let targetAgent = agents.find(a => a.isAvailable && a.currentZone === newOrder.pickupZone);
        if (!targetAgent) {
          targetAgent = agents.find(a => a.isAvailable);
        }
        if (!targetAgent) {
          targetAgent = agents[0]; // fallback
        }

        if (targetAgent) {
          const newNotif: Notification = {
            id: `notif-${Math.floor(1000 + Math.random() * 9000)}`,
            orderId: orderId,
            agentId: targetAgent.id,
            message: `New order ${orderId} available for you!`,
            status: 'pending',
            createdAt: new Date().toISOString()
          };
          setNotifications(prev => [newNotif, ...prev]);
          addApiLog('POST', `/api/orders/${orderId}/offer`, 200, { offeredTo: targetAgent.name }, newNotif);
        }

        resolve();
      }, 500);
    });
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus, actor: string, reason?: string) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setOrders(prev => prev.map(o => {
          if (o.id === orderId) {
            const updated = {
              ...o,
              status,
              history: [...o.history, { status, timestamp: new Date().toISOString(), actor, reason }]
            };
            addApiLog('PATCH', `/api/orders/${orderId}/status`, 200, { status, actor, reason }, updated);
            return updated;
          }
          return o;
        }));

        if (status === 'Delivered' || status === 'Failed') {
          const order = orders.find(o => o.id === orderId);
          if (order && order.agentId) {
            setAgents(prev => prev.map(a => a.id === order.agentId ? { ...a, isAvailable: true } : a));
          }
        }
        resolve();
      }, 600);
    });
  };

  const assignAgent = async (orderId: string, agentId?: string) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        let assignedAgentId = agentId;
        const order = orders.find(o => o.id === orderId);
        
        if (!assignedAgentId && order) {
          let agent = agents.find(a => a.isAvailable && a.currentZone === order.pickupZone);
          if (!agent) {
            agent = agents.find(a => a.isAvailable);
          }
          if (agent) {
            assignedAgentId = agent.id;
          }
        }

        if (assignedAgentId) {
          setOrders(prev => prev.map(o => {
            if (o.id === orderId) {
              const updated = {
                ...o,
                agentId: assignedAgentId,
                status: 'Assigned' as OrderStatus,
                history: [...o.history, { status: 'Assigned' as OrderStatus, timestamp: new Date().toISOString(), actor: 'System Auto-Assign' }]
              };
              addApiLog('POST', `/api/orders/${orderId}/assign`, 200, { agentId: assignedAgentId }, updated);
              return updated;
            }
            return o;
          }));
          setAgents(prev => prev.map(a => a.id === assignedAgentId ? { ...a, isAvailable: false } : a));
        } else {
          addApiLog('POST', `/api/orders/${orderId}/assign`, 400, { agentId }, { error: 'Bad Request', message: 'No available agents' });
          alert("No available agents right now. Please try again later.");
        }
        resolve();
      }, 600);
    });
  };

  const rescheduleOrder = async (orderId: string) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        updateOrderStatus(orderId, 'Rescheduled', currentUser?.name || 'Customer', 'Requested new delivery date');
        
        setTimeout(() => {
          assignAgent(orderId);
        }, 1200);
        
        resolve();
      }, 500);
    });
  };

  const acceptOrderOffer = async (notificationId: string) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        let orderId = '';
        let agentId = '';
        setNotifications(prev => prev.map(n => {
          if (n.id === notificationId) {
            orderId = n.orderId;
            agentId = n.agentId;
            return { ...n, status: 'accepted' as const };
          }
          return n;
        }));

        if (orderId && agentId) {
          let customerId = '';
          setOrders(prev => prev.map(o => {
            if (o.id === orderId) {
              customerId = o.customerId;
              const updated = {
                ...o,
                agentId: agentId,
                status: 'Assigned' as OrderStatus,
                history: [...o.history, { status: 'Assigned' as OrderStatus, timestamp: new Date().toISOString(), actor: 'Agent Acceptance' }]
              };
              addApiLog('POST', `/api/orders/${orderId}/accept`, 200, { agentId }, updated);
              return updated;
            }
            return o;
          }));
          setAgents(prev => prev.map(a => a.id === agentId ? { ...a, isAvailable: false } : a));

          // Also dispatch customer notification
          const agentObj = agents.find(a => a.id === agentId);
          const newNotif: Notification = {
            id: `notif-${Math.floor(1000 + Math.random() * 9000)}`,
            orderId: orderId,
            agentId: agentId,
            recipientId: customerId,
            message: `Your order ${orderId} has been accepted by ${agentObj ? agentObj.name : 'Agent'}!`,
            status: 'pending',
            createdAt: new Date().toISOString()
          };
          setNotifications(prev => [newNotif, ...prev]);
        }
        resolve();
      }, 500);
    });
  };

  const declineOrderOffer = async (notificationId: string) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setNotifications(prev => prev.map(n => {
          if (n.id === notificationId) {
            addApiLog('POST', `/api/orders/${n.orderId}/decline`, 200, { notificationId }, { success: true });
            return { ...n, status: 'declined' as const };
          }
          return n;
        }));
        resolve();
      }, 500);
    });
  };

  const setAgentAvailable = (agentId: string, available: boolean) => {
    setAgents(prev => prev.map(a => a.id === agentId ? { ...a, isAvailable: available } : a));
    addApiLog('PATCH', `/api/agents/${agentId}/availability`, 200, { isAvailable: available }, { success: true });
  };

  const setAgentZone = (agentId: string, zone: Zone) => {
    setAgents(prev => prev.map(a => a.id === agentId ? { ...a, currentZone: zone } : a));
    addApiLog('PATCH', `/api/agents/${agentId}/zone`, 200, { currentZone: zone }, { success: true });
  };

  const switchUserRoleDirectly = (role: Role) => {
    let targetEmail = 'customer@zonepilot.app';
    if (role === 'admin') targetEmail = 'admin@zonepilot.app';
    if (role === 'agent') targetEmail = 'agent@zonepilot.app';

    const matched = users[targetEmail];
    if (matched) {
      sessionStorage.setItem('zp_active_role', role);
      setActiveRole(role);
      setCurrentUser(matched.user);

      const savedPool = localStorage.getItem('zp_logged_in_users');
      const pool = savedPool ? JSON.parse(savedPool) : {};
      pool[role] = matched.user;
      localStorage.setItem('zp_logged_in_users', JSON.stringify(pool));

      addApiLog('POST', '/api/sandbox/switch-role', 200, { targetRole: role }, { user: matched.user });
    }
  };

  return (
    <DemoContext.Provider value={{
      currentUser, login, register, logout, apiLogs, addApiLog, clearApiLogs,
      orders, agents, addOrder, updateOrderStatus, assignAgent, rescheduleOrder,
      rateCards, updateRateCards, codSurcharge, updateCodSurcharge, volumetricDivisor, updateVolumetricDivisor,
      setAgentAvailable, setAgentZone, switchUserRoleDirectly,
      notifications, acceptOrderOffer, declineOrderOffer
    }}>
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) throw new Error('useDemo must be used within a DemoProvider');
  return context;
}
