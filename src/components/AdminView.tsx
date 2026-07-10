import React, { useState } from 'react';
import { useDemo } from '../store/DemoStore';
import { 
  Users, PackageSearch, Zap, Activity, Settings, Sliders, MapPin, 
  Truck, RefreshCw, Save, CheckCircle, Info, BarChart2, PieChart, Shield, Terminal, ArrowRight, Check, AlertTriangle 
} from 'lucide-react';
import { StatusBadge } from './CustomerView';
import { Zone, OrderStatus } from '../types';
import { motion } from 'motion/react';

export function AdminView() {
  const { 
    orders, agents, assignAgent, updateOrderStatus,
    rateCards, updateRateCards, codSurcharge, updateCodSurcharge, volumetricDivisor, updateVolumetricDivisor, apiLogs 
  } = useDemo();

  const [activeTab, setActiveTab] = useState<'orders' | 'rates' | 'agents' | 'analytics' | 'gateway'>('orders');

  // Filters for orders
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [zoneFilter, setZoneFilter] = useState<string>('all');
  const [agentFilter, setAgentFilter] = useState<string>('all');

  // Local state for configuration form
  const [localB2C, setLocalB2C] = useState(rateCards.B2C);
  const [localB2B, setLocalB2B] = useState(rateCards.B2B);
  const [localCod, setLocalCod] = useState(codSurcharge);
  const [localDivisor, setLocalDivisor] = useState(volumetricDivisor);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveConfigs = (e: React.FormEvent) => {
    e.preventDefault();
    updateRateCards({
      B2C: localB2C,
      B2B: localB2B
    });
    updateCodSurcharge(localCod);
    updateVolumetricDivisor(localDivisor);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Filter orders
  const filteredOrders = orders.filter(o => {
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchZone = zoneFilter === 'all' || o.pickupZone === zoneFilter || o.dropZone === zoneFilter;
    const matchAgent = agentFilter === 'all' || o.agentId === agentFilter;
    return matchStatus && matchZone && matchAgent;
  });

  // Calculate advanced stats
  const totalRevenue = orders.reduce((acc, o) => acc + o.charge, 0);
  const pendingCount = orders.filter(o => o.status === 'Pending').length;
  const transitCount = orders.filter(o => ['Picked Up', 'In Transit', 'Out for Delivery'].includes(o.status)).length;
  const deliveredCount = orders.filter(o => o.status === 'Delivered').length;
  const failedCount = orders.filter(o => o.status === 'Failed').length;

  const b2bCount = orders.filter(o => o.orderType === 'B2B').length;
  const b2cCount = orders.filter(o => o.orderType === 'B2C').length;

  // Zone statistics
  const zoneDistribution = {
    North: orders.filter(o => o.pickupZone === 'North').length,
    South: orders.filter(o => o.pickupZone === 'South').length,
    East: orders.filter(o => o.pickupZone === 'East').length,
    West: orders.filter(o => o.pickupZone === 'West').length,
  };

  const metrics = [
    { label: 'Total Orders', value: orders.length, icon: PackageSearch, color: 'text-zinc-900 border-zinc-200' },
    { label: 'Active Agents', value: agents.filter(a => a.isAvailable).length, icon: Users, color: 'text-blue-600 border-blue-150' },
    { label: 'Platform Revenue', value: `₹${totalRevenue.toFixed(2)}`, icon: Zap, color: 'text-emerald-600 border-emerald-150' },
    { label: 'Failed Attempts', value: failedCount, icon: Activity, danger: true, color: 'text-red-600 border-red-150' },
  ];

  const allStatuses: OrderStatus[] = [
    'Pending', 'Assigned', 'Picked Up', 'In Transit', 'Out for Delivery', 'Delivered', 'Failed', 'Rescheduled'
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 selection:bg-zinc-150 text-left">
      {/* Header with quick tab selection */}
      <div className="mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-zinc-200/80">
        <div>
          <span className="text-xs font-bold text-zinc-400 tracking-wider uppercase mb-1 block">Logistics Command Center</span>
          <h1 className="text-3xl font-black tracking-tight text-zinc-900">Operations Suite</h1>
          <p className="text-zinc-500 text-sm mt-0.5">Configure live rates, override dispatch states, view live API traces, and audit courier logs.</p>
        </div>
        
        {/* Tab Selector */}
        <div className="flex flex-wrap gap-1 bg-zinc-100 p-1 rounded-xl border border-zinc-200 shrink-0">
          <button 
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'orders' ? 'bg-white text-zinc-950 shadow-sm border border-zinc-200/50' : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <Sliders size={13} />
            Shipments & Dispatches
          </button>
          <button 
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'analytics' ? 'bg-white text-zinc-950 shadow-sm border border-zinc-200/50' : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <BarChart2 size={13} />
            Ops Analytics
          </button>
          <button 
            onClick={() => setActiveTab('rates')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'rates' ? 'bg-white text-zinc-950 shadow-sm border border-zinc-200/50' : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <Settings size={13} />
            Pricing Configuration
          </button>
          <button 
            onClick={() => setActiveTab('agents')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'agents' ? 'bg-white text-zinc-950 shadow-sm border border-zinc-200/50' : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <Truck size={13} />
            Courier Directory
          </button>
          <button 
            onClick={() => setActiveTab('gateway')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'gateway' ? 'bg-white text-zinc-950 shadow-sm border border-zinc-200/50' : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <Terminal size={13} />
            API Sandbox Logs
          </button>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {metrics.map((m, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 8 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: i * 0.04 }} 
            key={i} 
            className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">{m.label}</div>
                <div className={`text-2xl font-black tracking-tight ${m.danger && m.value > 0 ? 'text-red-600' : 'text-zinc-900'}`}>{m.value}</div>
              </div>
              <div className={`p-2 rounded-xl border bg-zinc-50 shrink-0 ${m.color}`}>
                <m.icon size={16} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* TAB 1: ORDERS & LIVE DISPATCH BOARD */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {/* Query Filters Bar */}
          <div className="bg-white border border-zinc-200 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-3 items-center w-full">
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mr-1">Query Filters</span>
              
              {/* Status Filter */}
              <div>
                <select 
                  value={statusFilter} 
                  onChange={e => setStatusFilter(e.target.value)}
                  className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-zinc-700 focus:outline-none cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  {allStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Zone Filter */}
              <div>
                <select 
                  value={zoneFilter} 
                  onChange={e => setZoneFilter(e.target.value)}
                  className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-zinc-700 focus:outline-none cursor-pointer"
                >
                  <option value="all">All Hub Zones</option>
                  {['North', 'South', 'East', 'West'].map(z => <option key={z} value={z}>{z} Hub Zone</option>)}
                </select>
              </div>

              {/* Agent Filter */}
              <div>
                <select 
                  value={agentFilter} 
                  onChange={e => setAgentFilter(e.target.value)}
                  className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-zinc-700 focus:outline-none cursor-pointer"
                >
                  <option value="all">All Agents</option>
                  {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
            </div>

            {/* Reset Button */}
            {(statusFilter !== 'all' || zoneFilter !== 'all' || agentFilter !== 'all') && (
              <button 
                onClick={() => { setStatusFilter('all'); setZoneFilter('all'); setAgentFilter('all'); }}
                className="text-xs font-bold text-zinc-500 hover:text-zinc-900 border border-zinc-200 rounded-lg px-2.5 py-1.5 hover:bg-zinc-50 cursor-pointer transition-colors"
              >
                Reset
              </button>
            )}
          </div>

          {/* Order Cards */}
          <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-200 bg-zinc-50/50 flex flex-wrap justify-between items-center gap-2">
              <h2 className="font-bold text-zinc-900 text-xs uppercase tracking-wider">Live Shipments Ledger</h2>
              <div className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
                <RefreshCw size={10} className="animate-spin" />
                Live Engine Synchronization Active
              </div>
            </div>

            <div className="divide-y divide-zinc-100">
              {filteredOrders.map((order) => (
                <div key={order.id} className="p-4 hover:bg-zinc-50/50 transition-colors">
                  <div className="flex flex-wrap gap-3 items-start justify-between">
                    {/* Left: order info */}
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-zinc-900 text-xs">{order.id}</span>
                        <StatusBadge status={order.status} />
                        <span className="text-[10px] text-zinc-400 font-bold uppercase">{order.orderType} • {order.paymentType}</span>
                      </div>
                      <div className="text-xs text-zinc-700 font-bold flex items-center gap-1.5 flex-wrap">
                        <span>{order.pickupZone}</span>
                        <span className="text-zinc-300">→</span>
                        <span>{order.dropZone}</span>
                      </div>
                      <div className="text-[11px] text-zinc-500">
                        {order.agentId ? (
                          <span className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-zinc-950 rounded-full inline-block"></span>
                            <span className="font-semibold">{agents.find(a => a.id === order.agentId)?.name || 'Courier Agent'}</span>
                          </span>
                        ) : (
                          <span className="italic text-zinc-400">Unassigned</span>
                        )}
                      </div>
                    </div>
                    {/* Right: fee + actions */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className="font-bold text-zinc-900 text-sm">₹{order.charge.toFixed(2)}</span>
                      <div className="flex flex-wrap gap-2 justify-end">
                        {(order.status === 'Pending' || order.status === 'Rescheduled') && (
                          <button
                            onClick={() => assignAgent(order.id)}
                            className="text-[10px] font-bold bg-zinc-950 hover:bg-zinc-800 text-white px-3 py-1.5 rounded-lg transition-colors cursor-pointer shadow-sm"
                          >
                            Assign Courier
                          </button>
                        )}
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus, 'Platform Admin', 'Manual dispatch change')}
                          className="bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-zinc-700 focus:outline-none cursor-pointer"
                        >
                          {allStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {filteredOrders.length === 0 && (
                <div className="px-6 py-16 text-center text-zinc-400">
                  <PackageSearch size={32} className="mx-auto mb-2 text-zinc-300" />
                  <div>No dispatches found matching your filters.</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: OPERATIONS ANALYTICS & HUB DEMAND LOAD MAP */}
      {activeTab === 'analytics' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pie chart summary */}
            <div className="bg-white border border-zinc-200/80 p-6 rounded-2xl shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 mb-4 flex items-center gap-1.5">
                <PieChart size={14} /> Account Contract Share
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-zinc-500">Commercial (B2B) Contract</span>
                  <span className="text-zinc-900">{b2bCount} Orders ({orders.length > 0 ? ((b2bCount/orders.length)*100).toFixed(0) : 0}%)</span>
                </div>
                <div className="w-full bg-zinc-100 h-2.5 rounded-full overflow-hidden flex">
                  <div className="bg-zinc-950 h-full" style={{ width: `${orders.length > 0 ? (b2bCount/orders.length)*100 : 0}%` }}></div>
                  <div className="bg-zinc-300 h-full" style={{ width: `${orders.length > 0 ? (b2cCount/orders.length)*100 : 100}%` }}></div>
                </div>
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-zinc-500">Standard (B2C) Consumer</span>
                  <span className="text-zinc-900">{b2cCount} Orders ({orders.length > 0 ? ((b2cCount/orders.length)*100).toFixed(0) : 0}%)</span>
                </div>
              </div>
            </div>

            {/* Courier dispatch ratios */}
            <div className="bg-white border border-zinc-200/80 p-6 rounded-2xl shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 mb-4 flex items-center gap-1.5">
                <Activity size={14} /> Execution Success index
              </h3>
              <div className="space-y-3.5 text-xs font-bold text-zinc-700">
                <div className="flex justify-between items-center">
                  <span>Delivered successfully</span>
                  <span className="text-emerald-600">{deliveredCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Cargo In-Transit</span>
                  <span className="text-blue-600">{transitCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Queued Pending</span>
                  <span className="text-zinc-500">{pendingCount}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-zinc-100">
                  <span>Total System Orders</span>
                  <span className="text-zinc-900">{orders.length}</span>
                </div>
              </div>
            </div>

            {/* Average revenue card */}
            <div className="bg-white border border-zinc-200/80 p-6 rounded-2xl shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 mb-4 flex items-center gap-1.5">
                <Zap size={14} /> Ticket Average (AOV)
              </h3>
              <div className="space-y-2">
                <span className="text-2xl font-black text-zinc-900 block">
                  ₹{orders.length > 0 ? (totalRevenue / orders.length).toFixed(2) : '0.00'}
                </span>
                <p className="text-[11px] text-zinc-400 font-semibold leading-normal">
                  Average billing fee per delivery. Volumetric divisors and inter-hub weight surcharges affect this threshold in real time.
                </p>
              </div>
            </div>
          </div>

          {/* Regional Demand Loads bar chart */}
          <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 mb-6 flex items-center gap-1.5">
              <BarChart2 size={14} /> Regional Hub Volume Distribution (Load Analysis)
            </h3>
            
            <div className="space-y-4">
              {Object.entries(zoneDistribution).map(([zone, count]) => {
                const percentage = orders.length > 0 ? (count / orders.length) * 100 : 0;
                return (
                  <div key={zone} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-zinc-800">{zone} Zone Hub</span>
                      <span className="text-zinc-500">{count} parcel{count !== 1 && 's'} ({percentage.toFixed(0)}%)</span>
                    </div>
                    <div className="w-full bg-zinc-100 h-3 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.6 }}
                        className="bg-zinc-900 h-full rounded-full"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PLATFORM LOGISTICS CONFIGURATOR */}
      {activeTab === 'rates' && (
        <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm p-6 max-w-3xl mx-auto">
          <div className="flex items-center gap-2.5 pb-4 border-b border-zinc-100 mb-6">
            <Settings size={18} className="text-zinc-800" />
            <div>
              <h2 className="font-bold text-zinc-900 text-base">Rate Card Rules & Surcharges</h2>
              <p className="text-xs text-zinc-400 mt-0.5">Control pricing matrices, weight multipliers, and volumetric divisors</p>
            </div>
          </div>

          {saveSuccess && (
            <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3.5 rounded-xl flex items-center gap-2">
              <CheckCircle size={14} className="text-emerald-600" />
              <span className="font-bold">Logistics rules updated and synchronized globally!</span>
            </div>
          )}

          <form onSubmit={handleSaveConfigs} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* B2C Configuration card */}
              <div className="bg-zinc-50 p-5 rounded-2xl border border-zinc-200/60">
                <h3 className="text-xs font-bold text-zinc-800 mb-4 flex items-center gap-2 uppercase tracking-wider">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                  Standard B2C Contract
                </h3>
                <div className="space-y-3.5 text-xs font-semibold text-zinc-600">
                  <div>
                    <label className="text-[10px] text-zinc-400 block mb-1 uppercase font-bold">Intra-Zone Local Base Fee (₹)</label>
                    <input 
                      type="number" 
                      required 
                      value={localB2C.intraZone}
                      onChange={e => setLocalB2C({...localB2C, intraZone: Number(e.target.value)})}
                      className="w-full border border-zinc-200 bg-white rounded-lg p-2.5 text-xs font-bold outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400 block mb-1 uppercase font-bold">Inter-Zone Hub Base Fee (₹)</label>
                    <input 
                      type="number" 
                      required 
                      value={localB2C.interZone}
                      onChange={e => setLocalB2C({...localB2C, interZone: Number(e.target.value)})}
                      className="w-full border border-zinc-200 bg-white rounded-lg p-2.5 text-xs font-bold outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400 block mb-1 uppercase font-bold">Incremental Per-Kg weight fee (₹)</label>
                    <input 
                      type="number" 
                      required 
                      value={localB2C.perKg}
                      onChange={e => setLocalB2C({...localB2C, perKg: Number(e.target.value)})}
                      className="w-full border border-zinc-200 bg-white rounded-lg p-2.5 text-xs font-bold outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* B2B Configuration card */}
              <div className="bg-zinc-50 p-5 rounded-2xl border border-zinc-200/60">
                <h3 className="text-xs font-bold text-zinc-800 mb-4 flex items-center gap-2 uppercase tracking-wider">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  Commercial B2B Contract
                </h3>
                <div className="space-y-3.5 text-xs font-semibold text-zinc-600">
                  <div>
                    <label className="text-[10px] text-zinc-400 block mb-1 uppercase font-bold">Intra-Zone Local Base Fee (₹)</label>
                    <input 
                      type="number" 
                      required 
                      value={localB2B.intraZone}
                      onChange={e => setLocalB2B({...localB2B, intraZone: Number(e.target.value)})}
                      className="w-full border border-zinc-200 bg-white rounded-lg p-2.5 text-xs font-bold outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400 block mb-1 uppercase font-bold">Inter-Zone Hub Base Fee (₹)</label>
                    <input 
                      type="number" 
                      required 
                      value={localB2B.interZone}
                      onChange={e => setLocalB2B({...localB2B, interZone: Number(e.target.value)})}
                      className="w-full border border-zinc-200 bg-white rounded-lg p-2.5 text-xs font-bold outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400 block mb-1 uppercase font-bold">Incremental Per-Kg weight fee (₹)</label>
                    <input 
                      type="number" 
                      required 
                      value={localB2B.perKg}
                      onChange={e => setLocalB2B({...localB2B, perKg: Number(e.target.value)})}
                      className="w-full border border-zinc-200 bg-white rounded-lg p-2.5 text-xs font-bold outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-zinc-150" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-1.5">COD Payment Surcharge (₹)</label>
                <input 
                  type="number" 
                  required 
                  value={localCod}
                  onChange={e => setLocalCod(Number(e.target.value))}
                  className="w-full border border-zinc-200 bg-white rounded-lg p-2.5 text-xs font-bold outline-none"
                />
                <span className="text-[10px] text-zinc-400 mt-1 block font-semibold">Additional surcharge applied to B2B/B2C Cash on Delivery.</span>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-1.5">Volumetric Weight Divisor</label>
                <input 
                  type="number" 
                  required 
                  value={localDivisor}
                  onChange={e => setLocalDivisor(Number(e.target.value))}
                  className="w-full border border-zinc-200 bg-white rounded-lg p-2.5 text-xs font-bold outline-none"
                />
                <span className="text-[10px] text-zinc-400 mt-1 block font-semibold">Dimensional weight formula: (L x B x H) / Divisor</span>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-100 flex justify-end">
              <button 
                type="submit" 
                className="bg-zinc-950 hover:bg-zinc-850 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Save size={14} />
                Save Logistics Rules
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 4: COURIER AGENT REGISTRY DIRECTORY */}
      {activeTab === 'agents' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {agents.map((agent) => {
            const agentCurrentDeliveries = orders.filter(o => o.agentId === agent.id && !['Delivered', 'Failed', 'Rescheduled'].includes(o.status));
            return (
              <motion.div 
                whileHover={{ y: -2 }}
                key={agent.id} 
                className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between text-left"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-center text-zinc-600">
                        <Truck size={18} />
                      </div>
                      <div>
                        <h3 className="font-bold text-zinc-900 text-sm">{agent.name}</h3>
                        <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">{agent.id}</span>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      agent.isAvailable 
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-100' 
                        : 'bg-amber-50 text-amber-800 border-amber-100'
                    }`}>
                      {agent.isAvailable ? 'Idle / On Call' : 'Delivering'}
                    </span>
                  </div>

                  <div className="space-y-2.5 mt-4 text-xs font-semibold">
                    <div className="flex justify-between py-1.5 border-b border-zinc-100">
                      <span className="text-zinc-400 flex items-center gap-1"><MapPin size={12}/> Operating Hub</span>
                      <span className="text-zinc-700 font-bold">{agent.currentZone} Zone</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-zinc-100">
                      <span className="text-zinc-400">Current Load Sheet</span>
                      <span className="text-zinc-700 font-bold">{agentCurrentDeliveries.length} orders pending</span>
                    </div>
                  </div>
                </div>

                {agentCurrentDeliveries.length > 0 && (
                  <div className="mt-5 pt-4 border-t border-zinc-100">
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-2">Manifest cargo</span>
                    <div className="space-y-1.5">
                      {agentCurrentDeliveries.map(o => (
                        <div key={o.id} className="bg-zinc-50 p-2 rounded-lg border border-zinc-150 flex justify-between items-center text-xs">
                          <span className="font-bold text-zinc-800">{o.id}</span>
                          <StatusBadge status={o.status} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* TAB 5: SIMULATED API GATEWAY TERMINAL */}
      {activeTab === 'gateway' && (
        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
            <div className="flex items-center gap-2.5 text-zinc-200">
              <Terminal size={18} className="text-emerald-400 animate-pulse" />
              <div>
                <h3 className="font-bold text-zinc-100 text-sm uppercase tracking-wide">Live Developer API Trace Stream</h3>
                <p className="text-[10px] text-zinc-500 mt-0.5">Capturing real-time system HTTP payloads & responses</p>
              </div>
            </div>
            <span className="text-[10px] bg-zinc-900 text-emerald-400 px-2 py-1 rounded border border-zinc-800 font-bold font-mono">200 OK Connection</span>
          </div>

          <div className="space-y-4 max-h-[450px] overflow-y-auto custom-scrollbar">
            {apiLogs.map((log) => (
              <div key={log.id} className="border-b border-zinc-900 pb-4 last:border-0">
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      log.method === 'POST' ? 'bg-emerald-950 text-emerald-400' :
                      log.method === 'GET' ? 'bg-blue-950 text-blue-400' : 'bg-zinc-900 text-zinc-400'
                    }`}>{log.method}</span>
                    <span className="text-zinc-300 font-semibold">{log.endpoint}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    <span className={`font-bold ${log.status >= 200 && log.status < 300 ? 'text-emerald-400' : 'text-red-400'}`}>{log.status}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] font-mono leading-relaxed">
                  <div className="bg-zinc-900/40 p-2.5 rounded border border-zinc-900 text-zinc-400">
                    <span className="text-[10px] text-zinc-500 font-bold block mb-1">Request Payload JSON</span>
                    <pre className="whitespace-pre-wrap break-all">{log.payload ? JSON.stringify(JSON.parse(log.payload), null, 2) : 'No payload'}</pre>
                  </div>
                  <div className="bg-zinc-900/40 p-2.5 rounded border border-zinc-900 text-zinc-400">
                    <span className="text-[10px] text-zinc-500 font-bold block mb-1">Response JSON</span>
                    <pre className="whitespace-pre-wrap break-all">{log.response ? JSON.stringify(JSON.parse(log.response), null, 2) : 'No response'}</pre>
                  </div>
                </div>
              </div>
            ))}

            {apiLogs.length === 0 && (
              <div className="text-center py-16 text-zinc-500 font-mono text-xs">
                No active API traces in memory yet. Create orders, book, or override dispatches to generate sandbox requests!
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
