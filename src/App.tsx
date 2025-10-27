import { MantineProvider } from '@mantine/core';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MatchProvider } from './context/MatchContext';
import { NewMatch } from './pages/NewMatch';
import { LiveMatch } from './pages/LiveMatch';
import { PasswordPage } from './pages/PasswordPage';

function App() {
  return (
    <MantineProvider>
      <MatchProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/WhatTheRuck" element={<NewMatch />} />
            <Route path="/WhatTheRuck/match" element={<LiveMatch />} />
            <Route path="/WhatTheRuck/password" element={<PasswordPage />} />
          </Routes>
        </BrowserRouter>
      </MatchProvider>
    </MantineProvider>
  );
}

export default App;
