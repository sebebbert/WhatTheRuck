import { useState } from 'react';
import { Button, TextInput, Stack, Title, Container, Paper, Text } from '@mantine/core';
import { useMatch } from '../context/MatchContext';

export function PasswordSetup() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { initializePassword, isPasswordSet } = useMatch();

  const handleSetPassword = async () => {
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    await initializePassword(password);
    setPassword('');
    setConfirmPassword('');
    setError('');
  };

  if (isPasswordSet) {
    return null;
  }

  return (
    <Container size="sm">
      <Paper p="md" withBorder>
        <Stack gap="md">
          <Title order={2}>Set Application Password</Title>
          <Text size="sm" c="dimmed">
            Please set a password that will be required to start new matches.
          </Text>
          <TextInput
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            error={error}
          />
          <TextInput
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <Button onClick={handleSetPassword} disabled={!password || !confirmPassword}>
            Set Password
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}