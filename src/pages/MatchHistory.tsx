import { useEffect, useState } from 'react';
import { Container, Title, Stack, Paper, Text, Button, Group, Modal } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { useNavigate } from 'react-router-dom';
import { useMatch } from '../context/MatchContext';
import { useAuth } from '../context/AuthContext';

export function MatchHistory() {
  const [matches, setMatches] = useState<Array<any>>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState<string | null>(null);
  const navigate = useNavigate();

  const { user } = useAuth();
  const { loadMatches, subscribeToMatches, deleteMatch } = useMatch();

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
                  const ok = await deleteMatch(toDeleteId);
                  if (ok) showNotification({ title: 'Deleted', message: 'Match deleted from history.' });
                  else showNotification({ title: 'Delete failed', message: 'Could not delete match.' });
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
