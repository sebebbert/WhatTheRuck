import { useState, useEffect } from 'react';
import { useMatch } from '../context/MatchContext';
import { LOCAL_PENDING_MATCHES_KEY, LEGACY_MATCHES_KEY } from '../constants';
import { Button, TextInput, Stack, Title, Container } from '@mantine/core';
import { useNavigate } from 'react-router-dom';

export function NewMatch() {
  const [homeTeam, setHomeTeam] = useState('');
  const [awayTeam, setAwayTeam] = useState('');
  const [hasHistory, setHasHistory] = useState(false);
  const { startNewMatch, loadMatches } = useMatch();
  const navigate = useNavigate();
  const base = (import.meta.env && (import.meta.env.BASE_URL as string)) || '/';

  useEffect(() => {
    (async () => {
      try {
        const matches = await loadMatches();
        // Also check localStorage legacy and pending keys for offline history
        let hasLocal = false;
        try {
          const rawLegacy = localStorage.getItem(LEGACY_MATCHES_KEY);
          const rawPending = localStorage.getItem(LOCAL_PENDING_MATCHES_KEY);
          const legacyArr = rawLegacy ? JSON.parse(rawLegacy) : [];
          const pendingArr = rawPending ? JSON.parse(rawPending) : [];
          if ((Array.isArray(legacyArr) && legacyArr.length > 0) || (Array.isArray(pendingArr) && pendingArr.length > 0)) {
            hasLocal = true;
          }
        } catch (e) {
          hasLocal = false;
        }

        setHasHistory((Array.isArray(matches) && matches.length > 0) || hasLocal);
      } catch (e) {
        setHasHistory(false);
      }
    })();
  }, []);

  const handleStartMatch = () => {
    if (homeTeam && awayTeam) {
      startNewMatch(homeTeam, awayTeam);
      navigate(`${base}match`);
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
          <Button variant="outline" onClick={() => navigate(`${base}history`)}>View Match History</Button>
        )}
      </Stack>
    </Container>
  );
}
