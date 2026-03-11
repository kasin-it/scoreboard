export class Match {
  constructor(homeTeam: string, awayTeam: string) {
    throw new Error("Not implemented");
  }

  get homeTeam(): string {
    throw new Error("Not implemented");
  }

  get awayTeam(): string {
    throw new Error("Not implemented");
  }

  get homeScore(): number {
    throw new Error("Not implemented");
  }

  get awayScore(): number {
    throw new Error("Not implemented");
  }

  get totalScore(): number {
    throw new Error("Not implemented");
  }

  updateScore(homeScore: number, awayScore: number): void {
    throw new Error("Not implemented");
  }
}
