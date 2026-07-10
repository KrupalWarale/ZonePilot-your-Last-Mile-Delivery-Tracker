import React, { useState } from 'react';
import { useDemo } from '../store/DemoStore';
import { 
  Package, Plus, MapPin, Truck, XCircle, Clock, Search, 
  ChevronRight, Calculator, FileCode, CheckCircle, Navigation, Info, ShieldCheck, RefreshCw, Key, HelpCircle 
} from 'lucide-react';
import { calculateRate } from '../utils/rateEngine';
import { Zone } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { IndianRouteMap } from './IndianRouteMap';

export const StatusBadge = ({ status }: { status: string }) => {
  const colors: Record<string, string> = {
    'Pending': 'bg-amber-100 text-amber-800 border-amber-200',
    'Assigned': 'bg-blue-100 text-blue-800 border-blue-200',
    'Picked Up': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'In Transit': 'bg-purple-100 text-purple-800 border-purple-200',
    'Out for Delivery': 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200',
    'Delivered': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'Failed': 'bg-red-100 text-red-800 border-red-200',
    'Rescheduled': 'bg-orange-100 text-orange-800 border-orange-200',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colors[status] || 'bg-zinc-100 text-zinc-800'}`}>
      {status}
    </span>
  );
};

export function CustomerView() {
  const { orders, addOrder, rescheduleOrder, currentUser, rateCards, codSurcharge, volumetricDivisor, updateOrderStatus } = useDemo();
  const [activeTab, setActiveTab] = useState<'deliveries' | 'book' | 'calculator' | 'developer'>('deliveries');
  const [activeOrder, setActiveOrder] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Rate calculator subpage states
  const [calcForm, setCalcForm] = useState({
    pickup: 'North' as Zone,
    drop: 'South' as Zone,
    pickupAddress: '',
    dropAddress: '',
    l: 10, b: 10, h: 10,
    weight: 1.0,
    type: 'B2C' as 'B2B' | 'B2C',
    cod: 'Prepaid' as 'Prepaid' | 'COD'
  });

  // Developer Keys tab states
  const [webhookUrl, setWebhookUrl] = useState('https://mystore.com/webhooks/zonepilot');
  const [webhookSaved, setWebhookSaved] = useState(false);
  const [apiCopied, setApiCopied] = useState(false);

  const myOrders = orders.filter(o => o.customerId === currentUser?.id);
  const filteredOrders = myOrders.filter(o => 
    o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.pickupAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.dropAddress.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const calculatedRateResult = calculateRate(
    calcForm.pickup, calcForm.drop, calcForm.l, calcForm.b, calcForm.h, calcForm.weight, calcForm.type, calcForm.cod,
    rateCards, codSurcharge, volumetricDivisor
  );

  const selectedOrderDetails = orders.find(o => o.id === activeOrder);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Tab bar header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-zinc-200/80 mb-8 gap-4">
        <div>
          <span className="text-xs font-bold text-zinc-400 tracking-wider uppercase mb-1 block">Customer Portal</span>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
            {activeTab === 'deliveries' && 'My Deliveries'}
            {activeTab === 'book' && 'Book a Shipment'}
            {activeTab === 'calculator' && 'Instant Rate Quote'}
            {activeTab === 'developer' && 'Developer Integrations'}
          </h1>
          <p className="text-zinc-500 text-sm mt-0.5">
            {activeTab === 'deliveries' && 'Track live progress, download invoices, or request deliveries.'}
            {activeTab === 'book' && 'Place new parcel orders into the dispatcher queue instantly.'}
            {activeTab === 'calculator' && 'Play around with weight and dimensional parameters to simulate cost.'}
            {activeTab === 'developer' && 'Generate API keys and connect your e-commerce platform.'}
          </p>
        </div>

        {/* Customer sub-navigation tabs */}
        <div className="flex flex-wrap gap-1 bg-zinc-100 p-1 rounded-xl border border-zinc-200 shrink-0">
          <button 
            onClick={() => { setActiveTab('deliveries'); setActiveOrder(null); }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'deliveries' ? 'bg-white text-zinc-950 shadow-sm border border-zinc-200/50' : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <Package size={14} />
            Shipment Ledger
          </button>
          <button 
            onClick={() => setActiveTab('book')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'book' ? 'bg-white text-zinc-950 shadow-sm border border-zinc-200/50' : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <Plus size={14} />
            Book Shipment
          </button>
          <button 
            onClick={() => setActiveTab('calculator')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'calculator' ? 'bg-white text-zinc-950 shadow-sm border border-zinc-200/50' : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <Calculator size={14} />
            Rate Engine Calculator
          </button>
          <button 
            onClick={() => setActiveTab('developer')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'developer' ? 'bg-white text-zinc-950 shadow-sm border border-zinc-200/50' : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <FileCode size={14} />
            API & Store Sync
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main interactive panel */}
        <div className={`${activeOrder ? 'lg:col-span-7' : 'lg:col-span-12'} transition-all duration-300`}>
          
          {/* TAB 1: SHIPMENTS LEDGER */}
          {activeTab === 'deliveries' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input 
                    type="text" 
                    placeholder="Search by Order ID, address..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-xl pl-10 pr-4 py-2.5 text-sm placeholder-zinc-400 focus:outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 transition-all"
                  />
                </div>
                <button 
                  onClick={() => setActiveTab('book')}
                  className="bg-zinc-900 hover:bg-zinc-850 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus size={14} />
                  New Delivery Booking
                </button>
              </div>

              <div className="grid gap-3">
                {filteredOrders.map((order, idx) => {
                  const isCurrentActive = activeOrder === order.id;
                  return (
                    <motion.div 
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      key={order.id}
                      onClick={() => setActiveOrder(isCurrentActive ? null : order.id)}
                      className={`bg-white border text-left p-4 rounded-xl flex items-center justify-between gap-4 transition-all cursor-pointer ${
                        isCurrentActive 
                          ? 'border-zinc-900 shadow-md ring-1 ring-zinc-900/5' 
                          : 'border-zinc-200/80 hover:border-zinc-350 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${
                          isCurrentActive ? 'bg-zinc-950 text-white border-zinc-950' : 'bg-zinc-50 text-zinc-600 border-zinc-200/50'
                        }`}>
                          <Package size={18} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-bold text-zinc-900 text-sm tracking-tight">{order.id}</span>
                            <StatusBadge status={order.status} />
                          </div>
                          <div className="text-xs text-zinc-500 font-medium flex items-center gap-1.5 truncate">
                            <span className="font-bold text-zinc-700">{order.pickupZone}</span>
                            <span>→</span>
                            <span className="font-bold text-zinc-700">{order.dropZone}</span>
                            <span className="text-zinc-300">•</span>
                            <span className="truncate">{order.dropAddress}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right">
                          <div className="text-sm font-bold text-zinc-900">₹{order.charge.toFixed(2)}</div>
                          <div className="text-[10px] text-zinc-400 font-semibold uppercase">{order.paymentType}</div>
                        </div>
                        <ChevronRight size={16} className={`text-zinc-400 transition-transform ${isCurrentActive ? 'rotate-90 text-zinc-800' : ''}`} />
                      </div>
                    </motion.div>
                  );
                })}

                {filteredOrders.length === 0 && (
                  <div className="text-center py-20 bg-white border border-zinc-200/80 rounded-2xl border-dashed">
                    <Package size={36} className="mx-auto text-zinc-300 mb-3" />
                    <h3 className="text-zinc-900 font-bold text-sm">No packages found</h3>
                    <p className="text-zinc-500 text-xs mt-1">Try adapting your query filters or create a new parcel order.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: BOOK SHIPMENT WIZARD */}
          {activeTab === 'book' && (
            <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm">
              <BookingWizard onComplete={() => setActiveTab('deliveries')} />
            </div>
          )}

          {/* TAB 3: RATE ENGINE CALCULATOR */}
          {activeTab === 'calculator' && (
            <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-2 pb-4 border-b border-zinc-150">
                <Calculator size={18} className="text-zinc-800" />
                <h2 className="font-bold text-zinc-900 text-sm uppercase tracking-wider">Dynamic Sandbox Estimator</h2>
              </div>

              {/* Map Router Centerpiece */}
              <IndianRouteMap 
                pickupAddress={calcForm.pickupAddress}
                dropAddress={calcForm.dropAddress}
                onPickupChange={(address) => setCalcForm(prev => ({ ...prev, pickupAddress: address }))}
                onDropChange={(address) => setCalcForm(prev => ({ ...prev, dropAddress: address }))}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Calculator fields */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-zinc-500 block mb-1.5">Pickup Zone</label>
                      <select 
                        value={calcForm.pickup} 
                        onChange={e => setCalcForm({...calcForm, pickup: e.target.value as Zone})}
                        className="w-full border border-zinc-200 rounded-lg p-2.5 text-xs font-bold bg-white focus:outline-none focus:border-zinc-400 cursor-pointer"
                      >
                        {['North','South','East','West'].map(z => <option key={z} value={z}>{z} Hub</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-zinc-500 block mb-1.5">Dropoff Zone</label>
                      <select 
                        value={calcForm.drop} 
                        onChange={e => setCalcForm({...calcForm, drop: e.target.value as Zone})}
                        className="w-full border border-zinc-200 rounded-lg p-2.5 text-xs font-bold bg-white focus:outline-none focus:border-zinc-400 cursor-pointer"
                      >
                        {['North','South','East','West'].map(z => <option key={z} value={z}>{z} Hub</option>)}
                      </select>
                    </div>
                  </div>

                  <hr className="border-zinc-100" />

                  <div>
                    <label className="text-xs font-semibold text-zinc-500 block mb-2">Package Dimensions (cm)</label>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <span className="text-[10px] text-zinc-400 font-bold block mb-1">L</span>
                        <input 
                          type="number" 
                          value={calcForm.l} 
                          onChange={e => setCalcForm({...calcForm, l: Math.max(1, +e.target.value)})}
                          className="w-full border border-zinc-200 rounded-lg p-2 text-xs font-bold focus:outline-none focus:border-zinc-400"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-400 font-bold block mb-1">W</span>
                        <input 
                          type="number" 
                          value={calcForm.b} 
                          onChange={e => setCalcForm({...calcForm, b: Math.max(1, +e.target.value)})}
                          className="w-full border border-zinc-200 rounded-lg p-2 text-xs font-bold focus:outline-none focus:border-zinc-400"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-400 font-bold block mb-1">H</span>
                        <input 
                          type="number" 
                          value={calcForm.h} 
                          onChange={e => setCalcForm({...calcForm, h: Math.max(1, +e.target.value)})}
                          className="w-full border border-zinc-200 rounded-lg p-2 text-xs font-bold focus:outline-none focus:border-zinc-400"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-zinc-500 block mb-1.5">Actual Weight (kg)</label>
                      <input 
                        type="number" 
                        step="0.1"
                        value={calcForm.weight} 
                        onChange={e => setCalcForm({...calcForm, weight: Math.max(0.1, +e.target.value)})}
                        className="w-full border border-zinc-200 rounded-lg p-2.5 text-xs font-bold focus:outline-none focus:border-zinc-400"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-zinc-500 block mb-1.5">Payment Option</label>
                      <select 
                        value={calcForm.cod} 
                        onChange={e => setCalcForm({...calcForm, cod: e.target.value as any})}
                        className="w-full border border-zinc-200 rounded-lg p-2.5 text-xs font-bold bg-white focus:outline-none focus:border-zinc-400 cursor-pointer"
                      >
                        <option value="Prepaid">Prepaid Balance</option>
                        <option value="COD">Cash on Delivery (COD)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-500 block mb-1.5">Pricing Contract</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        type="button"
                        onClick={() => setCalcForm({...calcForm, type: 'B2C'})}
                        className={`p-2.5 rounded-lg border text-xs font-bold flex flex-col items-center gap-1 cursor-pointer transition-all ${
                          calcForm.type === 'B2C' 
                            ? 'border-zinc-900 bg-zinc-50 text-zinc-900' 
                            : 'border-zinc-200 text-zinc-500'
                        }`}
                      >
                        <span>Standard B2C</span>
                        <span className="text-[9px] text-zinc-400 font-medium">For Consumers</span>
                      </button>
                      <button 
                        type="button"
                        onClick={() => setCalcForm({...calcForm, type: 'B2B'})}
                        className={`p-2.5 rounded-lg border text-xs font-bold flex flex-col items-center gap-1 cursor-pointer transition-all ${
                          calcForm.type === 'B2B' 
                            ? 'border-zinc-900 bg-zinc-50 text-zinc-900' 
                            : 'border-zinc-200 text-zinc-500'
                        }`}
                      >
                        <span>Commercial B2B</span>
                        <span className="text-[9px] text-zinc-400 font-medium">High Volume</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Calculations details output */}
                <div className="bg-zinc-50 p-5 rounded-2xl border border-zinc-200 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Rate Calculation breakdown</div>
                    
                    <div className="space-y-2.5 text-xs font-semibold text-zinc-600">
                      <div className="flex justify-between py-1.5 border-b border-dashed border-zinc-200">
                        <span>Route Type</span>
                        <span className="text-zinc-800">{calcForm.pickup === calcForm.drop ? 'Intra-Zone (Local Hub)' : 'Inter-Zone (Cross Hub)'}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-dashed border-zinc-200">
                        <span>Actual Weight</span>
                        <span className="text-zinc-800">{calcForm.weight.toFixed(2)} kg</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-dashed border-zinc-200">
                        <span>Dimensional Weight</span>
                        <span className="text-zinc-800">{calculatedRateResult.volumetricWeight.toFixed(2)} kg</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-dashed border-zinc-200">
                        <span>Billable Weight</span>
                        <span className="text-zinc-800 font-bold">{calculatedRateResult.billableWeight.toFixed(2)} kg</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-dashed border-zinc-200">
                        <span>COD Surcharge fee</span>
                        <span className="text-zinc-800">₹{calcForm.cod === 'COD' ? codSurcharge.toFixed(2) : '0.00'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-zinc-200/80 mt-6 flex justify-between items-center">
                    <div>
                      <div className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Estimated Fee</div>
                      <div className="text-3xl font-black text-zinc-900 mt-1">₹{calculatedRateResult.totalCharge.toFixed(2)}</div>
                    </div>
                    <button 
                      onClick={() => {
                        setCalcForm(calcForm);
                        setActiveTab('book');
                      }}
                      className="bg-zinc-900 hover:bg-zinc-850 text-white font-bold text-xs px-4.5 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                    >
                      Book with this Rate
                      <ChevronRight size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DEVELOPER KEYS */}
          {activeTab === 'developer' && (
            <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-2.5 pb-4 border-b border-zinc-150">
                <Key size={18} className="text-zinc-800" />
                <div>
                  <h2 className="font-bold text-zinc-900 text-sm uppercase tracking-wider">Store API Keys & Webhooks</h2>
                  <p className="text-xs text-zinc-400 mt-0.5">Integrate WooCommerce, Shopify or Custom API systems</p>
                </div>
              </div>

              {webhookSaved && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3.5 rounded-xl flex items-center gap-2">
                  <CheckCircle size={15} className="text-emerald-600" />
                  <span>Webhook URL endpoint configured successfully and registered in system gateway!</span>
                </div>
              )}

              <div className="space-y-4">
                <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-xl">
                  <div className="flex justify-between items-center mb-2.5">
                    <span className="text-xs font-bold text-zinc-700">Production Secret API Key</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200 font-bold">Active</span>
                  </div>
                  <div className="flex gap-2">
                    <input 
                      type="password" 
                      readOnly 
                      value="zp_secret_prod_84920489320942_krupal_vit_edu_verified"
                      className="flex-1 bg-white border border-zinc-250 p-2.5 rounded-lg text-xs font-mono text-zinc-600 focus:outline-none"
                    />
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText("zp_secret_prod_84920489320942_krupal_vit_edu_verified");
                        setApiCopied(true);
                        setTimeout(() => setApiCopied(false), 2000);
                      }}
                      className="border border-zinc-250 hover:bg-zinc-50 bg-white font-bold text-xs px-3.5 py-2 rounded-lg text-zinc-700 transition-colors cursor-pointer"
                    >
                      {apiCopied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wide">Dynamic Event Webhooks</h3>
                  <p className="text-xs text-zinc-500">Specify an HTTPS server endpoint where ZonePilot will POST payload events automatically whenever shipment status changes.</p>
                  <div className="flex gap-2">
                    <input 
                      type="url" 
                      value={webhookUrl}
                      onChange={e => { setWebhookUrl(e.target.value); setWebhookSaved(false); }}
                      className="flex-1 bg-white border border-zinc-250 p-2.5 rounded-lg text-xs font-mono text-zinc-700 outline-none focus:border-zinc-400"
                    />
                    <button 
                      onClick={() => { setWebhookSaved(true); }}
                      className="bg-zinc-950 hover:bg-zinc-850 text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors cursor-pointer"
                    >
                      Save Configuration
                    </button>
                  </div>
                </div>

                <hr className="border-zinc-150" />

                <div className="space-y-2.5">
                  <div className="text-xs font-bold text-zinc-800">Direct CLI Integration Sample (cURL)</div>
                  <pre className="bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 text-[11px] text-zinc-300 font-mono whitespace-pre-wrap break-all leading-relaxed custom-scrollbar">
{`curl -X POST "https://zonepilot.app/api/orders" \\
  -H "Authorization: Bearer zp_secret_prod_8492..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "pickupZone": "North",
    "dropZone": "South",
    "pickupAddress": "VIT Hostel, Block C",
    "dropAddress": "Logistics Yard, Hub South",
    "actualWeight": 2.5,
    "dimensions": { "l": 20, "b": 15, "h": 10 },
    "orderType": "B2C",
    "paymentType": "Prepaid"
  }'`}
                  </pre>
                  <div className="text-[10px] text-zinc-400 flex items-center gap-1.5 font-medium">
                    <Info size={11} className="text-zinc-400" />
                    <span>Every request made through this SDK or custom APIs registers instantly in the Live Backend Console below.</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SIDE BAR: DETAILED LIVE TRACKING SCREEN */}
        {activeOrder && selectedOrderDetails && (
          <div className="lg:col-span-5">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white border border-zinc-900 rounded-2xl shadow-xl overflow-hidden sticky top-20"
            >
              {/* Header */}
              <div className="bg-zinc-950 p-5 text-white flex justify-between items-start">
                <div>
                  <div className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">Active Parcel Track</div>
                  <div className="text-lg font-black tracking-tight mt-1">{selectedOrderDetails.id}</div>
                </div>
                <button 
                  onClick={() => setActiveOrder(null)}
                  className="p-1.5 text-zinc-400 hover:text-white rounded-full bg-zinc-900/60 transition-colors"
                >
                  <XCircle size={16} />
                </button>
              </div>

              {/* Path Map Illustration */}
              <div className="border-b border-zinc-150 p-4 bg-zinc-50/50">
                <IndianRouteMap
                  pickupAddress={selectedOrderDetails.pickupAddress}
                  dropAddress={selectedOrderDetails.dropAddress}
                  isAnimated={selectedOrderDetails.status === 'In Transit' || selectedOrderDetails.status === 'Picked Up' || selectedOrderDetails.status === 'Out for Delivery'}
                />
              </div>

              {/* Booking Details */}
              <div className="p-5 border-b border-zinc-100 space-y-3.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 font-semibold">Service Type</span>
                  <span className="font-bold text-zinc-800 bg-zinc-100 px-2 py-0.5 rounded-md">{selectedOrderDetails.orderType} (Last-Mile Express)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 font-semibold">Weight & Size</span>
                  <span className="font-bold text-zinc-800">{selectedOrderDetails.actualWeight}kg ({selectedOrderDetails.dimensions.l}x{selectedOrderDetails.dimensions.b}x{selectedOrderDetails.dimensions.h}cm)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 font-semibold">Total Charge Paid</span>
                  <span className="font-bold text-zinc-900 text-sm">₹{selectedOrderDetails.charge.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center pt-2.5 border-t border-zinc-100">
                  <span className="text-zinc-400 font-semibold">Order Status Override</span>
                  <select
                    value={selectedOrderDetails.status}
                    onChange={(e) => {
                      const newStatus = e.target.value as any;
                      const actor = currentUser?.name || 'Customer';
                      updateOrderStatus(selectedOrderDetails.id, newStatus, actor, 'Customer manual override');
                    }}
                    className="bg-white border border-zinc-200 rounded-lg px-2 py-1 text-[11px] font-bold text-zinc-700 focus:outline-none cursor-pointer"
                  >
                    {['Pending', 'Assigned', 'Picked Up', 'In Transit', 'Out for Delivery', 'Delivered', 'Failed', 'Rescheduled'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {selectedOrderDetails.status === 'Failed' && (
                  <div className="bg-red-50 border border-red-200 p-3 rounded-xl space-y-2 mt-4 text-left">
                    <div className="flex items-center gap-1.5 text-red-800 font-bold">
                      <Info size={14} />
                      <span>Delivery Failed Attempt</span>
                    </div>
                    <p className="text-[11px] text-red-600 leading-normal">
                      The carrier could not finalize delivery. Reason: &quot;{selectedOrderDetails.history[selectedOrderDetails.history.length - 1]?.reason || 'No contact response'}&quot;.
                    </p>
                    <button 
                      onClick={() => rescheduleOrder(selectedOrderDetails.id)}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2 rounded-lg transition-colors cursor-pointer"
                    >
                      Reschedule Delivery Free
                    </button>
                  </div>
                )}
              </div>

              {/* Dynamic Step-by-Step History Timeline */}
              <div className="p-5 bg-zinc-50/50 max-h-[220px] overflow-y-auto custom-scrollbar">
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">Journey Logs</div>
                <div className="space-y-4">
                  {selectedOrderDetails.history.map((h, i) => (
                    <div key={i} className="flex gap-3 text-left">
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 rounded-full bg-zinc-950 mt-1 shadow-sm ring-4 ring-white" />
                        {i !== selectedOrderDetails.history.length - 1 && <div className="w-px h-full bg-zinc-200 my-1" />}
                      </div>
                      <div className="pb-2">
                        <div className="text-xs font-bold text-zinc-800">{h.status}</div>
                        <div className="text-[10px] text-zinc-400 mt-0.5">
                          {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • by {h.actor}
                        </div>
                        {h.reason && <div className="text-[11px] font-semibold text-red-600 mt-1">{h.reason}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

/* SUBCOMPONENT: INNER STEPPER WIZARD FOR ORDER BOOKING */
function BookingWizard({ onComplete }: { onComplete: () => void }) {
  const { addOrder, rateCards, codSurcharge, volumetricDivisor } = useDemo();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    pickupZone: 'North' as Zone,
    dropZone: 'South' as Zone,
    pickupAddress: 'Sector 62 Hub, Gautam Buddha Nagar (Noida), Delhi NCR (North)',
    dropAddress: 'HSR Layout Sector 4, Bengaluru Urban, Karnataka (South)',
    l: 15, b: 15, h: 20,
    actualWeight: 1.5,
    orderType: 'B2C' as 'B2B' | 'B2C',
    paymentType: 'Prepaid' as 'Prepaid' | 'COD'
  });

  const rate = calculateRate(
    form.pickupZone, form.dropZone, form.l, form.b, form.h, form.actualWeight, form.orderType, form.paymentType,
    rateCards, codSurcharge, volumetricDivisor
  );

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addOrder({
      customerId: 'cust1', // Handled by actual customer ID inside DemoStore
      pickupZone: form.pickupZone,
      dropZone: form.dropZone,
      pickupAddress: form.pickupAddress,
      dropAddress: form.dropAddress,
      dimensions: { l: form.l, b: form.b, h: form.h },
      actualWeight: form.actualWeight,
      orderType: form.orderType,
      paymentType: form.paymentType,
      charge: rate.totalCharge
    });
    onComplete();
  };

  return (
    <div className="space-y-6 text-left">
      {/* Wizard steps indicator bar */}
      <div className="flex items-center justify-between">
        <div className="flex gap-4 items-center">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
            step >= 1 ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-400'
          }`}>1</div>
          <span className="text-xs font-bold text-zinc-700 hidden sm:inline">Addresses</span>
          <ChevronRight size={14} className="text-zinc-300 hidden sm:inline" />

          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
            step >= 2 ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-400'
          }`}>2</div>
          <span className="text-xs font-bold text-zinc-700 hidden sm:inline">Parcel Parameters</span>
          <ChevronRight size={14} className="text-zinc-300 hidden sm:inline" />

          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
            step >= 3 ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-400'
          }`}>3</div>
          <span className="text-xs font-bold text-zinc-700 hidden sm:inline">Checkout</span>
        </div>
        <span className="text-xs font-bold text-zinc-400">Step {step} of 3</span>
      </div>

      <hr className="border-zinc-150" />

      {/* STEP 1: ADDRESS DETAILS */}
      {step === 1 && (
        <div className="space-y-5">
          <IndianRouteMap 
            pickupAddress={form.pickupAddress}
            dropAddress={form.dropAddress}
            onPickupChange={(address) => {
              setForm(prev => ({ ...prev, pickupAddress: address }));
            }}
            onDropChange={(address) => {
              setForm(prev => ({ ...prev, dropAddress: address }));
            }}
          />

          <div className="pt-4 flex justify-end">
            <button 
              onClick={handleNext}
              className="bg-zinc-950 hover:bg-zinc-850 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
            >
              Configure Package
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: PARCEL PARAMETERS */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Volumetric specs</h3>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-zinc-500 font-semibold mb-1 block">Length (cm)</label>
                  <input 
                    type="number" 
                    value={form.l} 
                    onChange={e => setForm({...form, l: +e.target.value})}
                    className="w-full border border-zinc-200 rounded-lg p-2.5 text-xs font-bold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 font-semibold mb-1 block">Width (cm)</label>
                  <input 
                    type="number" 
                    value={form.b} 
                    onChange={e => setForm({...form, b: +e.target.value})}
                    className="w-full border border-zinc-200 rounded-lg p-2.5 text-xs font-bold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 font-semibold mb-1 block">Height (cm)</label>
                  <input 
                    type="number" 
                    value={form.h} 
                    onChange={e => setForm({...form, h: +e.target.value})}
                    className="w-full border border-zinc-200 rounded-lg p-2.5 text-xs font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-500 font-semibold mb-1 block">Actual Physical Weight (kg)</label>
                <input 
                  type="number" 
                  step="0.1"
                  value={form.actualWeight} 
                  onChange={e => setForm({...form, actualWeight: +e.target.value})}
                  className="w-full border border-zinc-200 rounded-lg p-2.5 text-xs font-bold focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Account preferences</h3>
              <div>
                <label className="text-xs text-zinc-500 font-semibold mb-1 block">Delivery Category</label>
                <select 
                  value={form.orderType} 
                  onChange={e => setForm({...form, orderType: e.target.value as any})}
                  className="w-full border border-zinc-200 rounded-lg p-2.5 text-xs font-bold bg-white focus:outline-none"
                >
                  <option value="B2C">B2C Standard Consumer</option>
                  <option value="B2B">B2B Corporate Account</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-zinc-500 font-semibold mb-1 block">Payment Method</label>
                <select 
                  value={form.paymentType} 
                  onChange={e => setForm({...form, paymentType: e.target.value as any})}
                  className="w-full border border-zinc-200 rounded-lg p-2.5 text-xs font-bold bg-white focus:outline-none"
                >
                  <option value="Prepaid">Prepaid Wallet</option>
                  <option value="COD">Cash on Delivery (COD)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-between">
            <button 
              onClick={handleBack}
              className="border border-zinc-200 hover:bg-zinc-50 font-bold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer text-zinc-600"
            >
              Back
            </button>
            <button 
              onClick={handleNext}
              className="bg-zinc-950 hover:bg-zinc-850 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
            >
              Review Booking
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: REVIEW & CHECKOUT */}
      {step === 3 && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-zinc-50 p-5 rounded-2xl border border-zinc-200 space-y-4 text-xs font-semibold text-zinc-600">
            <h4 className="text-sm font-bold text-zinc-800 mb-3">Order Confirmation Summary</h4>
            <div className="grid grid-cols-2 gap-4 border-b border-zinc-200 pb-4">
              <div>
                <span className="text-zinc-400 font-medium block">Pickup address</span>
                <span className="text-zinc-800 font-bold mt-1 block">{form.pickupAddress} ({form.pickupZone} Hub)</span>
              </div>
              <div>
                <span className="text-zinc-400 font-medium block">Destination address</span>
                <span className="text-zinc-800 font-bold mt-1 block">{form.dropAddress} ({form.dropZone} Hub)</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-b border-zinc-200 pb-4">
              <div>
                <span className="text-zinc-400 font-medium block">Calculated weight</span>
                <span className="text-zinc-800 font-bold mt-1 block">{rate.billableWeight.toFixed(2)} kg (Phys: {form.actualWeight}kg, Vol: {rate.volumetricWeight.toFixed(2)}kg)</span>
              </div>
              <div>
                <span className="text-zinc-400 font-medium block">Payment terms</span>
                <span className="text-zinc-800 font-bold mt-1 block">{form.paymentType} ({form.orderType} contract)</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <div>
                <span className="text-zinc-400 font-medium block text-xs">Total Billable Price</span>
                <span className="text-2xl font-black text-zinc-900 mt-1 block">₹{rate.totalCharge.toFixed(2)}</span>
              </div>
              <div className="text-right text-[10px] text-zinc-400">
                Inclusive of all operational fees
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-between">
            <button 
              type="button"
              onClick={handleBack}
              className="border border-zinc-200 hover:bg-zinc-50 font-bold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer text-zinc-600"
            >
              Back
            </button>
            <button 
              type="submit"
              className="bg-zinc-950 hover:bg-zinc-850 text-white font-bold text-xs px-6 py-3 rounded-xl transition-all cursor-pointer shadow-md flex items-center gap-1.5"
            >
              <CheckCircle size={14} />
              Book Deliverable Parcel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
