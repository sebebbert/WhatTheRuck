import { useState, useEffect } from 'react';
import { useMatch } from '../context/MatchContext';
import { Button, TextInput, Stack, Title, Container } from '@mantine/core';
import { useNavigate } from 'react-router-dom';

export function NewMatch() {
  const [homeTeam, setHomeTeam] = useState('');
  const [awayTeam, setAwayTeam] = useState('');
  const [hasHistory, setHasHistory] = useState(false);
  const { startNewMatch, loadMatches } = useMatch();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const matches = await loadMatches();
        setHasHistory(Array.isArray(matches) && matches.length > 0);
      } catch (e) {
        setHasHistory(false);
      }
    })();
  }, []);

  const handleStartMatch = () => {
    if (homeTeam && awayTeam) {
      startNewMatch(homeTeam, awayTeam);
      navigate('/WhatTheRuck/match');
    }
  };

  return (
    <Container size="sm">
      <Stack gap="md">
        <Title order={2}>Start New Match</Title>
        <TextInput
          label="Home Team"
          value={homeTeam}
          onChange={(e) => setHomeTeam(e.target.value)}
          required
        />
        <TextInput
          label="Away Team"
          value={awayTeam}
          onChange={(e) => setAwayTeam(e.target.value)}
          required
        />
        <Button 
          onClick={handleStartMatch} 
          disabled={!homeTeam || !awayTeam}
        >
          Start Match
        </Button>
        {hasHistory && (
          <Button variant="outline" onClick={() => navigate('/WhatTheRuck/history')}>View Match History</Button>
        )}
      </Stack>
    </Container>
  );
}