import { useState } from 'react';
import { Button, TextInput, Stack, Title, Container, Paper, Text } from '@mantine/core';
import { useMatch } from '../context/MatchContext';

export function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { changePassword } = useMatch();

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      setSuccess('');
      return;
    }
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long');
      setSuccess('');
      return;
    }

    const result = await changePassword(currentPassword, newPassword);
    if (result) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setError('');
      setSuccess('Password changed successfully');
    } else {
      setError('Current password is incorrect');
      setSuccess('');
    }
  };

  return (
    <Container size="sm">
      <Paper p="md" withBorder>
        <Stack gap="md">
          <Title order={2}>Change Password</Title>
          {success && <Text c="green">{success}</Text>}
          <TextInput
            label="Current Password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
          <TextInput
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            error={error}
          />
          <TextInput
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <Button 
            onClick={handleChangePassword} 
            disabled={!currentPassword || !newPassword || !confirmPassword}
          >
            Change Password
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}