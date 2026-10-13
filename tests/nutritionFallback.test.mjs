import test from 'node:test';
import assert from 'node:assert/strict';
import { buildFallbackMealPlanDraft } from '../nutritionFallback.mjs';

const base = {
  dietPattern: 'Vegetarian', allergies: '', avoidFoods: '', cuisine: 'Indian home-style',
  budget: 'Moderate', prepTimeMinutes: 20, mealsPerDay: 4, planAim: 'Balanced everyday eating',
};
const slotsFor = prefs => prefs.mealsPerDay === 3 ? ['Breakfast', 'Lunch', 'Dinner'] : ['Breakfast', 'Lunch', 'Snack', 'Dinner'];
const chosenBySlot = (plan, slot) => plan.days.flatMap(day => day.meals.filter(meal => meal.slot === slot).map(meal => meal.chosen.name));

test('fallback builds seven days, expected slots, and two alternatives per meal', () => {
  const plan = buildFallbackMealPlanDraft(base, '2026-10-12', {});
  assert.equal(plan.days.length, 7);
  for (const day of plan.days) {
    assert.deepEqual(day.meals.map(meal => meal.slot), slotsFor(base));
    for (const meal of day.meals) {
      assert.equal(meal.alternatives.length, 2);
      assert.ok(meal.chosen.name);
      assert.notEqual(meal.chosen.name, meal.alternatives[0].name);
      assert.notEqual(meal.alternatives[0].name, meal.alternatives[1].name);
    }
  }
});

test('fallback varies chosen meals by slot and avoids exact names from the previous saved week', () => {
  const first = buildFallbackMealPlanDraft(base, '2026-10-12', {});
  const recent = Object.fromEntries(slotsFor(base).map(slot => [slot, chosenBySlot(first, slot)]));
  const second = buildFallbackMealPlanDraft(base, '2026-10-19', recent);
  for (const slot of slotsFor(base)) {
    const meals = chosenBySlot(second, slot);
    assert.equal(new Set(meals).size, 7, `${slot} must have seven distinct chosen meals`);
    assert.ok(meals.every(name => !recent[slot].includes(name)), `${slot} should avoid exact prior-week names`);
  }
});

test('vegan fallback respects declared milk allergy and a short preparation limit', () => {
  const prefs = { ...base, dietPattern: 'Vegan', allergies: 'milk', prepTimeMinutes: 10, mealsPerDay: 3 };
  const plan = buildFallbackMealPlanDraft(prefs, '2026-10-12', {});
  for (const day of plan.days) for (const meal of day.meals) {
    for (const choice of [meal.chosen, ...meal.alternatives]) {
      assert.ok(choice.prepMinutes <= 20, `${choice.name} is above the fallback prep ceiling`);
      assert.doesNotMatch(`${choice.name} ${choice.description} ${choice.portionCue}`, /\b(milk|dairy|curd|yoghurt|yogurt|paneer|cheese|ghee|butter|cream|whey|egg|eggs|chicken|fish|meat)\b/i);
    }
  }
});

test('fallback respects vegetarian and peanut allergy restrictions', () => {
  const prefs = { ...base, allergies: 'peanuts', prepTimeMinutes: 20 };
  const plan = buildFallbackMealPlanDraft(prefs, '2026-10-12', {});
  for (const day of plan.days) for (const meal of day.meals) {
    for (const choice of [meal.chosen, ...meal.alternatives]) {
      assert.doesNotMatch(`${choice.name} ${choice.description} ${choice.portionCue}`, /\b(chicken|beef|pork|lamb|mutton|fish|salmon|tuna|prawn|shrimp|seafood|meat|bacon|ham|gelatin|egg|eggs|peanut|peanuts|groundnut|groundnuts)\b/i);
    }
  }
});

test('strong exclusions fail clearly rather than creating a possibly unsafe plan', () => {
  const prefs = { ...base, allergies: 'milk, egg, gluten, soy, sesame, fish, shellfish, nuts, chickpeas, lentils, rice, tomato, wheat, beans, fruit, oats, corn, potato, vegetables' };
  assert.throws(() => buildFallbackMealPlanDraft(prefs, '2026-10-12', {}), /restrictions leave fewer than seven/i);
});
