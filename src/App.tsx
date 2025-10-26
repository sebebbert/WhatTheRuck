import { MantineProvider } from '@mantine/core';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MatchProvider } from './context/MatchContext';
import { NewMatch } from './pages/NewMatch';
import { LiveMatch } from './pages/LiveMatch';

function App() {
  return (
    <MantineProvider>
      <MatchProvider>
        <BrowserRouter basename="/WhatTheRuck">
          <Routes>
            <Route path="/" element={<NewMatch />} />
            <Route path="/match" element={<LiveMatch />} />
          </Routes>
        </BrowserRouter>
      </MatchProvider>
    </MantineProvider>
  );
}

export default App;
