# Live Football World Cup Scoreboard

A simple library for tracking live football World Cup matches and their scores.

## How it works

The `Scoreboard` is an in-memory store that tracks ongoing football matches. Each match lives on the scoreboard from the moment it starts until it is finished. At any point, you can request a summary of all ongoing matches, sorted by total score (highest first). When two matches have the same total score, the one that started more recently appears first.

## API

### `startMatch(homeTeam: string, awayTeam: string): void`

Adds a new match to the scoreboard with an initial score of 0 - 0. A team cannot participate in more than one match at a time — starting a match with a team that is already playing throws an error.

### `updateScore(homeTeam: string, awayTeam: string, homeScore: number, awayScore: number): void`

Replaces the current score of an ongoing match with the provided absolute values. Scores must be non-negative integers. Scores can decrease (e.g., a VAR correction). Throws an error if the match does not exist.

### `finishMatch(homeTeam: string, awayTeam: string): void`

Removes an ongoing match from the scoreboard. The teams become available to participate in new matches. Throws an error if the match does not exist.

### `getSummary(): { homeTeam: string; awayTeam: string; homeScore: number; awayScore: number }[]`

Returns a snapshot of all ongoing matches, ordered by:
1. Total score (home + away), highest first
2. Most recently started first (as a tiebreaker)

The returned array is a snapshot — modifying scores after calling `getSummary` does not affect previously returned results.

## Usage

```typescript
import { Scoreboard } from "./Scoreboard.js";

const scoreboard = new Scoreboard();

// Start matches — each begins at 0-0
scoreboard.startMatch("Mexico", "Canada");
scoreboard.startMatch("Spain", "Brazil");
scoreboard.startMatch("Germany", "France");

// Update scores with absolute values
scoreboard.updateScore("Mexico", "Canada", 0, 5);
scoreboard.updateScore("Spain", "Brazil", 10, 2);
scoreboard.updateScore("Germany", "France", 2, 2);

// Summary is sorted by total score, then by most recently started
scoreboard.getSummary();
// [
//   { homeTeam: "Spain", awayTeam: "Brazil", homeScore: 10, awayScore: 2 },       // total: 12
//   { homeTeam: "Mexico", awayTeam: "Canada", homeScore: 0, awayScore: 5 },       // total: 5
//   { homeTeam: "Germany", awayTeam: "France", homeScore: 2, awayScore: 2 },      // total: 4
// ]

// Finish a match — removes it from the scoreboard
scoreboard.finishMatch("Mexico", "Canada");

// The team can now play again
scoreboard.startMatch("Canada", "France");

// Scores can decrease (e.g., VAR disallows a goal)
scoreboard.updateScore("Spain", "Brazil", 9, 2);

// Invalid operations throw errors:
// scoreboard.startMatch("Spain", "Italy");    // Error: Spain is already playing
// scoreboard.updateScore("USA", "Japan", 1, 0); // Error: match not found
// scoreboard.updateScore("Spain", "Brazil", -1, 0); // Error: negative score
// scoreboard.finishMatch("Mexico", "Canada");  // Error: already finished
```

## Assumptions

### 1. Team names are not normalized

- Team names are treated exactly as provided — no trimming, no case normalization
- `" Spain"` and `"Spain"` are different teams
- `"mexico"` and `"Mexico"` are different teams
- `startMatch("", "Brazil")` → throws error (empty name)
- `startMatch("  ", "Brazil")` → throws error (whitespace-only names are rejected, but this is a validation check — the library does not trim or modify the name)

> **Why?** We considered trimming and case-normalizing team names for convenience. However, team names come in many forms — abbreviations like `"USA"`, full names like `"United States of America"`, or locale-specific names like `"RPA"`. Trimming or lowercasing could silently corrupt these. It is safer to treat the library as a data store that respects exactly what it receives, and leave formatting responsibility to the consumer.

### 2. Team uniqueness across matches

- `startMatch("Spain", "Brazil")` then `startMatch("Spain", "France")` → throws error, Spain is already playing
- `startMatch("Spain", "Brazil")` then `startMatch("France", "Spain")` → also throws error, even as away team

### 3. Operations on non-existent matches throw errors

- `updateScore("Spain", "Brazil", 1, 0)` when no such match exists → throws error
- `finishMatch("Spain", "Brazil")` when no such match exists → throws error

### 4. Score updates allow decreases

- `startMatch("Spain", "Brazil")` → score is `0 - 0`
- `updateScore("Spain", "Brazil", 0, 3)` → valid, score becomes `0 - 3`
- `updateScore("Spain", "Brazil", 2, 3)` → valid, score becomes `2 - 3`
- `updateScore("Spain", "Brazil", 1, 3)` → valid, score can decrease (e.g., VAR correction)
- `updateScore("Spain", "Brazil", -1, 3)` → throws error, negative scores not allowed
- `updateScore("Spain", "Brazil", 1.5, 3)` → throws error, scores must be integers
- `updateScore("Spain", "Brazil", NaN, 3)` → throws error, scores must be valid integers

> **Why?** The requirements specify absolute scores, so each update replaces the previous score entirely. We allow scores to decrease because in real football, VAR can disallow a goal, effectively lowering the score. Restricting to only-increasing scores would make the library unable to handle legitimate corrections. However, negative numbers and decimals are never valid in football, so those are rejected.

> The library assumes consumers respect TypeScript's type signatures. It validates within the number domain (rejects negatives, decimals, NaN) but does not guard against non-number inputs like strings or booleans at runtime. It also assumes scores will fit within JavaScript's safe integer range (`Number.MAX_SAFE_INTEGER`), which is sufficient for any realistic football score.

### 5. Ordering tiebreaker uses insertion order

- Match A started first (total score 4), Match B started second (total score 4) → B appears before A in summary
- Uses internal sequence number, not timestamp, for deterministic behavior

> **Why?** The requirements say matches with the same total score should be ordered by most recently started first. Using a timestamp (`Date.now()`) would be fragile — two matches started in the same millisecond would have undefined order, and tests would need to mock time. An incrementing sequence number is deterministic, trivial to test, and unambiguously defines insertion order.

## Implementation choices

### Data structures

- **`Map<string, MatchEntry>`** for storing matches — provides O(1) lookup for `updateScore` and `finishMatch` by composite key, instead of O(n) array scan. Each entry bundles the `Match` instance with its sequence number, so match data and ordering metadata stay in sync.
- **`Set<string>`** for tracking active teams — provides O(1) uniqueness checks in `startMatch`, instead of scanning all matches to see if a team is already playing.
- **Sort on read** in `getSummary` — O(n log n) per call. We could maintain a sorted structure, but mutations (start/update/finish) are more frequent than reads, and with at most ~16 concurrent World Cup matches, the cost is negligible. Sorting on read keeps the code simpler.

### Composite key strategy

Matches are stored in a `Map` keyed by `JSON.stringify([homeTeam, awayTeam])`. JSON array serialization is collision-free because it escapes any special characters (including quotes and brackets) within each element, so no two distinct team pairings can produce the same key.
