import { MinecraftEffectTypes } from '@minecraft/server';

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

function amountOf1(data) {
  let sum = 0;
  for (let i = 0; i < 16; i++) sum += data.get(i).value;
  return sum;
}

function getBit(data, pos) {
  return (data.get(pos) ?? { value: 0 }).value
}

function calculate(b1, b2, b3, i1, i2, i3, data) {
  let i = 0;
  if (b1) {
    i = getBit(data, i2) ? 0 : 1;
  } else if (i1 != -1) {
    if (i1 == 0 && amountOf1(data) == i2) {
      i = 1;
    } else if (i1 == 1 && amountOf1(data) > i2) {
      i = 1;
    } else if (i1 == 2 && amountOf1(data) < i2) {
      i = 1;
    }
  } else {
    i = getBit(data, i2);
  }
  if (b2) {
    i *= i3;
  }
  if (b3) {
    i *= -1;
  }
  return i;
}

function Parse(paramString, paramInt1, paramInt2, data) {
  if (paramInt1 >= paramString.length || paramInt2 < 0 || paramInt1 >= paramInt2) return 0;
  let i = paramString.indexOf('|', paramInt1);
  if (i >= 0 && i < paramInt2) {
    let i2 = Parse(paramString, paramInt1, i - 1, data);
    if (i2 > 0) {
      return i2;
    }
    let i3 = Parse(paramString, i + 1, paramInt2, data);
    return Math.max(i3, 0);
  }
  let j = paramString.indexOf('&', paramInt1);
  if (j >= 0 && j < paramInt2) {
    let i2 = Parse(paramString, paramInt1, j - 1, data);
    if (i2 <= 0) {
      return 0;
    }
    let i3 = Parse(paramString, j + 1, paramInt2, data);
    if (i3 <= 0) {
      return 0;
    }
    return Math.max(i2, i3);
  }
  let bool1 = false;
  let bool2 = false;
  let bool3 = false;
  let bool4 = false;
  let bool5 = false;
  let b = -1;
  let k = 0;
  let m = 0;
  let n = 0;
  for (let i1 = paramInt1; i1 < paramInt2; i1++) {
    let c = paramString.charAt(i1);
    if (c >= '0' && c <= '9') {
      c = parseInt(c)
      if (bool1) {
        m = c;
        bool2 = true;
      } else {
        k *= 10;
        k += c;
        bool3 = true;
      }
    } else if (c == '*') {
      bool1 = true;
    } else if (c == '!') {
      if (bool3) {
        n += calculate(bool4, bool2, bool5, b, k, m, data);
        bool3 = bool2 = bool1 = bool5 = false;
        k = m = 0;
        b = -1;
      }
      bool4 = true;
    } else if (c == '-') {
      if (bool3) {
        n += calculate(bool4, bool2, bool5, b, k, m, data);
        bool3 = bool2 = bool1 = bool4 = false;
        k = m = 0;
        b = -1;
      }
      bool5 = true;
    } else if (c == '=' || c == '<' || c == '>') {
      if (bool3) {
        n += calculate(bool4, bool2, bool5, b, k, m, data);
        bool3 = bool2 = bool1 = bool5 = bool4 = false;
        k = m = 0;
      }
      if (c == '=') {
        b = 0;
      } else if (c == '<') {
        b = 2;
      } else {
        b = 1;
      }
    } else if (c == '+' && bool3) {
      n += calculate(bool4, bool2, bool5, b, k, m, data);
      bool3 = bool2 = bool1 = bool5 = bool4 = false;
      k = m = 0;
      b = -1;
    }
  }
  if (bool3) {
    n += calculate(bool4, bool2, bool5, b, k, m, data);
  }
  return n;
}



export { Parse, InstantEffects, NegativeEffects };