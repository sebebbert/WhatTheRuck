import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Title, Stack } from '@mantine/core';
import { auth } from '../firebase';
import * as firebaseui from 'firebaseui';
import { EmailAuthProvider } from 'firebase/auth';

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/WhatTheRuck';

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Reuse or create AuthUI instance
    let ui: firebaseui.auth.AuthUI | null = null;
    try {
      // @ts-ignore
      ui = firebaseui.auth.AuthUI.getInstance() as firebaseui.auth.AuthUI | null;
    } catch (e) {
      ui = null;
    }
    if (!ui) ui = new firebaseui.auth.AuthUI(auth);

    const uiConfig: firebaseui.auth.Config = {
      // standard Email/Password provider
      signInOptions: [EmailAuthProvider.PROVIDER_ID],
      callbacks: {
        signInSuccessWithAuthResult: () => {
          navigate(from, { replace: true });
          return false;
        },
      },
      signInFlow: 'popup',
    };

    // Start UI once the container is available
    const start = async () => {
      for (let i = 0; i < 20; i++) {
        if (containerRef.current) break;
        await new Promise((r) => setTimeout(r, 50));
      }
      if (containerRef.current) ui!.start(containerRef.current, uiConfig);
    };
    start();

    return () => {
      try {
        ui?.reset();
      } catch (e) {
        // ignore
      }
    };
  }, [navigate, from]);

  return (
    <Container size="xs">
      <Stack>
        <Title order={2}>Login</Title>
      </Stack>

      <div id="firebaseui-auth-container" ref={containerRef} />
    </Container>
  );
}