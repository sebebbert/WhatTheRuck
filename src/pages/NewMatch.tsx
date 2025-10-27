import { useState, useEffect } from 'react';
import { useMatch } from '../context/MatchContext';
import { Button, TextInput, Stack, Title, Container, ActionIcon } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { IconSettings } from '@tabler/icons-react';

export function NewMatch() {
  const [homeTeam, setHomeTeam] = useState('');
  const [awayTeam, setAwayTeam] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { startNewMatch, validateSessionPassword, isSessionAuthenticated, isPasswordSet } = useMatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isPasswordSet) {
      navigate('/WhatTheRuck/password');
    }
  }, [isPasswordSet, navigate]);

  const handleStartMatch = async () => {
    if (!isSessionAuthenticated) {
      if (!password) {
        setError('Password is required');
        return;
      }
      const isValid = await validateSessionPassword(password);
      if (!isValid) {
        setError('Incorrect password');
        return;
      }
      setPassword(''); // Clear password after successful authentication
    }

    if (homeTeam && awayTeam) {
      startNewMatch(homeTeam, awayTeam);
      navigate('/WhatTheRuck/match');
    }
  };

  return (
    <Container size="sm">
      <Stack gap="md">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title order={2}>Start New Match</Title>
          <ActionIcon 
            variant="light" 
            size="lg" 
            onClick={() => navigate('/WhatTheRuck/password')}
            title="Password Settings"
          >
            <IconSettings size="1.2rem" />
          </ActionIcon>
        </div>
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
        {!isSessionAuthenticated && (
          <TextInput
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={error}
            required
          />
        )}
        <Button 
          onClick={handleStartMatch} 
          disabled={!homeTeam || !awayTeam || (!isSessionAuthenticated && !password)}
        >
          Start Match
        </Button>
      </Stack>
    </Container>
  );
}