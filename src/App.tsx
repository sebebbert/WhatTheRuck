import { MantineProvider } from '@mantine/core';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MatchProvider } from './context/MatchContext';
import { AuthProvider } from './context/AuthContext';
import { RequireAuth } from './components/RequireAuth';
import { NewMatch } from './pages/NewMatch';
import { LiveMatch } from './pages/LiveMatch';
import { Login } from './pages/Login';
import { TopBanner } from './components/TopBanner';

function App() {
  return (
    <MantineProvider>
      <AuthProvider>
        <MatchProvider>
          <BrowserRouter>
            <TopBanner />
            <Routes>
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
            </Routes>
          </BrowserRouter>
        </MatchProvider>
      </AuthProvider>
    </MantineProvider>
  );
}

export default App;
