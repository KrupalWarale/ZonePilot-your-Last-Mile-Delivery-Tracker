import React, { useEffect } from 'react';
import { DemoProvider, useDemo } from './store/DemoStore';
import { CustomerView } from './components/CustomerView';
import { AdminView } from './components/AdminView';
import { AgentView } from './components/AgentView';
import { Navigation } from './components/Navigation';
import { LoginScreen } from './components/LoginScreen';
import { NotificationPanel } from './components/NotificationPanel';

function AppContent() {
  const { currentUser } = useDemo();

  useEffect(() => {
    if (currentUser) {
      const roleName = currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1);
      document.title = `ZonePilot - ${roleName} Portal`;
    } else {
      document.title = `ZonePilot - Login`;
    }
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#F9FAFB]">
        <LoginScreen />
        <NotificationPanel />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans selection:bg-zinc-200 w-full max-w-full overflow-x-hidden">
      <Navigation />
      
      <main className="pb-24 w-full max-w-full overflow-x-hidden">
        {currentUser.role === 'customer' && <CustomerView />}
        {currentUser.role === 'admin' && <AdminView />}
        {currentUser.role === 'agent' && <AgentView />}
      </main>
      <NotificationPanel />
    </div>
  );
}

export default function App() {
  return (
    <DemoProvider>
      <AppContent />
    </DemoProvider>
  );
}

