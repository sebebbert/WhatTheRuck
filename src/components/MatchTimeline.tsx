import { Timeline, Text } from '@mantine/core';
import { type MatchEvent } from '../types';

interface MatchTimelineProps {
  events: MatchEvent[];
}

export function MatchTimeline({ events }: MatchTimelineProps) {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatEvent = (event: MatchEvent) => {
    switch (event.type) {
      case 'scrum':
        return `Scrum ${event.action}`;
      case 'lineout':
        return `Lineout ${event.action}`;
      case 'turnover':
        return `Turnover ${event.action}`;
      case 'penalty':
        return `Penalty ${event.action}`;
      case 'card':
        const [team, type] = event.action.split('-');
        return `${type.charAt(0).toUpperCase() + type.slice(1)} card - ${team}`;
      case 'knockOn':
        return `Knock on - ${event.action}`;
      default:
        return `${event.type} - ${event.action}`;
    }
  };

  return (
    <Timeline>
      {events.map((event, index) => (
        <Timeline.Item key={index} title={formatEvent(event)}>
          <Text size="sm" c="dimmed">{formatTime(event.time)}</Text>
        </Timeline.Item>
      ))}
    </Timeline>
  );
}