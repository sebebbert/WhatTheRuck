import { MantineProvider } from '@mantine/core';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MatchProvider } from './context/MatchContext';
import { NewMatch } from './pages/NewMatch';
import { LiveMatch } from './pages/LiveMatch';
import { PasswordSetup } from './components/PasswordSetup';
import { ChangePassword } from './components/ChangePassword';

function App() {
  return (
    <MantineProvider>
      <MatchProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/WhatTheRuck" element={<NewMatch />} />
            <Route path="/WhatTheRuck/match" element={<LiveMatch />} />
            <Route path="/WhatTheRuck/password" element={<ChangePassword />} />
          </Routes>
          <PasswordSetup />
        </BrowserRouter>
      </MatchProvider>
    </MantineProvider>
  );
}

export default App;
