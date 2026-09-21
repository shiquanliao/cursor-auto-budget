import test from 'node:test';
import assert from 'node:assert/strict';
import { QUOTA_PER_USD, calculateOperatorBudget, calculateUsage } from '../app.js';

test('calculates a seven-day free trial using the expected check-in reward', () => {
  const result = calculateUsage({
    signupCredit: 2,
    checkinMin: 0.05,
    checkinMax: 0.15,
    checkinDays: 7,
    costs: { light: 0.31, regular: 1.72, deep: 2.69 },
  });

  assert.equal(QUOTA_PER_USD, 500_000);
  assert.ok(Math.abs(result.totalCredit - 2.7) < 1e-9);
  assert.equal(result.totalQuota, 1_350_000);
  assert.deepEqual(result.turns, { light: 8, regular: 1, deep: 1 });
});

test('calculates the operator budget by activated users only', () => {
  const result = calculateOperatorBudget({
    users: 100,
    activationRate: 35,
    registrationReward: 0.5,
    activationReward: 1.5,
    activeDays: 7,
    checkinMin: 0.05,
    checkinMax: 0.15,
  });

  assert.equal(result.registrationCost, 50);
  assert.equal(result.activationCost, 52.5);
  assert.ok(Math.abs(result.checkinCost - 24.5) < 1e-9);
  assert.ok(Math.abs(result.total - 127) < 1e-9);
});

test('normalizes invalid and inverted inputs safely', () => {
  const result = calculateUsage({
    signupCredit: -2,
    checkinMin: 0.2,
    checkinMax: 0.1,
    checkinDays: 2.9,
    costs: { light: 0 },
  });

  assert.equal(result.days, 2);
  assert.equal(result.averageCheckin, 0.2);
  assert.equal(result.totalCredit, 0.4);
  assert.equal(result.turns.light, 40);
});
