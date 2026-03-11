export class Scoreboard {
  startMatch(homeTeam: string, awayTeam: string): void {
    throw new Error("Not implemented");
  }

  updateScore(
    homeTeam: string,
    awayTeam: string,
    homeScore: number,
    awayScore: number,
  ): void {
    throw new Error("Not implemented");
  }

  finishMatch(homeTeam: string, awayTeam: string): void {
    throw new Error("Not implemented");
  }

  getSummary(): {
    homeTeam: string;
    awayTeam: string;
    homeScore: number;
    awayScore: number;
  }[] {
    throw new Error("Not implemented");
  }
}
