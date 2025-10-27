export interface MatchEvent {
  type: string;
  action: string;
  time: number;
  timestamp: string;
}

export interface Match {
  id: string;
  date: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  stats: MatchStats;
  events: MatchEvent[];
}

export interface MatchStats {
  scrums: SetPieceStats;
  lineouts: SetPieceStats;
  turnovers: TurnoverStats;
  penalties: PenaltyStats;
  cards: CardStats;
  knockOns: KnockOnStats;
}

export interface SetPieceStats {
  won: number;
  lost: number;
}

export interface TurnoverStats {
  won: number;
  conceded: number;
}

export interface PenaltyStats {
  for: number;
  against: number;
}

export interface TeamCardStats {
  yellow: number;
  red: number;
}

export interface CardStats {
  home: TeamCardStats;
  away: TeamCardStats;
}

export interface KnockOnStats {
  home: number;
  away: number;
}