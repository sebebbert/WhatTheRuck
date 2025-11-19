import { useEffect, useState } from 'react';
import { Container, Title, Stack, Paper, Text, Button, Group, Modal } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { useNavigate } from 'react-router-dom';
import { useMatch } from '../context/MatchContext';
import { useAuth } from '../context/AuthContext';
import { LOCAL_PENDING_MATCHES_KEY } from '../constants';

export function MatchHistory() {
  const [matches, setMatches] = useState<Array<any>>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState<string | null>(null);
  const navigate = useNavigate();

  const { user } = useAuth();
    const { loadMatches, subscribeToMatches, deleteMatch, syncPendingMatches } = useMatch();
    const [pendingMatches, setPendingMatches] = useState<Array<any>>([]);

  useEffect(() => {
    let unsub: (() => void) | undefined;
    if (user?.uid) {
      unsub = subscribeToMatches(user.uid, (m) => setMatches(m));
    } else {
      (async () => {
        const m = await loadMatches();
        setMatches(m.reverse());
      })();
    }
    return () => {
      if (unsub) unsub();
    };
  }, [user?.uid]);

    // load pending matches from localStorage
    const loadPending = () => {
      try {
        const raw = localStorage.getItem(LOCAL_PENDING_MATCHES_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        setPendingMatches(Array.isArray(parsed) ? parsed.reverse() : []);
      } catch (e) {
        setPendingMatches([]);
      }
    };

    useEffect(() => {
      loadPending();
      const onStorage = (e: StorageEvent) => {
        if (e.key === LOCAL_PENDING_MATCHES_KEY) loadPending();
      };
      const onOnline = () => loadPending();
      window.addEventListener('storage', onStorage);
      window.addEventListener('online', onOnline);
      return () => {
        window.removeEventListener('storage', onStorage);
        window.removeEventListener('online', onOnline);
      };
    }, []);

  const formatTime = (seconds: number | undefined) => {
    if (seconds === undefined || seconds === null) return '00:00';
    const minutes = Math.floor(seconds / 60);
    const remaining = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  return (
    <Container>
      <Stack gap="md">
        <Group style={{ justifyContent: 'space-between' }}>
          <Title order={2}>Match History</Title>
          <Button onClick={() => navigate('/WhatTheRuck')}>Back</Button>
        </Group>

        {pendingMatches.length > 0 && (
          <Paper p="md" withBorder>
            <Group style={{ justifyContent: 'space-between' }}>
              <div>
                <Text size="lg" fw={700}>Pending (unsynced) Matches</Text>
                <Text c="dimmed">These matches are saved locally and will be uploaded when you're online and signed in.</Text>
              </div>
              <div>
                <Button onClick={async () => {
                  try {
                    await syncPendingMatches();
                    loadPending();
                    showNotification({ title: 'Sync', message: 'Pending matches synced (if signed in).' });
                  } catch (e) {
                    console.error('Sync failed', e);
                    showNotification({ title: 'Sync failed', message: 'Could not sync pending matches.' });
                  }
                }}>Sync pending</Button>
              </div>
            </Group>

            <Stack mt="sm">
              {pendingMatches.map((m: any, idx: number) => (
                <Paper key={m._tempId || idx} p="sm">
                  <Text size="md" fw={600}>{m.homeTeam} {m.homeScore} - {m.awayScore} {m.awayTeam} <Text c="orange" component="span">(Pending)</Text></Text>
                  <Text c="dimmed">Date: {new Date(m.finishedAt || m.date).toLocaleString()}</Text>
                  {m.events && m.events.length > 0 && (
                    <div style={{ marginTop: 6 }}>
                      {m.events.map((ev: any, i: number) => (
                        <Paper key={i} p="xs" style={{ marginTop: 6 }}>
                          <Text>{ev.type} - {ev.action} @ {formatTime(ev.time)}</Text>
                          <Text c="dimmed" size="xs">{new Date(ev.timestamp).toLocaleString()}</Text>
                        </Paper>
                      ))}
                    </div>
                  )}
                </Paper>
              ))}
            </Stack>
          </Paper>
        )}

        {matches.length === 0 && (
          <Paper p="md">
            <Text>No finished matches yet.</Text>
          </Paper>
        )}

        {matches.map((m: any, idx: number) => (
          <Paper key={m.id || idx} p="md" withBorder>
            <Group style={{ justifyContent: 'space-between' }}>
              <div>
                <Text size="lg" fw={700}>{m.homeTeam} {m.homeScore} - {m.awayScore} {m.awayTeam}</Text>
                <Text c="dimmed">Date: {new Date(m.finishedAt || m.date).toLocaleString()}</Text>
              </div>
              <div>
                <Text>Duration: {formatTime(m.finalTime)}</Text>
                <Button color="red" variant="light" onClick={() => { setToDeleteId(m.id || m._tempId || String(idx)); setConfirmOpen(true); }}>Delete</Button>
              </div>
            </Group>

            {m.events && m.events.length > 0 && (
              <Stack mt="sm">
                <Text fw={600}>Events</Text>
                {m.events.map((ev: any, i: number) => (
                  <Paper key={i} p="sm">
                    <Text>{ev.type} - {ev.action} @ {formatTime(ev.time)}</Text>
                    <Text c="dimmed" size="xs">{new Date(ev.timestamp).toLocaleString()}</Text>
                  </Paper>
                ))}
              </Stack>
            )}
          </Paper>
        ))}
        <Modal opened={confirmOpen} onClose={() => { setConfirmOpen(false); setToDeleteId(null); }} title="Delete match" centered>
          <Stack>
            <Text>Are you sure you want to permanently delete this match from history?</Text>
            <Group style={{ justifyContent: 'flex-end' }}>
              <Button variant="default" onClick={() => { setConfirmOpen(false); setToDeleteId(null); }}>Cancel</Button>
              <Button color="red" onClick={async () => {
                if (!toDeleteId) return;
                try {
                  // If the id corresponds to a pending local match, remove it from localStorage
                  const raw = localStorage.getItem(LOCAL_PENDING_MATCHES_KEY);
                  const parsed = raw ? JSON.parse(raw) : [];
                  const isPending = Array.isArray(parsed) && parsed.some((p: any) => p._tempId === toDeleteId);
                  if (isPending) {
                    const filtered = parsed.filter((p: any) => p._tempId !== toDeleteId);
                    localStorage.setItem(LOCAL_PENDING_MATCHES_KEY, JSON.stringify(filtered));
                    setPendingMatches(Array.isArray(filtered) ? filtered.reverse() : []);
                    showNotification({ title: 'Deleted', message: 'Pending match removed.' });
                  } else {
                    const ok = await deleteMatch(toDeleteId);
                    if (ok) showNotification({ title: 'Deleted', message: 'Match deleted from history.' });
                    else showNotification({ title: 'Delete failed', message: 'Could not delete match.' });
                  }
                } catch (e) {
                  // eslint-disable-next-line no-console
                  console.error('Failed to delete match', e);
                } finally {
                  setConfirmOpen(false);
                  setToDeleteId(null);
                }
              }}>Delete</Button>
            </Group>
          </Stack>
        </Modal>
      </Stack>
    </Container>
  );
}
