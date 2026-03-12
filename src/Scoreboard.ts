import { Match } from "./Match.js";

interface MatchEntry {
  match: Match;
  sequence: number;
}

export class Scoreboard {
  private matches: Map<string, MatchEntry> = new Map();
  private activeTeams: Set<string> = new Set();
  private sequence: number = 0;

  startMatch(homeTeam: string, awayTeam: string): void {
    if (this.activeTeams.has(homeTeam)) {
      throw new Error(`Team "${homeTeam}" is already playing`);
    }
    if (this.activeTeams.has(awayTeam)) {
      throw new Error(`Team "${awayTeam}" is already playing`);
    }

    const match = new Match(homeTeam, awayTeam);
    const key = this.buildKey(homeTeam, awayTeam);

    this.matches.set(key, { match, sequence: this.sequence++ });
    this.activeTeams.add(homeTeam);
    this.activeTeams.add(awayTeam);
  }

  updateScore(
    homeTeam: string,
    awayTeam: string,
    homeScore: number,
    awayScore: number,
  ): void {
    const { match } = this.findEntry(homeTeam, awayTeam);
    match.updateScore(homeScore, awayScore);
  }

  finishMatch(homeTeam: string, awayTeam: string): void {
    const { key } = this.findEntry(homeTeam, awayTeam);

    this.matches.delete(key);
    this.activeTeams.delete(homeTeam);
    this.activeTeams.delete(awayTeam);
  }

  getSummary(): {
    homeTeam: string;
    awayTeam: string;
    homeScore: number;
    awayScore: number;
  }[] {
    const entries = [...this.matches.values()];

    entries.sort((a, b) => {
      const scoreDiff = b.match.totalScore - a.match.totalScore;
      if (scoreDiff !== 0) return scoreDiff;

      return b.sequence - a.sequence;
    });

    return entries.map(({ match }) => ({
      homeTeam: match.homeTeam,
      awayTeam: match.awayTeam,
      homeScore: match.homeScore,
      awayScore: match.awayScore,
    }));
  }

  private buildKey(homeTeam: string, awayTeam: string): string {
    return JSON.stringify([homeTeam, awayTeam]);
  }

  private findEntry(
    homeTeam: string,
    awayTeam: string,
  ): MatchEntry & { key: string } {
    const key = this.buildKey(homeTeam, awayTeam);
    const entry = this.matches.get(key);

    if (!entry) {
      throw new Error(`Match "${homeTeam}" vs "${awayTeam}" not found`);
    }

    return { ...entry, key };
  }
}
