export class Match {
  private _homeTeam: string;
  private _awayTeam: string;
  private _homeScore: number = 0;
  private _awayScore: number = 0;

  constructor(homeTeam: string, awayTeam: string) {
    if (!homeTeam.trim()) {
      throw new Error("Home team name cannot be empty");
    }
    if (!awayTeam.trim()) {
      throw new Error("Away team name cannot be empty");
    }
    if (homeTeam === awayTeam) {
      throw new Error("Home and away team cannot be the same");
    }

    this._homeTeam = homeTeam;
    this._awayTeam = awayTeam;
  }

  get homeTeam(): string {
    return this._homeTeam;
  }

  get awayTeam(): string {
    return this._awayTeam;
  }

  get homeScore(): number {
    return this._homeScore;
  }

  get awayScore(): number {
    return this._awayScore;
  }

  get totalScore(): number {
    return this._homeScore + this._awayScore;
  }

  updateScore(homeScore: number, awayScore: number): void {
    this.validateScore(homeScore, "Home");
    this.validateScore(awayScore, "Away");

    this._homeScore = homeScore;
    this._awayScore = awayScore;
  }

  private validateScore(score: number, label: string): void {
    if (!Number.isInteger(score)) {
      throw new Error(`${label} score must be a valid integer`);
    }
    if (score < 0) {
      throw new Error(`${label} score cannot be negative`);
    }
  }
}
