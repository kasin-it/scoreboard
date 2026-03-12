import { Scoreboard } from "../src/Scoreboard.js";

describe("Scoreboard", () => {
  let scoreboard: Scoreboard;

  beforeEach(() => {
    scoreboard = new Scoreboard();
  });

  describe("startMatch", () => {
    it("should start a match with score 0-0", () => {
      scoreboard.startMatch("Spain", "Brazil");

      const summary = scoreboard.getSummary();

      expect(summary).toHaveLength(1);
      expect(summary[0]).toEqual({
        homeTeam: "Spain",
        awayTeam: "Brazil",
        homeScore: 0,
        awayScore: 0,
      });
    });

    it("should throw error if home team is already playing", () => {
      scoreboard.startMatch("Spain", "Brazil");

      expect(() => scoreboard.startMatch("Spain", "France")).toThrow();
    });

    it("should throw error if away team is already playing", () => {
      scoreboard.startMatch("Spain", "Brazil");

      expect(() => scoreboard.startMatch("France", "Brazil")).toThrow();
    });

    it("should throw error if team is playing in opposite role", () => {
      scoreboard.startMatch("Spain", "Brazil");

      expect(() => scoreboard.startMatch("Brazil", "France")).toThrow();
    });

    it("should treat differently cased names as different teams", () => {
      scoreboard.startMatch("mexico", "Canada");

      scoreboard.startMatch("Mexico", "Brazil");

      expect(scoreboard.getSummary()).toHaveLength(2);
    });

    it("should treat untrimmed names as different teams", () => {
      scoreboard.startMatch("Spain", "Brazil");

      scoreboard.startMatch(" Spain", "France");

      expect(scoreboard.getSummary()).toHaveLength(2);
    });

    it("should throw error for empty home team name", () => {
      expect(() => scoreboard.startMatch("", "Brazil")).toThrow();
    });

    it("should throw error for empty away team name", () => {
      expect(() => scoreboard.startMatch("Spain", "")).toThrow();
    });

    it("should throw error when home and away team are the same", () => {
      expect(() => scoreboard.startMatch("Spain", "Spain")).toThrow();
    });
  });

  describe("updateScore", () => {
    it("should update score of an existing match", () => {
      scoreboard.startMatch("Spain", "Brazil");

      scoreboard.updateScore("Spain", "Brazil", 2, 3);

      const summary = scoreboard.getSummary();
      expect(summary[0]).toEqual({
        homeTeam: "Spain",
        awayTeam: "Brazil",
        homeScore: 2,
        awayScore: 3,
      });
    });

    it("should throw error when match does not exist", () => {
      expect(() => scoreboard.updateScore("Spain", "Brazil", 1, 0)).toThrow();
    });

    it("should throw error when team names are in reverse order", () => {
      scoreboard.startMatch("Spain", "Brazil");

      expect(() => scoreboard.updateScore("Brazil", "Spain", 1, 0)).toThrow();
    });
  });

  describe("finishMatch", () => {
    it("should remove match from scoreboard", () => {
      scoreboard.startMatch("Spain", "Brazil");

      scoreboard.finishMatch("Spain", "Brazil");

      expect(scoreboard.getSummary()).toHaveLength(0);
    });

    it("should throw error when match does not exist", () => {
      expect(() => scoreboard.finishMatch("Spain", "Brazil")).toThrow();
    });

    it("should throw error when finishing an already finished match", () => {
      scoreboard.startMatch("Spain", "Brazil");
      scoreboard.finishMatch("Spain", "Brazil");

      expect(() => scoreboard.finishMatch("Spain", "Brazil")).toThrow();
    });

    it("should throw error when team names are in reverse order", () => {
      scoreboard.startMatch("Spain", "Brazil");

      expect(() => scoreboard.finishMatch("Brazil", "Spain")).toThrow();
    });

    it("should allow team to play again after match is finished", () => {
      scoreboard.startMatch("Spain", "Brazil");
      scoreboard.finishMatch("Spain", "Brazil");

      scoreboard.startMatch("Spain", "France");

      const summary = scoreboard.getSummary();
      expect(summary).toHaveLength(1);
      expect(summary[0]?.homeTeam).toBe("Spain");
      expect(summary[0]?.awayTeam).toBe("France");
    });
  });

  describe("getSummary", () => {
    it("should return empty array when no matches", () => {
      expect(scoreboard.getSummary()).toEqual([]);
    });

    it("should order matches by total score descending", () => {
      scoreboard.startMatch("Mexico", "Canada");
      scoreboard.startMatch("Spain", "Brazil");

      scoreboard.updateScore("Mexico", "Canada", 0, 5);
      scoreboard.updateScore("Spain", "Brazil", 10, 2);

      const summary = scoreboard.getSummary();
      expect(summary[0]?.homeTeam).toBe("Spain");
      expect(summary[1]?.homeTeam).toBe("Mexico");
    });

    it("should order matches with same total score by most recently started first", () => {
      scoreboard.startMatch("Mexico", "Canada");
      scoreboard.startMatch("Spain", "Brazil");

      scoreboard.updateScore("Mexico", "Canada", 2, 2);
      scoreboard.updateScore("Spain", "Brazil", 3, 1);

      const summary = scoreboard.getSummary();
      expect(summary[0]?.homeTeam).toBe("Spain");
      expect(summary[1]?.homeTeam).toBe("Mexico");
    });

    it("should return a snapshot (not affected by later changes)", () => {
      scoreboard.startMatch("Spain", "Brazil");
      const summary = scoreboard.getSummary();

      scoreboard.updateScore("Spain", "Brazil", 3, 0);

      expect(summary[0]?.homeScore).toBe(0);
    });

    it("should match the example from requirements", () => {
      scoreboard.startMatch("Mexico", "Canada");
      scoreboard.startMatch("Spain", "Brazil");
      scoreboard.startMatch("Germany", "France");
      scoreboard.startMatch("Uruguay", "Italy");
      scoreboard.startMatch("Argentina", "Australia");

      scoreboard.updateScore("Mexico", "Canada", 0, 5);
      scoreboard.updateScore("Spain", "Brazil", 10, 2);
      scoreboard.updateScore("Germany", "France", 2, 2);
      scoreboard.updateScore("Uruguay", "Italy", 6, 6);
      scoreboard.updateScore("Argentina", "Australia", 3, 1);

      const summary = scoreboard.getSummary();

      expect(summary).toEqual([
        { homeTeam: "Uruguay", awayTeam: "Italy", homeScore: 6, awayScore: 6 },
        { homeTeam: "Spain", awayTeam: "Brazil", homeScore: 10, awayScore: 2 },
        { homeTeam: "Mexico", awayTeam: "Canada", homeScore: 0, awayScore: 5 },
        { homeTeam: "Argentina", awayTeam: "Australia", homeScore: 3, awayScore: 1 },
        { homeTeam: "Germany", awayTeam: "France", homeScore: 2, awayScore: 2 },
      ]);
    });
  });
});
