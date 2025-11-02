import { useEffect, useState } from 'react';
import { Button, Group, Text } from '@mantine/core';

interface MatchTimerProps {
  onTimeUpdate: (time: number) => void;
  onRunningChange?: (running: boolean) => void;
}

export function MatchTimer({ onTimeUpdate, onRunningChange }: MatchTimerProps) {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

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
    </Group>
  );
}