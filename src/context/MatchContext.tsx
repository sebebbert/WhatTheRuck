import { createContext, useContext, useState } from 'react';
import type { Match, MatchEvent } from '../types';
import { useAuth } from './AuthContext';
import { db } from '../firebase';
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  getDocs,
  onSnapshot,
  doc,
  getDoc,
  deleteDoc,
} from 'firebase/firestore';
import type { DocumentData } from 'firebase/firestore';

interface MatchContextType {
  currentMatch: Match | null;
  startNewMatch: (homeTeam: string, awayTeam: string) => void;
  updateStats: (statType: string, action: string, matchTime?: number) => void;
  addScore: (team: 'home' | 'away', type: 'try' | 'conversion' | 'penalty', time?: number) => void;
  matchTime: number;
  setMatchTime: (time: number) => void;
  finishMatch: () => void;
  loadMatches: (userId?: string) => Promise<Match[]>;
  subscribeToMatches: (userId: string, cb: (matches: Match[]) => void) => () => void;
  deleteMatch: (matchId: string) => Promise<boolean>;
}

const MatchContext = createContext<MatchContextType | null>(null);

export function MatchProvider({ children }: { children: React.ReactNode }) {
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  const [matchTime, setMatchTime] = useState(0);
  const { user } = useAuth();

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
      // create a deep copy to avoid mutating nested objects on the previous state
      const newMatch: Match = JSON.parse(JSON.stringify(prev));


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

  const addScore = (team: 'home' | 'away', type: 'try' | 'conversion' | 'penalty', time?: number) => {
    if (!currentMatch) return;

    setCurrentMatch(prev => {
      if (!prev) return null;
      // deep clone previous to avoid accidental nested mutation
      const newMatch: Match = JSON.parse(JSON.stringify(prev));

      // determine points
      let points = 0;
      switch (type) {
        case 'try':
          points = 5;
          break;
        case 'conversion':
          points = 2;
          break;
        case 'penalty':
          points = 3;
          break;
      }

      if (team === 'home') newMatch.homeScore += points;
      else newMatch.awayScore += points;

      // Add event to timeline
      
      const scoreAction = `${team}-${type}`;
      const event: MatchEvent = {
        type: 'score',
        action: scoreAction,
        time: time ?? matchTime,
        timestamp: (new Date).toISOString()
      };
      newMatch.events = [...newMatch.events, event];

      return newMatch;
    });
  };

  const finishMatch = () => {
    if (!currentMatch) return;

    if (!user) {
      console.warn('User not authenticated — match not saved. Sign in to persist matches.');
      setCurrentMatch(null);
      setMatchTime(0);
      return;
    }

    (async () => {
      try {
        const finished: any = { ...currentMatch, finalTime: matchTime, finishedAt: new Date().toISOString() };
        finished.userId = user.uid;
        finished.createdAt = serverTimestamp();
        await addDoc(collection(db, 'matches'), finished as DocumentData);
      } catch (e) {
        console.error('Failed to persist finished match to Firestore', e);
      }
    })();

    setCurrentMatch(null);
    setMatchTime(0);
  };

  // Load matches for a given userId (or current user if not provided)
  const loadMatches = async (userId?: string) => {
    const uid = userId ?? user?.uid;
    if (!uid) return [];
    try {
      const q = query(
        collection(db, 'matches'),
        where('userId', '==', uid),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      const matches: Match[] = snap.docs.map(d => ({ ...(d.data() as any), id: d.id } as Match));
      return matches;
    } catch (e) {
      console.error('Failed to load matches', e);
      return [];
    }
  };

  // Subscribe to matches for a user; returns unsubscribe
  const subscribeToMatches = (userId: string, cb: (matches: Match[]) => void) => {
    const q = query(collection(db, 'matches'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const matches = snap.docs.map(d => ({ ...(d.data() as any), id: d.id } as Match));
      cb(matches);
    }, (err) => {
      console.error('Matches subscription error', err);
      cb([]);
    });
    return unsub;
  };

  // Delete a match document if the current user is the owner
  const deleteMatch = async (matchId: string) => {
    if (!user) {
      console.warn('Not authenticated. Cannot delete match.');
      return false;
    }
    try {
      const ref = doc(db, 'matches', matchId);
      const snap = await getDoc(ref);
      if (!snap.exists()) return false;
      const data = snap.data() as any;
      if (data.userId !== user.uid) {
        console.warn('User not authorized to delete this match');
        return false;
      }
      await deleteDoc(ref);
      return true;
    } catch (e) {
      console.error('Failed to delete match', e);
      return false;
    }
  };

  return (
    <MatchContext.Provider 
      value={{ 
        currentMatch, 
        startNewMatch, 
        updateStats,
        addScore,
        finishMatch,
        matchTime,
        setMatchTime,
        loadMatches,
        subscribeToMatches,
        deleteMatch
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