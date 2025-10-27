import { createContext, useContext, useState } from 'react';
import type { Match, MatchEvent } from '../types';

interface MatchContextType {
  currentMatch: Match | null;
  startNewMatch: (homeTeam: string, awayTeam: string) => void;
  updateStats: (statType: string, action: string, matchTime?: number) => void;
  matchTime: number;
  setMatchTime: (time: number) => void;
}

const MatchContext = createContext<MatchContextType | null>(null);

export function MatchProvider({ children }: { children: React.ReactNode }) {
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  const [matchTime, setMatchTime] = useState(0);

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
        penalties: { for: 0, against: 0 },
        cards: {
          home: { yellow: 0, red: 0 },
          away: { yellow: 0, red: 0 }
        },
        knockOns: { home: 0, away: 0 }
      },
      events: []
    };
    setCurrentMatch(newMatch);
    setMatchTime(0);
  };

  const updateStats = (statType: string, action: string, time?: number) => {
    if (!currentMatch) return;

    setCurrentMatch(prev => {
      if (!prev) return null;
      const newMatch = { ...prev };
      
      // Add event to timeline
      const event: MatchEvent = {
        type: statType,
        action,
        time: time ?? matchTime,
        timestamp: new Date().toISOString()
      };
      newMatch.events = [...newMatch.events, event];

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
        case 'card':
          const [cardTeam, cardType] = action.split('-') as ['home' | 'away', 'yellow' | 'red'];
          if (cardTeam && cardType) {
            newMatch.stats.cards[cardTeam][cardType] += 1;
          }
          break;
        case 'knockOn':
          const knockOnTeam = action as 'home' | 'away';
          if (knockOnTeam) {
            newMatch.stats.knockOns[knockOnTeam] += 1;
          }
          break;
      }

      return newMatch;
    });
  };

  return (
    <MatchContext.Provider 
      value={{ 
        currentMatch, 
        startNewMatch, 
        updateStats,
        matchTime,
        setMatchTime
      }}
    >
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