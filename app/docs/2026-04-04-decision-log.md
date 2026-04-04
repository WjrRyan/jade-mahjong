# 2026-04-04 Decision Log

## Problem Framing

Two issues were treated as separate symptoms with different root causes:

1. repetitive opening boards were a generation-quality problem
2. unusable hints were an interaction-design problem

That distinction mattered because a single "shuffle things more" fix would not have solved both issues.

## Key Thinking Points

### Board variety should improve without sacrificing solvability

The engine already guaranteed solvable layouts, so the change needed to preserve that contract.

Rejected direction:

- randomizing tile kinds freely at board creation

Reason:

- this would make the board look less repetitive, but it could reintroduce unsolvable states

Chosen direction:

- keep the solvable-plan architecture
- vary and score the plan selection before tile kinds are assigned

### Hint should create forward motion, not just visual state

The previous hint flow technically found a playable pair, but the user still had to decide how to act on it and could end up with no meaningful feedback depending on settings.

Rejected direction:

- only add stronger highlight styling

Reason:

- styling alone would still fail when hint highlighting is disabled

Chosen direction:

- make hint produce an interaction state by auto-selecting one tile and surfacing its partner

### Search quality had to stay cheap enough for all 20 levels

The first version of the improved removal-plan scoring made playthrough tests too slow because it evaluated too much of the search tree.

Chosen refinement:

- score and compare only the earliest steps where the player notices repetition most
- use a fast first-valid-plan strategy deeper in the tree

This preserved the user-facing benefit without making the solver too expensive.

## Behavior Guarantees Preserved

- every level still starts from a solvable state
- stall recovery still works
- hint usage is still tracked
- the player can still complete a hinted move with a single follow-up tap

## Follow-up Opportunities

- add a seeded board generator so level openings can be replayed and compared deterministically
- surface a short hint animation or pulse so the prepared next move reads even faster
- track whether opening-pair spacing should vary by difficulty tier

