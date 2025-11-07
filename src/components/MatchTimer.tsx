import { useEffect, useState } from 'react';
import { Button, Group, Text, Modal, Stack } from '@mantine/core';

interface MatchTimerProps {
  onTimeUpdate: (time: number) => void;
  onFinish?: () => void;
  onRunningChange?: (running: boolean) => void;
}

export function MatchTimer({ onTimeUpdate, onRunningChange, onFinish }: MatchTimerProps) {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    let intervalId: number;

    if (isRunning) {
      intervalId = window.setInterval(() => {
        setTime((prevTime) => {
          const newTime = prevTime + 1;
          onTimeUpdate(newTime);
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isRunning, onTimeUpdate]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Group>
      <Text size="xl" fw={700}>{formatTime(time)}</Text>
      <Button onClick={() => setIsRunning(prev => { const next = !prev; onRunningChange?.(next); return next; })}>
        {isRunning ? 'Pause' : 'Start'}
      </Button>
      {isRunning && (
        <>
          <Button color="red" onClick={() => setConfirmOpen(true)}>
            Finish
          </Button>

          <Modal
            opened={confirmOpen}
            onClose={() => setConfirmOpen(false)}
            title="Finish match"
            centered
          >
            <Stack>
              <Text>Are you sure you want to finish the match? This will stop the timer.</Text>
              <Group style={{ justifyContent: 'flex-end' }}>
                <Button variant="default" onClick={() => setConfirmOpen(false)}>Cancel</Button>
                <Button color="red" onClick={() => {
                  setConfirmOpen(false);
                  setIsRunning(false);
                  onRunningChange?.(false);
                  onFinish?.();
                }}>Finish match</Button>
              </Group>
            </Stack>
          </Modal>
        </>
      )}
    </Group>
  );
}