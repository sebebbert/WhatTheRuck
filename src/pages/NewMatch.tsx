import { useState } from 'react';
import { useMatch } from '../context/MatchContext';
import { Button, TextInput, Stack, Title, Container } from '@mantine/core';
import { useNavigate } from 'react-router-dom';

export function NewMatch() {
  const [homeTeam, setHomeTeam] = useState('');
  const [awayTeam, setAwayTeam] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { startNewMatch } = useMatch();
  const navigate = useNavigate();

  const handleStartMatch = async () => {
    if (homeTeam && awayTeam && password) {
      setError('');
      const success = await startNewMatch(homeTeam, awayTeam, password);
      if (success) {
        navigate('/WhatTheRuck/match');
      } else {
        setError('Incorrect password');
      }
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
        <TextInput
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={error}
          required
        />
        <Button onClick={handleStartMatch} disabled={!homeTeam || !awayTeam || !password}>
          Start Match
        </Button>
      </Stack>
    </Container>
  );
}