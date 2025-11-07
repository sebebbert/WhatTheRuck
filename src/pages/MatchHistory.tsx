import { useEffect, useState } from 'react';
import { Container, Title, Stack, Paper, Text, Button, Group } from '@mantine/core';
import { useNavigate } from 'react-router-dom';

export function MatchHistory() {
  const [matches, setMatches] = useState<Array<any>>([]);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const stored = localStorage.getItem('wtr_matches');
      const parsed = stored ? JSON.parse(stored) : [];
      setMatches(parsed.reverse()); // newest first
    } catch (e) {
      setMatches([]);
    }
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
      </Stack>
    </Container>
  );
}
