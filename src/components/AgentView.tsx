import React, { useState } from 'react';
import { useDemo } from '../store/DemoStore';
import { 
  Truck, MapPin, Check, X, ClipboardList, ShieldAlert, 
  ToggleLeft, ToggleRight, DollarSign, Award, Calendar, ChevronRight, Activity, Smile 
} from 'lucide-react';
import { StatusBadge } from './CustomerView';
import { OrderStatus, Zone } from '../types';
import { motion } from 'motion/react';
import { IndianRouteMap } from './IndianRouteMap';

export function AgentView() {
  const { orders, updateOrderStatus, agents, setAgentAvailable, setAgentZone, currentUser, assignAgent } = useDemo();
  const [activeTab, setActiveTab] = useState<'deliveries' | 'duty' | 'earnings' | 'available'>('deliveries');
  
  // Match operational agent record with the logged-in user
  const me = agents.find(a => a.id === currentUser?.id) || {
    id: currentUser?.id || 'a1',
    name: currentUser?.name || 'Mike Tracker',
    isAvailable: true,
    currentZone: currentUser?.zone || 'North'
  };

  const activeOrders = orders.filter(o => o.agentId === me.id && !['Delivered', 'Failed', 'Rescheduled'].includes(o.status));
  const completedOrders = orders.filter(o => o.agentId === me.id && ['Delivered', 'Failed'].includes(o.status));

  const handleUpdate = (orderId: string, newStatus: OrderStatus, reason?: string) => {
    updateOrderStatus(orderId, newStatus, me.name, reason);
  };

  // Agent metrics calculations
  const totalCompletedCount = completedOrders.length;
  const totalEarnings = completedOrders.filter(o => o.status === 'Delivered').reduce((sum, o) => sum + 50.0, 0); // Mock agent commission
  const failureRate = completedOrders.length > 0 
    ? ((completedOrders.filter(o => o.status === 'Failed').length / completedOrders.length) * 100).toFixed(0) 
    : '0';

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Top Banner & Tab Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-zinc-200/80 mb-8 gap-4">
        <div>
          <span className="text-xs font-bold text-zinc-400 tracking-wider uppercase mb-1 block">Courier Agent Terminal</span>
          <h1 className="text-3xl font-black tracking-tight text-zinc-900">{me.name}</h1>
          <p className="text-zinc-500 text-sm mt-0.5">
            {activeTab === 'deliveries' && `Manage active dispatch orders routed to the ${me.currentZone} Hub.`}
            {activeTab === 'duty' && 'Switch operation hubs, edit vehicular profile, and toggle on-duty slots.'}
            {activeTab === 'earnings' && 'Review pay-per-parcel commissions, delivery performance ratios, and history.'}
          </p>
        </div>

        {/* Tab triggers */}
        <div className="flex flex-wrap gap-1 bg-zinc-100 p-1 rounded-xl border border-zinc-200 shrink-0">
          <button 
            onClick={() => setActiveTab('deliveries')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'deliveries' ? 'bg-white text-zinc-950 shadow-sm border border-zinc-200/50' : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <ClipboardList size={14} />
            My Active Orders ({activeOrders.length})
          </button>
          <button 
            onClick={() => setActiveTab('duty')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'duty' ? 'bg-white text-zinc-950 shadow-sm border border-zinc-200/50' : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <Activity size={14} />
            Duty Manager & Hubs
          </button>
          <button 
            onClick={() => setActiveTab('earnings')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'earnings' ? 'bg-white text-zinc-950 shadow-sm border border-zinc-200/50' : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <DollarSign size={14} />
            Commissions & Ledger
          </button>
          <button 
            onClick={() => setActiveTab('available')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'available' ? 'bg-white text-zinc-950 shadow-sm border border-zinc-200/50' : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <ClipboardList size={14} />
            Available Shipments ({orders.filter(o => !o.agentId && (o.status === 'Pending' || o.status === 'Rescheduled')).length})
          </button>
        </div>
      </div>

      {/* Main UI switch panels */}
      <div>
        
        {/* TAB 1: ACTIVE DELIVERIES BOARD */}
        {activeTab === 'deliveries' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                <Truck size={16} /> Active Cargo Route Sheet
              </h2>
              <span className="text-xs bg-zinc-100 text-zinc-600 px-3 py-1 rounded-full font-bold">
                {activeOrders.length} Parcel{activeOrders.length !== 1 && 's'} assigned
              </span>
            </div>

            {activeOrders.length === 0 ? (
              <div className="text-center py-20 bg-white border border-zinc-200 rounded-2xl border-dashed">
                <Truck size={40} className="mx-auto text-zinc-300 mb-3 animate-pulse" />
                <h3 className="text-zinc-900 font-bold text-sm">No packages currently assigned</h3>
                <p className="text-zinc-500 text-xs mt-1.5">You are currently idle. Wait for dispatchers to route new B2C/B2B parcels in your zone.</p>
                <button 
                  onClick={() => setActiveTab('duty')}
                  className="mt-4 border border-zinc-250 hover:bg-zinc-50 bg-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer text-zinc-700"
                >
                  Configure Operational Hubs
                </button>
              </div>
            ) : (
              <div className="grid gap-6">
                {activeOrders.map(order => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    key={order.id} 
                    className="bg-white border border-zinc-200 rounded-2xl shadow-sm relative overflow-hidden"
                  >
                    {/* Dark Stripe accent */}
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-zinc-900"></div>
                    
                    <div className="p-6">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                        <div>
                          <div className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">CARGO WAYBILL</div>
                          <div className="text-xl font-bold tracking-tight text-zinc-900">{order.id}</div>
                          <div className="text-xs text-zinc-500 font-medium mt-1">Order Type: <span className="font-bold text-zinc-700">{order.orderType} Account</span></div>
                        </div>
                        <div className="sm:text-right flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                          <StatusBadge status={order.status} />
                          <div className="text-base font-bold text-zinc-900">
                            ₹{order.charge.toFixed(2)} 
                            <span className="text-[10px] font-black text-zinc-400 uppercase ml-1">({order.paymentType})</span>
                          </div>
                        </div>
                      </div>

                      {/* Routes map layout */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-start gap-3.5 p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                          <div className="mt-0.5 bg-white shadow-sm p-1.5 rounded-lg text-zinc-500 border border-zinc-200 shrink-0"><MapPin size={16}/></div>
                          <div>
                            <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Pickup From ({order.pickupZone})</div>
                            <div className="text-xs font-semibold text-zinc-900 mt-1">{order.pickupAddress}</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-3.5 p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                          <div className="mt-0.5 bg-white shadow-sm p-1.5 rounded-lg text-zinc-500 border border-zinc-200 shrink-0"><MapPin size={16}/></div>
                          <div>
                            <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Deliver To ({order.dropZone})</div>
                            <div className="text-xs font-semibold text-zinc-900 mt-1">{order.dropAddress}</div>
                          </div>
                        </div>
                      </div>

                      {/* Visual Routing Map */}
                      <div className="mb-6">
                        <IndianRouteMap
                          pickupAddress={order.pickupAddress}
                          dropAddress={order.dropAddress}
                          isAnimated={order.status === 'In Transit' || order.status === 'Picked Up' || order.status === 'Out for Delivery'}
                        />
                      </div>

                      {/* Dimensions details */}
                      <div className="flex gap-4 text-xs font-semibold text-zinc-500 border-b border-zinc-100 pb-5 mb-5">
                        <div>
                          <span>Physical weight:</span> <span className="text-zinc-800">{order.actualWeight} kg</span>
                        </div>
                        <span className="text-zinc-200">|</span>
                        <div>
                          <span>Volume:</span> <span className="text-zinc-800">{order.dimensions.l}x{order.dimensions.b}x{order.dimensions.h} cm</span>
                        </div>
                      </div>

                      {/* Stepwise actions for Courier agent */}
                      <div>
                        <div className="text-[10px] font-black text-zinc-400 mb-3.5 tracking-wider uppercase">Courier Dispatch Update Action</div>
                        <div className="flex flex-wrap gap-3">
                          {order.status === 'Assigned' && (
                            <button 
                              onClick={() => handleUpdate(order.id, 'Picked Up')} 
                              className="bg-zinc-950 hover:bg-zinc-850 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
                            >
                              Arrived & Confirm Package Pickup
                            </button>
                          )}
                          {order.status === 'Picked Up' && (
                            <button 
                              onClick={() => handleUpdate(order.id, 'In Transit')} 
                              className="bg-zinc-900 hover:bg-zinc-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
                            >
                              Dispatch Out of Hub (Start Transit)
                            </button>
                          )}
                          {order.status === 'In Transit' && (
                            <button 
                              onClick={() => handleUpdate(order.id, 'Out for Delivery')} 
                              className="bg-zinc-900 hover:bg-zinc-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
                            >
                              Load Vehicle (Mark Out for Delivery)
                            </button>
                          )}
                          {order.status === 'Out for Delivery' && (
                            <div className="flex gap-3 w-full sm:w-auto">
                              <button 
                                onClick={() => handleUpdate(order.id, 'Delivered')} 
                                className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                              >
                                <Check size={14}/> Complete Delivery Successful
                              </button>
                              <button 
                                onClick={() => {
                                  const reason = prompt("Enter specific failure reason:");
                                  if(reason) handleUpdate(order.id, 'Failed', reason);
                                }} 
                                className="flex-1 sm:flex-none bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                              >
                                <X size={14}/> Reject / Log Delivery Fail
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-zinc-100 items-center justify-between">
                          <span className="text-zinc-450 text-[10px] font-bold uppercase tracking-wider">Manual Override Status</span>
                          <select
                            value={order.status}
                            onChange={(e) => handleUpdate(order.id, e.target.value as any, 'Agent manual override')}
                            className="bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-zinc-700 focus:outline-none cursor-pointer"
                          >
                            {['Pending', 'Assigned', 'Picked Up', 'In Transit', 'Out for Delivery', 'Delivered', 'Failed', 'Rescheduled'].map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: DUTY LOGS & STATUS HUB SETTINGS */}
        {activeTab === 'duty' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 text-left">
            {/* Status card */}
            <div className="md:col-span-7 space-y-6">
              <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Availability Sandbox Status</h3>
                
                <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                  <div>
                    <span className="text-xs font-bold text-zinc-900">On-Duty / Dispatchable Status</span>
                    <p className="text-[11px] text-zinc-500 mt-0.5">Toggle whether admins can automatically route parcels to you.</p>
                  </div>
                  <button 
                    onClick={() => setAgentAvailable(me.id, !me.isAvailable)}
                    className="p-1 focus:outline-none cursor-pointer"
                  >
                    {me.isAvailable ? (
                      <ToggleRight size={44} className="text-zinc-950" />
                    ) : (
                      <ToggleLeft size={44} className="text-zinc-300" />
                    )}
                  </button>
                </div>

                <div className="mt-6 space-y-4">
                  <h4 className="text-xs font-bold text-zinc-700">Hub Assignment</h4>
                  <p className="text-xs text-zinc-500">Logistics operations require you to operate within specific physical coordinates. Switch your active Hub below.</p>
                  <div className="grid grid-cols-2 gap-3">
                    {['North','South','East','West'].map(hub => (
                      <button 
                        key={hub}
                        onClick={() => setAgentZone(me.id, hub as Zone)}
                        className={`p-3 rounded-xl border text-xs font-bold text-center cursor-pointer transition-all ${
                          me.currentZone === hub 
                            ? 'border-zinc-950 bg-zinc-50 text-zinc-950' 
                            : 'border-zinc-200 text-zinc-500 hover:bg-zinc-50/50'
                        }`}
                      >
                        {hub} Area Hub
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Vehicle profile */}
              <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Courier Vehicle Profile</h3>
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center border text-zinc-700">
                    <Truck size={20} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-zinc-800">Electric Utility Scooter</div>
                    <p className="text-[10px] text-zinc-400 mt-0.5">Volumetric Limit: 60x60x80cm • Weight Max: 25kg</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sandbox details list */}
            <div className="md:col-span-5">
              <div className="bg-zinc-950 rounded-2xl p-5 text-white space-y-4">
                <div className="flex items-center gap-2 text-emerald-400">
                  <Award size={16} />
                  <span className="text-xs font-black uppercase tracking-wider">Logistics Duty Sandbox</span>
                </div>
                <p className="text-xs text-zinc-300 leading-normal">
                  In this demo, you can instantly alter your active hub or availability. Routing algorithms configured in the Admin Control Room respect these parameters:
                </p>
                <div className="space-y-3 pt-2 text-[11px] font-medium text-zinc-400">
                  <div className="flex items-start gap-2">
                    <Check size={12} className="text-emerald-400 mt-0.5 shrink-0" />
                    <span>Auto-dispatcher only routes to agents registered in the same Pickup Zone.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check size={12} className="text-emerald-400 mt-0.5 shrink-0" />
                    <span>Unavailable agents will be ignored by the round-robin dispatcher queue.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: EARNINGS & HISTORIC COMMISSIONS REPORT */}
        {activeTab === 'earnings' && (
          <div className="space-y-6 text-left">
            {/* Bento metrics layout */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white border border-zinc-200/80 p-5 rounded-2xl shadow-sm">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Completed Deliveries</span>
                <div className="text-2xl font-black text-zinc-900 mt-1">{totalCompletedCount}</div>
                <span className="text-[10px] text-zinc-500 font-semibold mt-1 block">Accumulated overall</span>
              </div>
              <div className="bg-white border border-zinc-200/80 p-5 rounded-2xl shadow-sm">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Estimated Commissions</span>
                <div className="text-2xl font-black text-zinc-900 mt-1">₹{totalEarnings.toFixed(2)}</div>
                <span className="text-[10px] text-emerald-600 font-bold mt-1 block">Payout Cycle: Weekly</span>
              </div>
              <div className="bg-white border border-zinc-200/80 p-5 rounded-2xl shadow-sm">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Failed Payout Delivery Rate</span>
                <div className="text-2xl font-black text-zinc-900 mt-1">{failureRate}%</div>
                <span className="text-[10px] text-zinc-500 font-semibold mt-1 block">KPI Target: Less than 5%</span>
              </div>
            </div>

            {/* Custom chart widget */}
            <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">Weekly Performance Index</h3>
                <span className="text-[10px] bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded font-bold">Mon - Sun Activity</span>
              </div>
              
              <div className="h-28 flex items-end justify-between gap-3 px-4 pt-4 border-b border-zinc-100">
                {[
                  { day: 'Mon', count: 3 },
                  { day: 'Tue', count: 5 },
                  { day: 'Wed', count: me.id === 'a1' ? 7 : 0 },
                  { day: 'Thu', count: me.id === 'a1' ? 4 : 0 },
                  { day: 'Fri', count: me.id === 'a1' ? 8 : 0 },
                  { day: 'Sat', count: 0 },
                  { day: 'Sun', count: 0 },
                ].map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <span className="text-[10px] font-bold text-zinc-500">{d.count}</span>
                    <div 
                      className={`w-full rounded-t-md transition-all duration-500 ${
                        d.count > 0 ? 'bg-zinc-900' : 'bg-zinc-100'
                      }`} 
                      style={{ height: `${(d.count / 10) * 100}%` }}
                    />
                    <span className="text-[9px] font-bold text-zinc-400 mt-1 uppercase">{d.day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Completed payouts ledger */}
            <div className="bg-white border border-zinc-200/80 rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-zinc-100">
                <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wide">Historic Ledger Records</h3>
              </div>
              <div className="divide-y divide-zinc-100">
                {completedOrders.map(order => (
                  <div key={order.id} className="p-4 flex justify-between items-center text-xs">
                    <div>
                      <div className="font-bold text-zinc-800">{order.id}</div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">{order.dropAddress}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-emerald-600">+ ₹50.00 commission</div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">{order.status === 'Delivered' ? 'Paid' : 'Void'}</div>
                    </div>
                  </div>
                ))}
                {completedOrders.length === 0 && (
                  <div className="p-10 text-center text-xs text-zinc-400 font-semibold">
                    No completed ledger runs in the sandbox yet. Deliver custom packages to generate commissions logs!
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: AVAILABLE UNASSIGNED SHIPMENTS */}
        {activeTab === 'available' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                <Truck size={16} /> Open Cargo Pool
              </h2>
              <span className="text-xs bg-zinc-100 text-zinc-600 px-3 py-1 rounded-full font-bold">
                {orders.filter(o => !o.agentId && (o.status === 'Pending' || o.status === 'Rescheduled')).length} Shipments open
              </span>
            </div>

            {orders.filter(o => !o.agentId && (o.status === 'Pending' || o.status === 'Rescheduled')).length === 0 ? (
              <div className="text-center py-20 bg-white border border-zinc-200 rounded-2xl border-dashed">
                <Truck size={40} className="mx-auto text-zinc-300 mb-3 animate-pulse" />
                <h3 className="text-zinc-900 font-bold text-sm">No open shipments in pool</h3>
                <p className="text-zinc-500 text-xs mt-1.5">All packages are currently accepted or in transit.</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {orders.filter(o => !o.agentId && (o.status === 'Pending' || o.status === 'Rescheduled')).map(order => (
                  <div key={order.id} className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm relative overflow-hidden text-left">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-zinc-400"></div>
                    <div className="flex justify-between items-start gap-4 mb-4">
                      <div>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">AVAILABLE PACKAGE</span>
                        <h3 className="text-lg font-bold text-zinc-900">{order.id}</h3>
                        <p className="text-xs text-zinc-500 mt-1 font-semibold">Route: {order.pickupZone} → {order.dropZone}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-zinc-950 text-sm">₹{order.charge.toFixed(2)}</span>
                        <p className="text-[10px] text-zinc-400 font-bold uppercase">{order.paymentType}</p>
                      </div>
                    </div>
                    <div className="text-xs text-zinc-600 space-y-1 mb-4">
                      <p><span className="font-bold text-zinc-700">Pickup Address:</span> {order.pickupAddress}</p>
                      <p><span className="font-bold text-zinc-700">Dropoff Address:</span> {order.dropAddress}</p>
                    </div>
                    <button
                      onClick={() => assignAgent(order.id, me.id)}
                      className="bg-zinc-950 hover:bg-zinc-850 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
                    >
                      Claim & Receive Package
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
