import { useMatch } from '../context/MatchContext';
import { Button, Group, Stack, Title, Container, Grid, Paper, Text } from '@mantine/core';

export function LiveMatch() {
  const { currentMatch, updateStats } = useMatch();

  if (!currentMatch) {
    return <div>No active match</div>;
  }

  return (
    <Container>
      <Stack gap="md">
        <Title order={2}>Live Match</Title>
        
        <Paper p="md" withBorder>
          <Group justify="space-between">
            <Text size="xl">{currentMatch.homeTeam}</Text>
            <Text size="xl" fw={700}>{currentMatch.homeScore} - {currentMatch.awayScore}</Text>
            <Text size="xl">{currentMatch.awayTeam}</Text>
          </Group>
        </Paper>

        <Grid>
          <Grid.Col span={6}>
            <Paper p="md" withBorder>
              <Stack gap="md">
                <Title order={3}>Scrums</Title>
                <Group>
                  <Button onClick={() => updateStats('scrum', 'won')}>Won ({currentMatch.stats.scrums.won})</Button>
                  <Button onClick={() => updateStats('scrum', 'lost')}>Lost ({currentMatch.stats.scrums.lost})</Button>
                </Group>
              </Stack>
            </Paper>
          </Grid.Col>

          <Grid.Col span={6}>
            <Paper p="md" withBorder>
              <Stack gap="md">
                <Title order={3}>Lineouts</Title>
                <Group>
                  <Button onClick={() => updateStats('lineout', 'won')}>Won ({currentMatch.stats.lineouts.won})</Button>
                  <Button onClick={() => updateStats('lineout', 'lost')}>Lost ({currentMatch.stats.lineouts.lost})</Button>
                </Group>
              </Stack>
            </Paper>
          </Grid.Col>

          <Grid.Col span={6}>
            <Paper p="md" withBorder>
              <Stack gap="md">
                <Title order={3}>Turnovers</Title>
                <Group>
                  <Button onClick={() => updateStats('turnover', 'won')}>Won ({currentMatch.stats.turnovers.won})</Button>
                  <Button onClick={() => updateStats('turnover', 'conceded')}>Conceded ({currentMatch.stats.turnovers.conceded})</Button>
                </Group>
              </Stack>
            </Paper>
          </Grid.Col>

          <Grid.Col span={6}>
            <Paper p="md" withBorder>
              <Stack gap="md">
                <Title order={3}>Penalties</Title>
                <Group>
                  <Button onClick={() => updateStats('penalty', 'for')}>For ({currentMatch.stats.penalties.for})</Button>
                  <Button onClick={() => updateStats('penalty', 'against')}>Against ({currentMatch.stats.penalties.against})</Button>
                </Group>
              </Stack>
            </Paper>
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
}