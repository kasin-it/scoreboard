# Live Football World Cup Scoreboard

A simple library for tracking live football World Cup matches and their scores.

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

> **Why?** The requirements specify absolute scores, so each update replaces the previous score entirely. We allow scores to decrease because in real football, VAR can disallow a goal, effectively lowering the score. Restricting to only-increasing scores would make the library unable to handle legitimate corrections. However, negative numbers and decimals are never valid in football, so those are rejected.

### 5. Ordering tiebreaker uses insertion order

- Match A started first (total score 4), Match B started second (total score 4) → B appears before A in summary
- Uses internal sequence number, not timestamp, for deterministic behavior

> **Why?** The requirements say matches with the same total score should be ordered by most recently started first. Using a timestamp (`Date.now()`) would be fragile — two matches started in the same millisecond would have undefined order, and tests would need to mock time. An incrementing sequence number is deterministic, trivial to test, and unambiguously defines insertion order.
