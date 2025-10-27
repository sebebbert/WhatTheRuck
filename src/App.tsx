import { MantineProvider } from '@mantine/core';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MatchProvider } from './context/MatchContext';
import { NewMatch } from './pages/NewMatch';
import { LiveMatch } from './pages/LiveMatch';

function App() {
  return (
    <MantineProvider>
      <MatchProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/WhatTheRuck" element={<NewMatch />} />
            <Route path="/WhatTheRuck/match" element={<LiveMatch />} />
          </Routes>
        </BrowserRouter>
      </MatchProvider>
    </MantineProvider>
  );
}

export default App;
