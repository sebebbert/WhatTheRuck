export interface Match {
  id: string;
  date: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  stats: MatchStats;
}

export interface MatchStats {
  scrums: SetPieceStats;
  lineouts: SetPieceStats;
  turnovers: TurnoverStats;
  penalties: PenaltyStats;
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