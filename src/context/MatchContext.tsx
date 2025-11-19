import { createContext, useContext, useState, useEffect } from 'react';
import type { Match, MatchEvent } from '../types';
import { useAuth } from './AuthContext';
import { db } from '../firebase';
import { LOCAL_PENDING_MATCHES_KEY, LEGACY_MATCHES_KEY } from '../constants';
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
  syncPendingMatches: () => Promise<void>;
  
  migrateLegacyItem: (identifier: string) => Promise<{ migrated: boolean; movedToPending: boolean; error?: string }>;
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

    const finishedBase: any = { ...currentMatch, finalTime: matchTime, finishedAt: new Date().toISOString() };

    // If online and authenticated, persist to Firestore immediately.
    if (navigator.onLine && user) {
      (async () => {
        try {
          const finished: any = { ...finishedBase };
          finished.userId = user.uid;
          finished.createdAt = serverTimestamp();
          await addDoc(collection(db, 'matches'), finished as DocumentData);
        } catch (e) {
          console.error('Failed to persist finished match to Firestore', e);
          // fallback to local pending queue
          savePendingMatch(finishedBase);
        }
      })();
    } else {
      // save locally for offline/unauthenticated usage
      savePendingMatch(finishedBase);
    }

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

  // --- Local pending queue helpers (for offline use) ---
  const getPendingMatches = (): Array<any> => {
    try {
      const raw = localStorage.getItem(LOCAL_PENDING_MATCHES_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error('Failed to read pending matches from localStorage', e);
      return [];
    }
  };

  const savePendingMatches = (items: Array<any>) => {
    try {
      localStorage.setItem(LOCAL_PENDING_MATCHES_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to write pending matches to localStorage', e);
    }
  };

  const savePendingMatch = (matchObj: any) => {
    const pending = getPendingMatches();
    const tempId = `${Date.now()}-${Math.random().toString(36).slice(2,9)}`;
    const item = { ...matchObj, _tempId: tempId };
    pending.push(item);
    savePendingMatches(pending);
  };

  const removePendingByTempId = (tempId: string) => {
    const pending = getPendingMatches();
    const filtered = pending.filter((p) => p._tempId !== tempId);
    savePendingMatches(filtered);
  };

  // Attempt to sync any pending matches from localStorage to Firestore.
  const syncPendingMatches = async () => {
    if (!navigator.onLine) return;
    const pending = getPendingMatches();
    if (!pending || pending.length === 0) return;
    if (!user) {
      // cannot sync without authentication (rules require userId)
      return;
    }

    for (const p of pending) {
      try {
        const docData: any = { ...p };
        // ensure we do not send the temp id to Firestore
        delete docData._tempId;
        docData.userId = user.uid;
        docData.createdAt = serverTimestamp();
        await addDoc(collection(db, 'matches'), docData as DocumentData);
        // remove from pending after success
        if (p._tempId) removePendingByTempId(p._tempId);
      } catch (e) {
        // leave it in the queue and continue with others
        console.error('Failed to sync pending match', e);
      }
    }
  };

  

    // Migrate a single legacy item (by id or _tempId). If online+auth, upload to Firestore.
    // Otherwise move to pending queue so it can be synced later.
    const migrateLegacyItem = async (identifier: string) => {
      if (!identifier) return { migrated: false, movedToPending: false, error: 'no identifier' };

      const rawLegacy = localStorage.getItem(LEGACY_MATCHES_KEY);
      if (!rawLegacy) return { migrated: false, movedToPending: false, error: 'no legacy data' };

      let arr: Array<any> = [];
      try {
        arr = JSON.parse(rawLegacy);
      } catch (e) {
        return { migrated: false, movedToPending: false, error: 'parse error' };
      }

      const idx = arr.findIndex((it: any) => (it._tempId && it._tempId === identifier) || (it.id && it.id === identifier));
      if (idx === -1) return { migrated: false, movedToPending: false, error: 'not found' };

      const item = arr[idx];
      // remove from legacy array
      arr.splice(idx, 1);
      try {
        if (arr.length > 0) localStorage.setItem(LEGACY_MATCHES_KEY, JSON.stringify(arr));
        else localStorage.removeItem(LEGACY_MATCHES_KEY);
      } catch (e) {
        // ignore write errors
      }

      // If online and authenticated, upload
      if (navigator.onLine && user) {
        try {
          const docData: any = { ...item };
          delete docData.id;
          if (docData._tempId) delete docData._tempId;
          docData.userId = user.uid;
          docData.createdAt = serverTimestamp();
          await addDoc(collection(db, 'matches'), docData as DocumentData);
          return { migrated: true, movedToPending: false };
        } catch (e) {
          console.error('Failed to migrate legacy item, moving to pending', e);
          // fallthrough to move to pending
        }
      }

      // Move to pending queue
      try {
        const pending = getPendingMatches();
        const tempId = item._tempId ?? `${Date.now()}-${Math.random().toString(36).slice(2,9)}`;
        const toSave = { ...item, _tempId: tempId };
        // ensure no duplicate
        if (!pending.some((p: any) => p._tempId === toSave._tempId)) pending.push(toSave);
        savePendingMatches(pending);
        return { migrated: false, movedToPending: true };
      } catch (e) {
        console.error('Failed to move legacy item to pending', e);
        return { migrated: false, movedToPending: false, error: 'failed to move to pending' };
      }
    };

  // Sync pending on auth change or when coming online (no automatic legacy migration)
  useEffect(() => {
    const attemptSync = async () => {
      if (!user || !navigator.onLine) return;
      try {
        await syncPendingMatches();
      } catch (e) {
        // sync errors are logged inside syncPendingMatches
      }
    };

    // attempt initial run when user becomes available and online
    attemptSync();

    const onOnline = () => {
      if (user) attemptSync();
    };
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  }, [user?.uid]);

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
        deleteMatch,
        syncPendingMatches,
        migrateLegacyItem
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