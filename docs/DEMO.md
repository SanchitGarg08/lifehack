# Wattch — the pitch

Full version, formatted for reading on a phone while you present:
<https://claude.ai/code/artifact/d063071f-1637-4183-9833-b61f04ca5562>

---

## The argument, in four moves

1. **The waste isn't consumption, it's abandonment.** A projector drops from
   210W to 9W when someone hits sleep instead of off, and holds there for
   fourteen hours in an empty room.
2. **Nobody has fixed it because the gap isn't information.** Estates can
   measure standby but can't act on it at 11pm. The only person who can is the
   last one out, and they have no reason to care.
3. **So give them one device that's theirs, and a score that drains.** Loss
   aversion, not education. Using a device costs nothing — we only ask people
   to finish the job.
4. **And make it unfakeable.** Points move only when the plug reads 0W. There
   is no button in the app that awards a point.

### The order-of-magnitude number

```
5,000 devices × 8W × 14h × 300 nights = 168,000 kWh/yr ≈ S$50,000/yr
```

Swap in the real device count before presenting. The method is what matters.

---

## Run of show — 9 beats, 2 minutes

Press `D` for the operator rail, then **Reset demo**. Clock `Tue 18:00`,
score `82`, rank `#34`, nothing amber.

| # | Time | Press | Beat |
|---|---|---|---|
| 1 | 0:00 | — | Open on the cost, not the app |
| 2 | 0:15 | — | The premise, in one screen |
| 3 | 0:30 | `Projector → idle` | The signal: a step down, not a spike |
| 4 | 0:50 | `I'm on it` (in app) | The commitment |
| 5 | 1:00 | `Projector → off` | **The payoff — confirmed at 0W** |
| 6 | 1:15 | `Printer → idle` → `Advance to morning` | The shape of the problem |
| 7 | 1:35 | `Rival adopts` | The stakes: you lose to Priya |
| 8 | 1:45 | Tap **Feed** | Why it spreads |
| 9 | 1:55 | — | Close |

Full wording for every beat is in the artifact.

---

## Scoring

```
DRAIN       hours idle × standbyWatts ÷ 9      (1 point per 9 Wh)
CLIFF       still idling at 08:00  →  −8, and it goes at-risk
QUICK SAVE  0W inside the 90-min window  →  drain refunded, +0.5
IN USE      always zero
```

Printer, 6W, 14h: `−9` drain `−8` at-risk = **88 → 71**.
Recovery is +0.5/night — 34 clean nights to undo one bad one. That asymmetry
is the behavioural engine.

---

## Recovery

**Shift+R** resets from any screen in under a second, rail still open. Every
button is idempotent — pressing them twice or out of order never breaks
anything.
