import { createContext, useContext, useState } from 'react';
import type { Match } from '../types';

interface MatchContextType {
  currentMatch: Match | null;
  startNewMatch: (homeTeam: string, awayTeam: string) => void;
  updateStats: (statType: string, action: string) => void;
}

const MatchContext = createContext<MatchContextType | null>(null);

export function MatchProvider({ children }: { children: React.ReactNode }) {
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);

  const startNewMatch = (homeTeam: string, awayTeam: string) => {
    const newMatch: Match = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      homeTeam,
      awayTeam,
      homeScore: 0,
      awayScore: 0,
      stats: {
        scrums: { won: 0, lost: 0 },
        lineouts: { won: 0, lost: 0 },
        turnovers: { won: 0, conceded: 0 },
        penalties: { for: 0, against: 0 }
      }
    };
    setCurrentMatch(newMatch);
  };

  const updateStats = (statType: string, action: string) => {
    if (!currentMatch) return;

    setCurrentMatch(prev => {
      if (!prev) return null;
      const newMatch = { ...prev };

      switch (statType) {
        case 'scrum':
          if (action === 'won') newMatch.stats.scrums.won += 1;
          if (action === 'lost') newMatch.stats.scrums.lost += 1;
          break;
        case 'lineout':
          if (action === 'won') newMatch.stats.lineouts.won += 1;
          if (action === 'lost') newMatch.stats.lineouts.lost += 1;
          break;
        case 'turnover':
          if (action === 'won') newMatch.stats.turnovers.won += 1;
          if (action === 'conceded') newMatch.stats.turnovers.conceded += 1;
          break;
        case 'penalty':
          if (action === 'for') newMatch.stats.penalties.for += 1;
          if (action === 'against') newMatch.stats.penalties.against += 1;
          break;
      }

      return newMatch;
    });
  };

  return (
    <MatchContext.Provider value={{ currentMatch, startNewMatch, updateStats }}>
      {children}
    </MatchContext.Provider>
  );
}

export function useMatch() {
  const context = useContext(MatchContext);
  if (!context) {
    throw new Error('useMatch must be used within a MatchProvider');
  }
  return context;
}