import * as Cauldron from './cauldron';
import * as Potion from './potion';
import { world } from '@minecraft/server';

world.events.itemUseOn.subscribe(Cauldron.BeforeItemUseOn);
world.events.itemCompleteCharge.subscribe(Potion.ItemCompleteCharge);
world.events.projectileHit.subscribe(Potion.ProjectileHit);
world.events.entitySpawn.subscribe(Potion.EntitySpawn);
world.events.itemUse.subscribe(Potion.ItemUse);