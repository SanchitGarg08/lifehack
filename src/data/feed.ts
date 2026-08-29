import type { FeedEvent } from './types'

/**
 * COM1 Gremlins only — four people who know each other. A campus-wide firehose
 * is noise; this is the group chat. Only things worth saying out loud go in,
 * and each one is a sentence, not a log line.
 */
export const SEED_FEED: FeedEvent[] = [
  {
    id: 'f-07', timestamp: 1042, kind: 'steal', actorId: 'u-priya', deviceId: 'as6-avrack', scoreDelta: 0,
    text: 'Priya took the AS6 AV rack off someone who let it idle three nights running.',
  },
  {
    id: 'f-06', timestamp: 968, kind: 'powered-off', actorId: 'u-rachel', deviceId: 'e4-printer', scoreDelta: -11,
    text: 'Rachel switched off Marcus’s printer from another building. He lost 11 points for it.',
  },
  {
    id: 'f-05', timestamp: 874, kind: 'left-asleep', actorId: 'u-marcus', deviceId: 'e4-printer', scoreDelta: -14,
    text: 'Marcus left the E4 printer idling for nine hours. Again.',
  },
  {
    id: 'f-04', timestamp: 733, kind: 'claim', actorId: 'u-rachel', deviceId: 'yih-tv', scoreDelta: 0,
    text: 'Somebody finally adopted the YIH atrium display. Nineteen nights idle and nobody wanted it.',
  },
  {
    id: 'f-03', timestamp: 611, kind: 'streak', actorId: 'u-priya', deviceId: 'com2-projector', scoreDelta: 0.5,
    text: 'Priya passed you this morning. Six points.',
  },
  {
    id: 'f-02', timestamp: 448, kind: 'left-asleep', actorId: 'u-marcus', deviceId: 'e4-printer', scoreDelta: -9,
    text: 'Marcus is last. His printer has not seen 0W all week.',
  },
  {
    id: 'f-01', timestamp: 302, kind: 'powered-off', actorId: 'u-sanchit', deviceId: 'lt19-projector', scoreDelta: 0,
    text: 'You caught the LT19 projector at 05:02. Eleven nights clean.',
  },
]
