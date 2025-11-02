import { useMatch } from '../context/MatchContext';
import { Button, Group, Stack, Title, Container, Grid, Paper, Text } from '@mantine/core';
import { MatchTimer } from '../components/MatchTimer';
import { MatchTimeline } from '../components/MatchTimeline';

export function LiveMatch() {
  const { currentMatch, updateStats, setMatchTime, addScore } = useMatch();

  if (!currentMatch) {
    return <div>No active match</div>;
  }

  return (
    <Container>
      <Stack gap="md">
        <Title order={2}>Live Match</Title>
        
        <Paper p="md" withBorder>
          <Stack gap="md">
            <MatchTimer onTimeUpdate={setMatchTime} />
            <Group justify="space-between">
              <Text size="xl">{currentMatch.homeTeam}</Text>
              <Text size="xl" fw={700}>{currentMatch.homeScore} - {currentMatch.awayScore}</Text>
              <Text size="xl">{currentMatch.awayTeam}</Text>
            </Group>

            {/* Score controls */}
            <Group justify="center" style={{ gap: 24 }}>
              <Stack align="center">
                <Text size="sm">Home Score</Text>
                <Group>
                  <Button color="blue" onClick={() => addScore('home', 'try')}>Try (+5)</Button>
                  <Button color="blue" onClick={() => addScore('home', 'conversion')}>Conversion (+2)</Button>
                  <Button color="blue" onClick={() => addScore('home', 'penalty')}>Penalty (+3)</Button>
                </Group>
              </Stack>

              <Stack align="center">
                <Text size="sm">Away Score</Text>
                <Group>
                  <Button color="blue" onClick={() => addScore('away', 'try')}>Try (+5)</Button>
                  <Button color="blue" onClick={() => addScore('away', 'conversion')}>Conversion (+2)</Button>
                  <Button color="blue" onClick={() => addScore('away', 'penalty')}>Penalty (+3)</Button>
                </Group>
              </Stack>
            </Group>
          </Stack>
        </Paper>

        <Grid>
          <Grid.Col span={12}>
            <Paper p="md" withBorder>
              <Stack gap="md">
                <Title order={3}>Scrums</Title>
                <Group grow>
                  <Button onClick={() => updateStats('scrum', 'won')}>Won ({currentMatch.stats.scrums.won})</Button>
                  <Button onClick={() => updateStats('scrum', 'lost')}>Lost ({currentMatch.stats.scrums.lost})</Button>
                </Group>
              </Stack>
            </Paper>
          </Grid.Col>

          <Grid.Col span={12}>
            <Paper p="md" withBorder>
              <Stack gap="md">
                <Title order={3}>Lineouts</Title>
                <Group grow>
                  <Button onClick={() => updateStats('lineout', 'won')}>Won ({currentMatch.stats.lineouts.won})</Button>
                  <Button onClick={() => updateStats('lineout', 'lost')}>Lost ({currentMatch.stats.lineouts.lost})</Button>
                </Group>
              </Stack>
            </Paper>
          </Grid.Col>

          <Grid.Col span={12}>
            <Paper p="md" withBorder>
              <Stack gap="md">
                <Title order={3}>Knock Ons</Title>
                <Group grow>
                  <Button onClick={() => updateStats('knockOn', 'home')}>Produced ({currentMatch.stats.knockOns.home})</Button>
                  <Button onClick={() => updateStats('knockOn', 'away')}>Forced ({currentMatch.stats.knockOns.away})</Button>
                </Group>
              </Stack>
            </Paper>
          </Grid.Col>

          <Grid.Col span={12}>
            <Paper p="md" withBorder>
              <Stack gap="md">
                <Title order={3}>Turnovers</Title>
                <Group grow>
                  <Button onClick={() => updateStats('turnover', 'won')}>Won ({currentMatch.stats.turnovers.won})</Button>
                  <Button onClick={() => updateStats('turnover', 'conceded')}>Conceded ({currentMatch.stats.turnovers.conceded})</Button>
                </Group>
              </Stack>
            </Paper>
          </Grid.Col>

          <Grid.Col span={12}>
            <Paper p="md" withBorder>
              <Stack gap="md">
                <Title order={3}>Penalties</Title>
                <Group grow>
                  <Button onClick={() => updateStats('penalty', 'for')}>For ({currentMatch.stats.penalties.for})</Button>
                  <Button onClick={() => updateStats('penalty', 'against')}>Against ({currentMatch.stats.penalties.against})</Button>
                </Group>
              </Stack>
            </Paper>
          </Grid.Col>

          <Grid.Col span={12}>
            <Paper p="md" withBorder>
              <Stack gap="md">
                <Title order={3}>Cards</Title>
                <Grid>
                  <Grid.Col span={12}>
                    <Grid>
                      <Grid.Col span={6}>
                        <Stack gap="md">
                          <Button fullWidth color="yellow" onClick={() => updateStats('card', 'home-yellow')}>
                            {currentMatch.stats.cards.home.yellow}
                          </Button>
                          <Button fullWidth color="red" onClick={() => updateStats('card', 'home-red')}>
                            {currentMatch.stats.cards.home.red}
                          </Button>
                        </Stack>
                      </Grid.Col>
                      <Grid.Col span={6}>
                        <Stack gap="md">
                          <Button fullWidth color="yellow" onClick={() => updateStats('card', 'away-yellow')}>
                            {currentMatch.stats.cards.away.yellow}
                          </Button>
                          <Button fullWidth color="red" onClick={() => updateStats('card', 'away-red')}>
                            {currentMatch.stats.cards.away.red}
                          </Button>
                        </Stack>
                      </Grid.Col>
                    </Grid>
                  </Grid.Col>
                </Grid>
              </Stack>
            </Paper>
          </Grid.Col>

        </Grid>

        <Paper p="md" withBorder>
          <Stack gap="md">
            <Title order={3}>Match Timeline</Title>
            <MatchTimeline events={currentMatch.events} />
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}