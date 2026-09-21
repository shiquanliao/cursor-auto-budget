export const QUOTA_PER_USD = 500_000;

const safeNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : fallback;
};

export function calculateUsage({ signupCredit, checkinMin, checkinMax, checkinDays, costs }) {
  const initial = safeNumber(signupCredit);
  const min = safeNumber(checkinMin);
  const max = Math.max(min, safeNumber(checkinMax));
  const days = Math.max(0, Math.floor(safeNumber(checkinDays)));
  const averageCheckin = (min + max) / 2;
  const totalCredit = initial + averageCheckin * days;

  const turns = Object.fromEntries(
    Object.entries(costs).map(([key, value]) => {
      const cost = Math.max(0.01, safeNumber(value, 0.01));
      return [key, Math.floor(totalCredit / cost)];
    }),
  );

  return {
    initial,
    days,
    averageCheckin,
    totalCredit,
    totalQuota: Math.round(totalCredit * QUOTA_PER_USD),
    turns,
  };
}

export function calculateOperatorBudget({
  users,
  activationRate,
  registrationReward,
  activationReward,
  activeDays,
  checkinMin,
  checkinMax,
}) {
  const registrations = Math.max(0, Math.floor(safeNumber(users)));
  const rate = Math.min(1, safeNumber(activationRate) / 100);
  const activatedUsers = registrations * rate;
  const averageCheckin = (safeNumber(checkinMin) + safeNumber(checkinMax)) / 2;
  const registrationCost = registrations * safeNumber(registrationReward);
  const activationCost = activatedUsers * safeNumber(activationReward);
  const checkinCost = activatedUsers * Math.floor(safeNumber(activeDays)) * averageCheckin;

  return {
    registrationCost,
    activationCost,
    checkinCost,
    total: registrationCost + activationCost + checkinCost,
  };
}

const money = (value) => `$${value.toFixed(2)}`;
const byId = (id) => document.getElementById(id);

function render() {
  const usage = calculateUsage({
    signupCredit: byId('signup-credit').value,
    checkinMin: byId('checkin-min').value,
    checkinMax: byId('checkin-max').value,
    checkinDays: byId('checkin-days').value,
    costs: {
      light: byId('cost-light').value,
      regular: byId('cost-regular').value,
      deep: byId('cost-deep').value,
    },
  });

  byId('total-credit').textContent = money(usage.totalCredit);
  byId('total-quota').textContent = `约 ${usage.totalQuota.toLocaleString('zh-CN')} 原始额度`;
  byId('turns-light').textContent = `约 ${usage.turns.light} 次`;
  byId('turns-regular').textContent = `约 ${usage.turns.regular} 次`;
  byId('turns-deep').textContent = `约 ${usage.turns.deep} 次`;
  byId('formula-text').textContent = `${money(usage.initial)} + ${usage.days} 天 × 平均 ${money(usage.averageCheckin)} = ${money(usage.totalCredit)}`;

  const budget = calculateOperatorBudget({
    users: byId('users').value,
    activationRate: byId('activation-rate').value,
    registrationReward: byId('registration-reward').value,
    activationReward: byId('activation-reward').value,
    activeDays: byId('operator-days').value,
    checkinMin: byId('checkin-min').value,
    checkinMax: byId('checkin-max').value,
  });

  byId('operator-budget').textContent = money(budget.total);
  byId('registration-cost').textContent = money(budget.registrationCost);
  byId('activation-cost').textContent = money(budget.activationCost);
  byId('checkin-cost').textContent = money(budget.checkinCost);
}

if (typeof document !== 'undefined') {
  document.querySelectorAll('input').forEach((input) => input.addEventListener('input', render));
  render();
}
