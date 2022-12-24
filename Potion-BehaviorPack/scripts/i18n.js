import { MinecraftEffectTypes } from '@minecraft/server';
const PotionLoreRegExp = /^§r§[c7](.+?)( I| II| III| IV| V| VI| VII| VIII| IX| X| [0-9]*?)?( \(([0-9]+?:[0-9][0-9])\))?§r$/;
const PotionPrefix = [
  'Mundane',
  'Uninteresting',
  'Bland',
  'Clear',
  'Milky',
  'Diffuse',
  'Artless',
  'Thin',
  'Awkward',
  'Flat',
  'Bulky',
  'Bungling',
  'Buttered',
  'Smooth',
  'Suave',
  'Debonair',
  'Thick',
  'Elegant',
  'Fancy',
  'Charming',
  'Dashing',
  'Refined',
  'Cordial',
  'Sparkling',
  'Potent',
  'Foul',
  'Odorless',
  'Rank',
  'Harsh',
  'Acrid',
  'Gross',
  'Stinky'
];
const PotionSuffix = new Map();
PotionSuffix.set('brewing:lingering_glass_bottle', 'Lingering Potion');
PotionSuffix.set('brewing:splash_glass_bottle', 'Splash Potion');
PotionSuffix.set('minecraft:glass_bottle', 'Potion');
const EffectName = new Map();
EffectName.set(MinecraftEffectTypes.speed.getName(), 'Speed');
EffectName.set(MinecraftEffectTypes.slowness.getName(), 'Slowness');
EffectName.set(MinecraftEffectTypes.haste.getName(), 'Haste');
EffectName.set(MinecraftEffectTypes.miningFatigue.getName(), 'Mining Fatigue');
EffectName.set(MinecraftEffectTypes.strength.getName(), 'Strength');
EffectName.set(MinecraftEffectTypes.instantHealth.getName(), 'Instant Health');
EffectName.set(MinecraftEffectTypes.instantDamage.getName(), 'Instant Damage');
EffectName.set(MinecraftEffectTypes.jumpBoost.getName(), 'Jump Boost');
EffectName.set(MinecraftEffectTypes.nausea.getName(), 'Nausea');
EffectName.set(MinecraftEffectTypes.regeneration.getName(), 'Regeneration');
EffectName.set(MinecraftEffectTypes.resistance.getName(), 'Resistance');
EffectName.set(MinecraftEffectTypes.fireResistance.getName(), 'Fire Resistance');
EffectName.set(MinecraftEffectTypes.waterBreathing.getName(), 'Water Breathing');
EffectName.set(MinecraftEffectTypes.invisibility.getName(), 'Invisibility');
EffectName.set(MinecraftEffectTypes.blindness.getName(), 'Blindness');
EffectName.set(MinecraftEffectTypes.nightVision.getName(), 'Night Vision');
EffectName.set(MinecraftEffectTypes.hunger.getName(), 'Hunger');
EffectName.set(MinecraftEffectTypes.weakness.getName(), 'Weakness');
EffectName.set(MinecraftEffectTypes.poison.getName(), 'Poison');
EffectName.getKey = function (traget) {
  for (let [key, value] of EffectName.entries()) if (value == traget) return key;
  return traget;
};

export { PotionLoreRegExp, PotionPrefix, PotionSuffix, EffectName };