import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button, TextInput, Stack, Title, Container, Alert } from '@mantine/core';
import { useNavigate, useLocation } from 'react-router-dom';

export function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/WhatTheRuck';

  const handleLogin = async () => {
    if (username && password) {
      const success = await login(username, password);
      if (success) {
        navigate(from, { replace: true });
      } else {
        setError('Invalid username or password');
      }
    }
  };

  return (
    <Container size="xs">
      <Stack gap="md">
        <Title order={2}>Login</Title>
        {error && (
          <Alert color="red" title="Error">
            {error}
          </Alert>
        )}
        <TextInput
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <TextInput
          type="password"
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button 
          onClick={handleLogin} 
          disabled={!username || !password}
        >
          Login
        </Button>
      </Stack>
    </Container>
  );
}