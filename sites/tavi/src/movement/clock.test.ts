import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { bankings, escEase, motionRatio, stateAt } from "./clock.ts";
import { DEG } from "./geometry.ts";

const near = (actual: number, expected: number, what: string) => {
  assert.ok(Math.abs(actual - expected) < 1e-9, `${what}: ${actual} is not ${expected}`);
};
const degrees = (radians: number) => radians / DEG;

describe("the clock", () => {
  test("the escape wheel is at 72 degrees at 1 s and 360 at 5 s", () => {
    near(degrees(stateAt(1).train.escape), 72, "escape at 1 s");
    near(degrees(stateAt(5).train.escape), 360, "escape at 5 s");
  });

  test("the fourth wheel turns once in 60 s and the centre wheel once in 3,600 s, both the other way", () => {
    near(degrees(stateAt(60).train.fourth), -360, "fourth at 60 s");
    near(degrees(stateAt(3600).train.centre), -360, "centre at 3,600 s");
    near(degrees(stateAt(3600).train.third), 360 * 8, "third at 3,600 s");
    near(degrees(stateAt(6 * 3600).train.barrel), 360, "barrel at six hours");
  });

  test("21,600 beats at 3,600 s, six a second", () => {
    assert.equal(stateAt(3600).beats, 21_600);
    assert.equal(stateAt(1).beats, 6);
    assert.equal(stateAt(0.99).beats, 5);
  });

  test("the escape wheel recoils, takes its impulse, drops and locks inside a beat", () => {
    const at = (beatFraction: number) => stateAt((3 + beatFraction) / 6).steps - 3;
    assert.equal(at(0), 0);
    assert.equal(at(0.3), 0, "locked while the balance is away from rest");
    assert.ok(at(0.47) < 0, "a hair of recoil as the stone unlocks");
    assert.ok(at(0.5) > 0 && at(0.5) < 1, "the impulse, as the balance passes rest");
    assert.equal(at(0.7), 1, "dropped and locked half a tooth on");
    assert.equal(escEase(0), 0);
    assert.equal(escEase(1), 1);
  });

  test("the fork never passes its bankings", () => {
    const [low, high] = bankings();
    assert.ok(high > low);
    for (let i = 0; i <= 20_000; i++) {
      const { fork } = stateAt(i / 10_000);
      assert.ok(fork >= low - 1e-12 && fork <= high + 1e-12, `fork at ${degrees(fork)} degrees, t = ${i / 10_000}`);
    }
    // It rests on each banking in turn while the balance swings out.
    near(stateAt(0).fork, stateAt(0.01).fork, "resting through the swing out");
  });

  test("the same t gives the same state, whatever was asked before", () => {
    const first = stateAt(12.345);
    stateAt(0.5);
    stateAt(9999);
    assert.deepEqual(stateAt(12.345), first);
  });

  test("the amplitude is a parameter: the balance swings to it, and the wheels keep time", () => {
    const low = 120;
    const swing = Math.max(
      ...Array.from({ length: 400 }, (_, i) => Math.abs(stateAt(i / 400, { amplitude: low }).balance)),
    );
    near(degrees(swing), low, "the widest swing");
    near(degrees(stateAt(1, { amplitude: low }).train.escape), 72, "escape at 1 s");
    near(degrees(Math.abs(stateAt(0).balance)), 200, "the drawn amplitude by default");
  });

  test("the hands start at 10:10:30: the seconds at 180 degrees, the minutes at 63, the hours at 305.25", () => {
    const { hands } = stateAt(0);
    near(degrees(hands.seconds), 180, "seconds");
    near(degrees(hands.minute), 63, "minute");
    near(degrees(hands.hour), 305.25, "hour");
    near(degrees(stateAt(0, { time: 0 }).hands.minute), 0, "minute at twelve");
  });

  test("the motion works make twelve to one: the hour hand turns once while the minute hand turns twelve times", () => {
    near(1 / motionRatio(), 12, "the ratio");
    const turned = (t: number) => {
      const start = stateAt(0).hands;
      const now = stateAt(t).hands;
      return { hour: degrees(now.hour - start.hour), minute: degrees(now.minute - start.minute) };
    };
    near(turned(3600).hour, 30, "the hour hand in an hour");
    near(turned(12 * 3600).hour, 360, "the hour hand in twelve hours");
    near(turned(12 * 3600).minute, 360 * 12, "the minute hand in twelve hours");
  });

  test("the minute hand turns once in 3,600 s and the seconds hand once in 60 s, both clockwise on the dial", () => {
    const start = stateAt(0).hands;
    near(degrees(stateAt(3600).hands.minute - start.minute), 360, "minute");
    near(degrees(stateAt(60).hands.seconds - start.seconds), 360, "seconds");
    assert.ok(stateAt(1).hands.seconds > start.seconds, "the seconds hand goes clockwise");
    assert.ok(stateAt(10).hands.minute > start.minute, "the minute hand goes clockwise");
    // The hands are the back's wheels seen in a mirror: they turn the other way to the centre and fourth wheels.
    near(stateAt(60).hands.seconds - start.seconds, -stateAt(60).train.fourth, "the fourth wheel's turn");
  });

  test("the seconds hand jumps a whole degree each beat and stands still between", () => {
    const seconds = (t: number) => degrees(stateAt(t).hands.seconds) - 180;
    for (let beat = 0; beat <= 360; beat++) {
      near(seconds(beat / 6), beat, `at beat ${beat}`);
      near(seconds((beat + 0.3) / 6), beat, `locked after beat ${beat}`);
    }
    // It moves inside a beat, as the escape wheel takes its impulse.
    const mid = seconds(3.5 / 6);
    assert.ok(mid > 3 && mid < 4, `mid-beat at ${mid}`);
  });
});
