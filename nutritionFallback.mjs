/**
 * Local, preference-aware meal-plan fallback used when the configured AI provider
 * is unavailable or times out. These are general meal ideas, not a clinical diet.
 */
const FOOD = {
  Breakfast: [
    ['Vegetable poha with peas','Flattened rice cooked with peas, carrot and lemon.','indian',15],
    ['Idli with sambar','Steamed rice-and-lentil cakes served with vegetable sambar.','indian',15],
    ['Moong dal chilla','Thin savoury lentil pancakes with coriander chutney.','indian',20],
    ['Besan chilla with tomato chutney','Chickpea-flour pancakes with tomato and herbs.','indian',20],
    ['Vegetable dosa with sambar','Crisp dosa with a bowl of lentil-and-vegetable sambar.','indian',20],
    ['Ragi porridge with banana','Warm finger-millet porridge with sliced banana.','indian',10],
    ['Vegetable upma','Semolina with mixed vegetables and mild spices.','indian',20],
    ['Savoury oats with vegetables','Oats simmered with vegetables and gentle seasoning.','indian',15],
    ['Chickpea sundal and fruit','Seasoned chickpeas with a piece of seasonal fruit.','indian',15],
    ['Sprouted moong bowl','Sprouted mung beans with tomato, cucumber and lemon.','indian',10],
    ['Vegetable paratha with curd','Stuffed vegetable flatbread with a bowl of curd.','indian',25],
    ['Paneer bhurji with roti','Soft paneer with tomato and spices served with roti.','indian',20],
    ['Lemon rice breakfast bowl','Rice with lemon, curry leaves and a side of vegetables.','indian',15],
    ['Sweet potato and chickpea bowl','Cooked sweet potato with chickpeas and herbs.','indian',15],
    ['Banana oats bowl','Oats with banana and a milk or suitable plant drink of choice.','everyday',10],
    ['Wholegrain toast with avocado and tomato','Toast topped with avocado, tomato and herbs.','mixed',10],
    ['Tofu scramble with toast','Crumble tofu with vegetables and serve with toast.','mixed',15],
    ['Egg bhurji with roti','Cooked egg with tomato and spices, served with roti.','indian',15],
    ['Masala omelette with toast','A lightly seasoned omelette with toast and tomato.','mixed',15],
    ['Black bean breakfast wrap','Black beans and vegetables wrapped in a soft tortilla.','mixed',15],
    ['Vegetable rice cakes with sambar','Steamed rice cakes with lentil-and-vegetable sambar.','indian',15],
    ['Fruit and plain yoghurt bowl','Seasonal fruit with plain yoghurt and oats.','everyday',5],
  ],
  Lunch: [
    ['Dal, rice and seasonal sabzi','Lentils, rice and a cooked seasonal vegetable.','indian',25],
    ['Rajma rice bowl','Kidney-bean curry served with rice and cucumber.','indian',25],
    ['Chole with roti','Chickpea curry with roti and a simple vegetable side.','indian',25],
    ['Vegetable khichdi','Rice and lentils cooked together with vegetables.','indian',25],
    ['Sambar rice','Rice with lentil-and-vegetable sambar.','indian',20],
    ['Chickpea salad wrap','Chickpeas, cucumber and tomato in a soft wrap.','mixed',15],
    ['Tofu and vegetable rice bowl','Tofu and vegetables served over rice.','mixed',20],
    ['Mixed dal with millet roti','Mixed lentils with millet flatbread and vegetables.','indian',30],
    ['Vegetable pulao with cucumber salad','Rice cooked with vegetables and mild spices.','indian',25],
    ['Paneer bhurji with roti','Paneer cooked with tomato and spices with roti.','indian',20],
    ['Lemon rice with peas','Lemon-seasoned rice with peas and a vegetable side.','indian',15],
    ['Lentil pasta with tomato vegetables','Pasta with lentils, tomato sauce and vegetables.','mixed',25],
    ['Chicken curry with rice','Chicken cooked in a mild curry with rice and vegetables.','indian',30],
    ['Egg curry with rice','Egg curry with rice and a vegetable side.','indian',25],
    ['Fish curry with rice','Fish curry served with rice and cooked vegetables.','indian',30],
    ['Chickpea curry with rice','Chickpeas in tomato gravy with rice.','indian',25],
    ['Black bean burrito bowl','Black beans, rice, tomato, corn and leafy vegetables.','mixed',20],
    ['Falafel-style chickpea bowl','Pan-cooked chickpea patties with grains and vegetables.','mixed',30],
    ['Chicken and vegetable wrap','Cooked chicken and vegetables in a wrap.','mixed',20],
    ['Egg and vegetable rice bowl','Cooked egg with rice and mixed vegetables.','mixed',15],
    ['Vegetable dalia bowl','Cracked wheat cooked with lentils and vegetables.','indian',25],
    ['Stuffed vegetable roti plate','Vegetable-stuffed flatbread with a simple salad.','indian',25],
    ['Quick sambar rice with prepared sambar','Rice warmed with ready sambar and vegetables.','indian',10],
    ['Roti with ready dal and cucumber','Roti with prepared lentils and sliced cucumber.','indian',10],
    ['Quick chickpea salad roti wrap','Chickpeas, cucumber and tomato wrapped in roti.','indian',10],
    ['Ready-cooked rajma with rice','Prepared kidney beans served with rice and tomato.','indian',10],
    ['Moong sprouts and rice bowl','Sprouts with rice, cucumber and lemon.','indian',10],
    ['Chana chaat with roti','Chickpeas with tomato, lemon and a roti.','indian',10],
    ['Leftover khichdi with cucumber','A prepared rice-and-lentil bowl with fresh cucumber.','indian',5],
    ['Quick tomato dal with rice','Prepared lentils warmed with tomato and served with rice.','indian',15],
  ],
  Snack: [
    ['Seasonal fruit plate','A mix of seasonal fruit pieces.','everyday',5],
    ['Roasted chana','Roasted chickpeas with mild seasoning.','indian',5],
    ['Roasted makhana','Fox nuts roasted with mild spices.','indian',10],
    ['Boiled corn chaat','Corn with tomato, lemon and herbs.','indian',10],
    ['Steamed dhokla','Steamed chickpea-flour snack with herbs.','indian',15],
    ['Fruit with plain curd','Seasonal fruit served with plain curd.','indian',5],
    ['Banana yoghurt smoothie','Banana blended with plain yoghurt and water or milk as preferred.','everyday',5],
    ['Cucumber sticks with hummus','Cucumber and carrot sticks with chickpea hummus.','mixed',10],
    ['Sprouted moong chaat','Sprouted mung beans with tomato and lemon.','indian',10],
    ['Sweet potato chaat','Cooked sweet potato with lemon and herbs.','indian',15],
    ['Boiled egg with fruit','A boiled egg with seasonal fruit.','everyday',10],
    ['Banana milk shake','Banana blended with milk.','everyday',5],
    ['Edamame bowl','Steamed soybeans with a little salt and lemon.','mixed',10],
    ['Chickpea chaat','Chickpeas with cucumber, tomato and lemon.','indian',10],
    ['Vegetable sandwich','Wholegrain bread with cucumber, tomato and a simple spread.','everyday',10],
    ['Coconut water and fruit','Coconut water with a piece of seasonal fruit.','everyday',5],
    ['Baked lentil patties','Prepared lentil patties with a tomato dip.','indian',20],
    ['Plain yoghurt with oats','Plain yoghurt topped with oats and fruit.','everyday',5],
    ['Steamed corn and peas','Warm corn and peas with herbs.','indian',10],
    ['Quick vegetable poha cup','A small serving of vegetable poha.','indian',10],
    ['Tofu cubes with cucumber','Tofu pieces with cucumber and a simple herb dressing.','mixed',5],
    ['Roasted sweet potato wedges','Cooked sweet potato wedges with mild spices.','everyday',20],
  ],
  Dinner: [
    ['Roti, dal and sabzi','Roti with lentils and a cooked seasonal vegetable.','indian',25],
    ['Vegetable khichdi','Rice and lentils cooked together with vegetables.','indian',25],
    ['Dosa with sambar','Dosa with lentil-and-vegetable sambar.','indian',20],
    ['Lentil and vegetable soup with toast','Lentil soup with vegetables and toast.','mixed',25],
    ['Chickpea curry with roti','Chickpea curry served with roti and cucumber.','indian',25],
    ['Tofu vegetable stir-fry with rice','Tofu and mixed vegetables served with rice.','mixed',20],
    ['Paneer and tomato wrap','Paneer with tomato and vegetables in a wrap.','mixed',20],
    ['Millet and lentil bowl','Millet with lentils and cooked vegetables.','indian',25],
    ['Vegetable pulao','Rice cooked with mixed vegetables and herbs.','indian',25],
    ['Egg curry with rice','Egg curry served with rice and vegetables.','indian',25],
    ['Chicken and vegetable rice bowl','Cooked chicken with rice and mixed vegetables.','mixed',25],
    ['Fish with rice and vegetables','Cooked fish with rice and a seasonal vegetable.','everyday',25],
    ['Bean tacos','Beans with tomato and vegetables in soft tortillas.','mixed',20],
    ['Lentil pasta with vegetables','Pasta with lentils, tomato and vegetables.','mixed',25],
    ['Mixed dal and millet roti','Mixed lentils served with millet flatbread.','indian',30],
    ['Chana rice bowl','Chickpeas with rice, cucumber and herbs.','indian',20],
    ['Vegetable and bean stew','Beans and vegetables simmered in tomato broth.','mixed',25],
    ['Vegetable sambar with rice','Lentil-and-vegetable sambar with rice.','indian',20],
    ['Chicken and vegetable roti plate','Cooked chicken and vegetables with roti.','indian',30],
    ['Egg bhurji with roti and vegetables','Egg cooked with tomato served with roti and vegetables.','indian',20],
    ['Stuffed capsicum with rice','Bell peppers filled with rice, vegetables and lentils.','indian',30],
    ['Vegetable couscous with chickpeas','Couscous with chickpeas, vegetables and herbs.','mixed',20],
    ['Leftover dal with rice and cucumber','Prepared dal and rice with sliced cucumber.','indian',10],
    ['Quick moong chilla with tomato salad','Lentil pancakes served with tomato and herbs.','indian',15],
    ['Vegetable poha with sprouts','Poha cooked with vegetables and a side of sprouts.','indian',15],
    ['Ready-cooked chana with roti','Prepared chickpeas with roti and cucumber.','indian',10],
    ['Lemon rice with cucumber salad','Rice seasoned with lemon and served with cucumber.','indian',10],
    ['Quick sambar with idli','Prepared sambar served with steamed idli.','indian',15],
    ['Chickpea sundal rice bowl','Seasoned chickpeas with rice and herbs.','indian',15],
    ['Steamed idli with chutney','Steamed rice-and-lentil cakes with coconut chutney.','indian',10],
    ['Vegetable upma and sprouts','Vegetable semolina with a side of mung sprouts.','indian',15],
  ],
};

const DIET_DENY = {
  Vegetarian: /\b(chicken|beef|pork|lamb|mutton|turkey|duck|fish|salmon|tuna|prawn|shrimp|seafood|meat|bacon|ham|gelatin|egg|eggs)\b/i,
  Eggetarian: /\b(chicken|beef|pork|lamb|mutton|turkey|duck|fish|salmon|tuna|prawn|shrimp|seafood|meat|bacon|ham|gelatin)\b/i,
  Vegan: /\b(chicken|beef|pork|lamb|mutton|turkey|duck|fish|salmon|tuna|prawn|shrimp|seafood|meat|bacon|ham|gelatin|egg|eggs|milk|curd|yogurt|yoghurt|paneer|cheese|ghee|butter|cream|whey|honey)\b/i,
};
const ALLERGEN_GROUPS = [
  [/(peanut|groundnut|moongphali)/i, ['peanut','peanuts','groundnut','groundnuts','moongphali']],
  [/(tree nut|nuts?|almond|cashew|pistachio|walnut|hazelnut|pecan|pine nut)/i, ['peanut','peanuts','groundnut','groundnuts','almond','almonds','cashew','cashews','pistachio','pistachios','walnut','walnuts','hazelnut','hazelnuts','pecan','pecans','pine nut','pine nuts']],
  [/(milk|dairy|lactose|casein|whey)/i, ['milk','dairy','curd','yogurt','yoghurt','paneer','cheese','ghee','butter','cream','whey','buttermilk','milk powder','casein','lactose']],
  [/(egg|eggs)/i, ['egg','eggs','mayonnaise']],
  [/(wheat|gluten|maida|semolina|suji|seitan)/i, ['wheat','gluten','maida','semolina','suji','seitan','bread','pasta','noodles','toast','roti','tortilla','couscous']],
  [/(soy|soya|soybean)/i, ['soy','soya','soybean','tofu','soy milk','soy sauce','edamame']],
  [/(sesame|til|tahini)/i, ['sesame','til','tahini']],
  [/(fish|salmon|tuna|cod|sardine|anchovy)/i, ['fish','salmon','tuna','cod','sardine','anchovy','fish sauce']],
  [/(shellfish|prawn|shrimp|crab|lobster|mussel|oyster)/i, ['shellfish','prawn','prawns','shrimp','crab','lobster','mussel','oyster']],
];
function tokens(text) {
  const raw = String(text || '').split(/[;,\n]/).map(x => x.trim().toLowerCase()).filter(x => x.length > 1 && x !== 'none' && x !== 'no known allergies');
  const all = [...raw];
  const combined = raw.join(', ');
  for (const [matcher, expanded] of ALLERGEN_GROUPS) if (matcher.test(combined)) all.push(...expanded);
  return [...new Set(all)];
}
function hasToken(choice, list) {
  const text = `${choice.name} ${choice.description} ${choice.portionCue}`.toLowerCase();
  return list.some(value => {
    const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`(^|[^a-z])${escaped}([^a-z]|$)`, 'i').test(text);
  });
}
function stableHash(text) {
  let h = 2166136261;
  for (const ch of String(text)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function normalizeName(name) { return String(name || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(); }
function convertRow(row) {
  const [name, description, cuisine, prepMinutes] = row;
  return { name, description, cuisine, prepMinutes, portionCue: 'Choose a comfortable, satisfying portion that fits your appetite.' };
}

export function buildFallbackMealPlanDraft(preferences, startDate, avoidRecentMeals = {}) {
  const slots = preferences.mealsPerDay === 3 ? ['Breakfast', 'Lunch', 'Dinner'] : ['Breakfast', 'Lunch', 'Snack', 'Dinner'];
  const allergyTokens = tokens(preferences.allergies);
  const exclusionTokens = tokens(preferences.avoidFoods);
  const denyDiet = DIET_DENY[preferences.dietPattern];
  const themes = ['A steady start', 'Comfort and variety', 'Quick and colourful', 'A little something different', 'Familiar favourites', 'Mix and match', 'Flexible finish'];
  const days = Array.from({ length: 7 }, (_, dayIndex) => ({
    theme: themes[dayIndex],
    meals: slots.map(slot => {
      let pool = FOOD[slot].map(convertRow).filter(choice => {
        const fullText = `${choice.name} ${choice.description} ${choice.portionCue}`;
        if (choice.prepMinutes > Number(preferences.prepTimeMinutes) + 10) return false;
        if (preferences.cuisine === 'Indian home-style' && !['indian','everyday'].includes(choice.cuisine)) return false;
        if (preferences.cuisine === 'Mostly quick meals' && choice.prepMinutes > Math.min(Number(preferences.prepTimeMinutes) + 5, 25)) return false;
        if (hasToken(choice, allergyTokens) || hasToken(choice, exclusionTokens)) return false;
        if (denyDiet && denyDiet.test(fullText)) return false;
        return true;
      });
      const recent = new Set((Array.isArray(avoidRecentMeals?.[slot]) ? avoidRecentMeals[slot] : []).map(normalizeName));
      pool = pool.filter(choice => !recent.has(normalizeName(choice.name)));
      if (pool.length < 7) {
        throw Object.assign(new Error(`Your restrictions leave fewer than seven locally available ${slot.toLowerCase()} ideas. Please broaden the meal choices or connect an AI provider before retrying. No plan was saved.`), { status: 422 });
      }
      const offset = stableHash(`${startDate}|${slot}|${preferences.dietPattern}|${preferences.cuisine}|${preferences.budget}|${preferences.planAim}`) % pool.length;
      const rotated = pool.map((_, index) => pool[(index + offset) % pool.length]);
      const chosen = rotated[dayIndex];
      const alternatives = rotated.filter(item => normalizeName(item.name) !== normalizeName(chosen.name)).slice(0, 2).map(({ name, description, prepMinutes, portionCue }) => ({ name, description, prepMinutes, portionCue }));
      const { cuisine: _cuisine, ...cleanChosen } = chosen;
      return { slot, chosen: cleanChosen, alternatives };
    }),
  }));
  return {
    title: 'Your flexible seven-day food plan',
    summary: 'This fallback menu was assembled locally from common meal ideas that match the preferences you entered. It supports everyday planning, not medical treatment or a restrictive diet. Review every ingredient and portion for your needs.',
    days,
  };
}
