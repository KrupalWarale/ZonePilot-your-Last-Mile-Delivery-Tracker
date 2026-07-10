import React, { useState } from 'react';
import { useDemo } from '../store/DemoStore';
import { Bell, X, Check, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function NotificationPanel() {
  const { currentUser, notifications, acceptOrderOffer, declineOrderOffer, logout } = useDemo();
  const [isOpen, setIsOpen] = useState(false);

  // Find notifications that are pending
  const pendingNotifications = notifications.filter(n => n.status === 'pending');

  // Filter notifications relevant to the current user
  // If not logged in as the specific recipient/agent, we still show the notifications globally so the user sees them and can click to redirect to login.
  const activeNotifications = pendingNotifications;

  const badgeCount = activeNotifications.length;

  const handleRedirect = () => {
    window.open(`${window.location.origin}?role=agent`, '_blank');
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Bell Icon Button in Fixed Position (Bottom Right, shifted up to bottom-24) */}
      <div className="fixed bottom-24 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative bg-zinc-950 hover:bg-zinc-800 text-white p-4 rounded-full shadow-2xl transition-all hover:scale-105 cursor-pointer flex items-center justify-center border border-zinc-850"
        >
          <Bell size={22} className={badgeCount > 0 ? "animate-bounce" : ""} />
          {badgeCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-md">
              {badgeCount}
            </span>
          )}
        </button>

        {/* Notification Panel Card */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              className="absolute bottom-16 right-0 w-80 sm:w-96 bg-white border border-zinc-250 rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="bg-zinc-950 text-white p-4 flex justify-between items-center border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <Bell size={16} className="text-zinc-300" />
                  <span className="font-bold text-sm tracking-tight">System Alerts</span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-zinc-850 rounded-lg text-zinc-400 hover:text-white transition-colors"
                >
                  <X size={15} />
                </button>
              </div>

              {/* List */}
              <div className="p-4 max-h-96 overflow-y-auto custom-scrollbar space-y-4">
                {activeNotifications.length === 0 ? (
                  <div className="text-center py-8 text-zinc-400 text-xs font-semibold">
                    No pending alerts at this moment.
                  </div>
                ) : (
                  activeNotifications.map(notif => {
                    const isOrderOffer = !notif.recipientId;
                    const isTargetAgent = currentUser?.id === notif.agentId;
                    const isTargetRecipient = currentUser?.id === notif.recipientId;

                    return (
                      <div key={notif.id} className="border border-zinc-200 rounded-xl p-3.5 bg-zinc-50 space-y-3">
                        <div className="text-xs font-bold text-zinc-800 flex items-center justify-between">
                          <span>
                            {isOrderOffer ? `Order Offer (${notif.orderId})` : 'Shipment Alert'}
                          </span>
                          <span className="text-[10px] text-zinc-400 font-semibold">
                            {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-600 font-medium leading-relaxed">
                          {notif.message}
                        </p>

                        {isOrderOffer ? (
                          isTargetAgent ? (
                            /* Logged in as target agent: show Accept / Decline buttons */
                            <div className="flex gap-2 pt-1">
                              <button
                                onClick={() => acceptOrderOffer(notif.id)}
                                className="flex-1 bg-zinc-950 hover:bg-zinc-850 text-white font-bold text-xs py-2 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1 shadow-sm"
                              >
                                <Check size={12} /> Yes, Accept
                              </button>
                              <button
                                onClick={() => declineOrderOffer(notif.id)}
                                className="flex-1 border border-zinc-200 hover:bg-zinc-100 bg-white text-zinc-600 font-bold text-xs py-2 rounded-lg transition-colors cursor-pointer"
                              >
                                No, Decline
                              </button>
                            </div>
                          ) : (
                            /* Not logged in as correct agent: show redirect action */
                            <button
                              onClick={handleRedirect}
                              className="w-full bg-zinc-950 hover:bg-zinc-850 text-white font-bold text-xs py-2 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              Go to Login Page to Process
                            </button>
                          )
                        ) : (
                          isTargetRecipient ? (
                            /* Customer alert actions */
                            <button
                              onClick={() => {
                                declineOrderOffer(notif.id); // Acknowledge/read
                              }}
                              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <CheckCircle2 size={13} /> Got it
                            </button>
                          ) : (
                            /* Alert for another user */
                            <button
                              onClick={handleRedirect}
                              className="w-full bg-zinc-950 hover:bg-zinc-850 text-white font-bold text-xs py-2 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              Go to Login Page to View
                            </button>
                          )
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
