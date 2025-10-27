import { createContext, useContext, useState, useEffect } from 'react';
import type { Match } from '../types';
import { hashPassword, validatePassword } from '../utils/crypto';

interface MatchContextType {
  currentMatch: Match | null;
  startNewMatch: (homeTeam: string, awayTeam: string) => void;
  updateStats: (statType: string, action: string) => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  isPasswordSet: boolean;
  initializePassword: (password: string) => Promise<void>;
  validateSessionPassword: (password: string) => Promise<boolean>;
  isSessionAuthenticated: boolean;
}

const MatchContext = createContext<MatchContextType | null>(null);

export function MatchProvider({ children }: { children: React.ReactNode }) {
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  const [isSessionAuthenticated, setIsSessionAuthenticated] = useState(false);
  const [passwordHash, setPasswordHash] = useState<string | null>(null);

  useEffect(() => {
    const storedHash = localStorage.getItem('passwordHash');
    setPasswordHash(storedHash);
  }, []);

  const initializePassword = async (password: string) => {
    const hash = await hashPassword(password);
    setPasswordHash(hash);
    localStorage.setItem('passwordHash', hash);
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    if (!passwordHash) return false;
    
    const isValid = await validatePassword(currentPassword, passwordHash);
    if (!isValid) return false;

    const newHash = await hashPassword(newPassword);
    setPasswordHash(newHash);
    localStorage.setItem('passwordHash', newHash);
    setIsSessionAuthenticated(false); // Require re-authentication after password change
    return true;
  };

  const validateSessionPassword = async (password: string): Promise<boolean> => {
    if (!passwordHash) return false;
    const isValid = await validatePassword(password, passwordHash);
    if (isValid) {
      setIsSessionAuthenticated(true);
    }
    return isValid;
  };

  const startNewMatch = (homeTeam: string, awayTeam: string) => {
    if (!isSessionAuthenticated) return;
    
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
        isSessionAuthenticated,
        changePassword,
        isPasswordSet: !!passwordHash,
        initializePassword,
        validateSessionPassword
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