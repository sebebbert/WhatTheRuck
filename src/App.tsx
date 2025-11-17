import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MatchProvider } from './context/MatchContext';
import { AuthProvider } from './context/AuthContext';
import { RequireAuth } from './components/RequireAuth';
import { NewMatch } from './pages/NewMatch';
import { LiveMatch } from './pages/LiveMatch';
import { Login } from './pages/Login';
import { MatchHistory } from './pages/MatchHistory';
import { TopBanner } from './components/TopBanner';

function App() {
  return (
    <MantineProvider>
      <AuthProvider>
        <MatchProvider>
          <BrowserRouter>
            <Notifications />
            <TopBanner />
            <Routes>
              <Route path="/" element={<Navigate to="/WhatTheRuck" replace />} />
              <Route path="/WhatTheRuck/login" element={<Login />} />
              <Route 
                path="/WhatTheRuck" 
                element={
                  <RequireAuth>
                    <NewMatch />
                  </RequireAuth>
                } 
              />
              <Route 
                path="/WhatTheRuck/match" 
                element={
                  <RequireAuth>
                    <LiveMatch />
                  </RequireAuth>
                } 
              />
              <Route
                path="/WhatTheRuck/history"
                element={
                  <RequireAuth>
                    <MatchHistory />
                  </RequireAuth>
                }
              />
            </Routes>
          </BrowserRouter>
        </MatchProvider>
      </AuthProvider>
    </MantineProvider>
  );
}

export default App;
