import { ItemTypes, ItemStack, MinecraftEffectTypes, MolangVariableMap, Color } from '@minecraft/server';
import { Parse } from './effect';
import * as I18N from './i18n';

const AreaEffectCloudQuery = { maxDistance: 4 }
const WaterBottle = new ItemStack(ItemTypes.get('minecraft:potion'));
const SplashWaterBottle = new ItemStack(ItemTypes.get('minecraft:splash_potion'));
const LingeringWaterBottle = new ItemStack(ItemTypes.get('minecraft:lingering_potion'));
const Potion = ItemTypes.get('brewing:potion');
const SplashPotion = ItemTypes.get('brewing:splash_potion');
const LingeringPotion = ItemTypes.get('brewing:lingering_potion');
const ThrowablePotions = ['brewing:splash_potion', 'brewing:lingering_potion']
const ThrownPotion = new Map()
const ShooterRaycastOption = {maxDistance: 1}
const PotionColor = new Color(0, 0, 0, 1)
const PotionMolangVariableMap = new MolangVariableMap()
PotionMolangVariableMap.setColorRGBA('variable.color', PotionColor)
const Amplifier = [' I', ' II', ' III', ' IV', ' V', ' VI', ' VII', ' VIII', ' IX', ' X'];
const Effects = new Map();
for (let i in MinecraftEffectTypes) Effects.set(MinecraftEffectTypes[i].getName(), MinecraftEffectTypes[i]);
const RequirementsMap = new Map();
RequirementsMap.set(MinecraftEffectTypes.speed.getName(), "!10 & !4 & 5*2+0 & >1 | !7 & !4 & 5*2+0 & >1");
RequirementsMap.set(MinecraftEffectTypes.slowness.getName(), "10 & 7 & !4 & 7+5+1-0");
RequirementsMap.set(MinecraftEffectTypes.haste.getName(), "2 & 12+2+6-1-7 & <8");
RequirementsMap.set(MinecraftEffectTypes.miningFatigue.getName(), "!2 & !1*2-9 & 14-5");
RequirementsMap.set(MinecraftEffectTypes.strength.getName(), "9 & 3 & 9+4+5 & <11");
RequirementsMap.set(MinecraftEffectTypes.instantHealth.getName(), "11 & <6");
RequirementsMap.set(MinecraftEffectTypes.instantDamage.getName(), "!11 & 1 & 10 & !7");
RequirementsMap.set(MinecraftEffectTypes.jumpBoost.getName(), "8 & 2+0 & <5");
RequirementsMap.set(MinecraftEffectTypes.nausea.getName(), "8*2-!7+4-11 & !2 | 13 & 11 & 2*3-1-5");
RequirementsMap.set(MinecraftEffectTypes.regeneration.getName(), "!14 & 13*3-!0-!5-8");
RequirementsMap.set(MinecraftEffectTypes.resistance.getName(), "10 & 4 & 10+5+6 & <9");
RequirementsMap.set(MinecraftEffectTypes.fireResistance.getName(), "14 & !5 & 6-!1 & 14+13+12");
RequirementsMap.set(MinecraftEffectTypes.waterBreathing.getName(), "0+1+12 & !6 & 10 & !11 & !13");
RequirementsMap.set(MinecraftEffectTypes.invisibility.getName(), "2+5+13-0-4 & !7 & !1 & >5");
RequirementsMap.set(MinecraftEffectTypes.blindness.getName(), "9 & !1 & !5 & !3 & =3");
RequirementsMap.set(MinecraftEffectTypes.nightVision.getName(), "8*2-!7 & 5 & !0 & >3");
RequirementsMap.set(MinecraftEffectTypes.hunger.getName(), ">4>6>8-3-8+2");
RequirementsMap.set(MinecraftEffectTypes.weakness.getName(), "=1>5>7>9+3-7-2-11 & !10 & !0");
RequirementsMap.set(MinecraftEffectTypes.poison.getName(), "12+9 & !13 & !0");
const AmplifiersMap = new Map()
AmplifiersMap.set(MinecraftEffectTypes.speed.getName(), "7+!3-!1");
AmplifiersMap.set(MinecraftEffectTypes.haste.getName(), "1+0-!11");
AmplifiersMap.set(MinecraftEffectTypes.strength.getName(), "2+7-!12");
AmplifiersMap.set(MinecraftEffectTypes.instantHealth.getName(), "11+!0-!1-!14");
AmplifiersMap.set(MinecraftEffectTypes.instantDamage.getName(), "!11-!14+!0-!1");
AmplifiersMap.set(MinecraftEffectTypes.resistance.getName(), "12-!2");
AmplifiersMap.set(MinecraftEffectTypes.poison.getName(), "14>5");

const InstantEffects = [
  MinecraftEffectTypes.instantHealth.getName(),
  MinecraftEffectTypes.instantDamage.getName()
]

const NegativeEffects = [
  MinecraftEffectTypes.slowness.getName(),
  MinecraftEffectTypes.miningFatigue.getName(),
  MinecraftEffectTypes.nausea.getName(),
  MinecraftEffectTypes.blindness.getName(),
  MinecraftEffectTypes.hunger.getName(),
  MinecraftEffectTypes.weakness.getName(),
  MinecraftEffectTypes.poison.getName()
]

function formatDuration(effect, duration) {
  if (InstantEffects.includes(effect)) return ''
  const second = Math.floor(duration % 60);
  return ` (${Math.floor(duration / 60)}:${second < 10 ? `0${second}` : second})`;
}

function createEffect(effect, amplifier, duration) {
  return `§r§${NegativeEffects.includes(effect) ? 'c' : '7'}${I18N.EffectName.get(effect)}${amplifier ? Amplifier[amplifier] ?? amplifier : ''}${formatDuration(effect, Math.max(duration / 20, 1))}§r`;
}

function parseDuration(effect, string) {
  if (InstantEffects.includes(effect) || !string) return { isInstant: true, ticks: 1 }
  let temp = string.split(':');
  let result = 0;
  for (let i = temp.length - 1, mod = 1; i >= 0; i--, mod *= 60) result += parseInt(temp[i]) * mod;
  return { isInstant: false, ticks: result * 20 };
}

function parseEffect(lore) {
  let result = lore.match(I18N.PotionLoreRegExp);
  if (result) {
    let effect = Effects.get(I18N.EffectName.getKey(result[1]));
    if (effect) {
      let amplifier = Amplifier.indexOf(result[2]);
      if (amplifier == -1) amplifier = parseInt(result[2]);
      if (isNaN(amplifier)) amplifier = 0;
      return { type: effect, duration: parseDuration(effect, result[4]), amplifier: amplifier };
    }
  }
  return null
}

function getDistance(location1, location2) {
  let x = location1.x - location2.x
  let y = location1.y - location2.y
  let z = location1.z - location2.z
  return Math.sqrt(x * x + y * y + z * z)
}

function effectDamping(center, entity, duration, maxDistance = 4) {
  if (duration.isInstant) return 1
  let head = getDistance(center, entity.headLocation)
  let feet = getDistance(center, entity.location)
  let result = Math.floor(duration.ticks * (maxDistance - Math.min(head, feet)) / maxDistance);
  return (result >= 20) ? result : 0;
}

function getNumberFrom(bits, i1, i2, i3, i4, i5) {
  return bits[i1] ? 16 : 0 | bits[i2] ? 8 : 0 | bits[i3] ? 4 : 0 | bits[i4] ? 2 : 0 | bits[i5]
}

function updatePotionColor(data) {
  let bits = []
  for (let i = 0; i < 16; i++) bits[i] = data >> i & 1;
  PotionColor.red = ((getNumberFrom(bits, 2, 14, 11, 8, 5) ^ 3) << 3) / 255;
  PotionColor.green = ((getNumberFrom(bits, 0, 12, 9, 6, 3) ^ 3) << 3) / 255;
  PotionColor.blue = ((getNumberFrom(bits, 13, 10, 4, 1, 7) ^ 3) << 3) / 255;
}

function createAreaEffectCloud(dimension, location, tags, hitInfo, data) {
  AreaEffectCloudQuery.location = location;
  let entities = dimension.getEntities(AreaEffectCloudQuery);
  tags.forEach(tag => {
    let effect = parseEffect(tag);
    if (effect) for (let entity of entities) {
      entity.addEffect(
        effect.type,
        (hitInfo ? entity.headLocation.equals(hitInfo.entity.headLocation) : false) ? effect.duration.ticks : effectDamping(location, entity, effect.duration),
        effect.amplifier
      );
    }
  });
  updatePotionColor(data)
  PotionMolangVariableMap.setColorRGBA('variable.color', PotionColor)
  dimension.spawnParticle('brewing:thrown_potion_splash', location, PotionMolangVariableMap)
}

function CreatePotion(id, data, decimalData) {
  if (!decimalData) {
    switch (id) {
      case 'brewing:lingering_glass_bottle': return LingeringWaterBottle;
      case 'brewing:splash_glass_bottle': return SplashWaterBottle;
      default: return WaterBottle;
    }
  }
  let potion = Potion;
  switch (id) {
    case 'brewing:lingering_glass_bottle':
      potion = LingeringPotion;
      break;
    case 'brewing:splash_glass_bottle':
      potion = SplashPotion;
      break;
  }
  potion = new ItemStack(potion)
  potion.data = decimalData
  potion.nameTag = `§r§f${I18N.PotionPrefix[data.get(14).value * 16 + data.get(9).value * 8 + data.get(7).value * 4 + data.get(3).value * 2 + data.get(2).value]} ${I18N.PotionSuffix.get(id) ?? I18N.PotionSuffix.get('minecraft:glass_bottle')}§r`
  let lores = [];
  for (let effect of I18N.EffectName.keys()) {
    let str = RequirementsMap.get(effect);
    if (str) {
      let k = Parse(str, 0, str.length, data);
      if (k > 0) {
        let m = 0;
        let str2 = AmplifiersMap.get(effect);
        if (str2) {
          m = Parse(str2, 0, str2.length, data);
          if (m < 0) m = 0;
        }
        if (InstantEffects.includes(effect)) {
          k = 1;
        } else {
          k = 1200 * (k * 3 + (k - 1) * 2);
          if (NegativeEffects.includes(effect))
            k >>= 1;
        }
        lores.push(createEffect(effect, m, k))
      }
    }
  }
  if (lores.length) potion.setLore(lores);
  return potion;
}

function ItemCompleteCharge(args) {
  if (args.itemStack.typeId != 'brewing:potion') return;
  let lores = args.itemStack.getLore();
  lores.forEach(lore => {
    let effect = parseEffect(lore);
    if (effect) args.source.addEffect(effect.type, effect.duration.ticks, effect.amplifier);
  });
}

function ProjectileHit(args) {
  if (ThrowablePotions.includes(args.projectile.typeId)) {
    let effects = args.projectile.getTags();
    if (effects.length) {
      createAreaEffectCloud(args.dimension, args.location, effects, args.entityHit, args.projectile.getComponent('minecraft:skin_id').value);
    } else {
      let info = ThrownPotion.get(args.source.name);
      if (info.tags) {
        createAreaEffectCloud(args.dimension, args.location, info.tags, args.entityHit, info.data);
        ThrownPotion.set(args.source.name, undefined);
      }
    }
  }
}

function EntitySpawn(args) {
  if (ThrowablePotions.includes(args.entity.typeId)) args.entity.getEntitiesFromViewDirection(ShooterRaycastOption).forEach(entity => {
    if (entity.typeId == 'minecraft:player') {
      let info = ThrownPotion.get(entity.name);
      if (info.tags) {
        info.tags.forEach(lore => args.entity.addTag(lore));
        args.entity.getComponent('minecraft:skin_id').value = info.data;
        ThrownPotion.set(entity.name, undefined);
      }
    }
  })
}

function ItemUse(args) {
  if (args.source.typeId == 'minecraft:player' && ThrowablePotions.includes(args.item.typeId)) {
    ThrownPotion.set(args.source.name, { tags: args.item.getLore(), data: args.item.data });
  }
}
export { CreatePotion, ItemCompleteCharge, ProjectileHit, EntitySpawn, ItemUse };