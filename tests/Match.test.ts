import { Match } from "../src/Match.js";

describe("Match", () => {
  describe("creation", () => {
    it("should create a match with home and away team", () => {
      const match = new Match("Spain", "Brazil");

      expect(match.homeTeam).toBe("Spain");
      expect(match.awayTeam).toBe("Brazil");
    });

    it("should start with score 0-0", () => {
      const match = new Match("Spain", "Brazil");

      expect(match.homeScore).toBe(0);
      expect(match.awayScore).toBe(0);
    });

    it("should throw error for empty home team name", () => {
      expect(() => new Match("", "Brazil")).toThrow();
    });

    it("should throw error for empty away team name", () => {
      expect(() => new Match("Spain", "")).toThrow();
    });

    it("should throw error for whitespace-only home team name", () => {
      expect(() => new Match("  ", "Brazil")).toThrow();
    });

    it("should throw error for whitespace-only away team name", () => {
      expect(() => new Match("Spain", "   ")).toThrow();
    });

    it("should throw error when home and away team are the same", () => {
      expect(() => new Match("Spain", "Spain")).toThrow();
    });

    it("should not trim team names", () => {
      const match = new Match(" Spain", "Brazil ");

      expect(match.homeTeam).toBe(" Spain");
      expect(match.awayTeam).toBe("Brazil ");
    });

    it("should treat differently cased names as different teams", () => {
      const match = new Match("mexico", "Mexico");

      expect(match.homeTeam).toBe("mexico");
      expect(match.awayTeam).toBe("Mexico");
    });
  });

  describe("updateScore", () => {
    it("should update the score", () => {
      const match = new Match("Spain", "Brazil");

      match.updateScore(2, 3);

      expect(match.homeScore).toBe(2);
      expect(match.awayScore).toBe(3);
    });

    it("should allow score to decrease (VAR correction)", () => {
      const match = new Match("Spain", "Brazil");

      match.updateScore(2, 3);
      match.updateScore(1, 3);

      expect(match.homeScore).toBe(1);
      expect(match.awayScore).toBe(3);
    });

    it("should throw error for negative home score", () => {
      const match = new Match("Spain", "Brazil");

      expect(() => match.updateScore(-1, 0)).toThrow();
    });

    it("should throw error for negative away score", () => {
      const match = new Match("Spain", "Brazil");

      expect(() => match.updateScore(0, -1)).toThrow();
    });

    it("should throw error for non-integer home score", () => {
      const match = new Match("Spain", "Brazil");

      expect(() => match.updateScore(1.5, 0)).toThrow();
    });

    it("should throw error for non-integer away score", () => {
      const match = new Match("Spain", "Brazil");

      expect(() => match.updateScore(0, 2.7)).toThrow();
    });

    it("should throw error for NaN score", () => {
      const match = new Match("Spain", "Brazil");

      expect(() => match.updateScore(NaN, 0)).toThrow();
    });

    it("should throw error for Infinity score", () => {
      const match = new Match("Spain", "Brazil");

      expect(() => match.updateScore(Infinity, 0)).toThrow();
    });
  });

  describe("totalScore", () => {
    it("should return sum of home and away scores", () => {
      const match = new Match("Spain", "Brazil");

      match.updateScore(2, 3);

      expect(match.totalScore).toBe(5);
    });
  });
});
