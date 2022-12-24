import { ItemTypes, ItemStack, MinecraftBlockTypes } from '@minecraft/server';
import * as Potion from './potion';

const Cauldrons = [
	MinecraftBlockTypes.get('brewing:cauldron'),
	MinecraftBlockTypes.get('brewing:cauldron_1'),
	MinecraftBlockTypes.get('brewing:cauldron_2'),
	MinecraftBlockTypes.get('brewing:cauldron_3')
]
const GlassBottle = new ItemStack(ItemTypes.get('minecraft:glass_bottle'));
const Bucket = new ItemStack(ItemTypes.get('minecraft:bucket'));
const WaterBucket = new ItemStack(ItemTypes.get('minecraft:water_bucket'));

function cancel(args) { args.cancel = true }

function cloneProperties(oldPermutation, newPermutation) {
	if (newPermutation) newPermutation.getAllProperties().forEach(property => {
		property.value = oldPermutation.getProperty(property.name).value
	})
}

function getLiquidData(data) {
	let liquidData = 0;
	for (let i = 0, mod = 1; i < 16; i++, mod *= 2) {
		liquidData += data.get(i).value * mod;
	}
	return liquidData
}

function BeforeItemUseOn(args) {
	const block = args.source.dimension.getBlock(args.blockLocation);
	if (!/^brewing:cauldron(_[1-3])?$/.test(block.typeId)) return;
	const data = new Map();
	const container = args.source.getComponent('inventory').container;
	let permutation = block.permutation;
	let newItem = null;
	let tempPermutation = null;
	for (let i = 0; i < 16; i++) data.set(i, permutation.getProperty(`brewing:bit${i}`));
	let record = getLiquidData(data)
	if (block)
	switch (args.item.typeId) {
		case 'minecraft:lingering_potion':
		case 'minecraft:splash_potion':
		case 'minecraft:potion':
			if (!args.item.data && block.typeId != Cauldrons[3].id) {
				switch (block.typeId) {
					case Cauldrons[0].id:
						tempPermutation = Cauldrons[1].createDefaultBlockPermutation();
						break;
					case Cauldrons[1].id:
						tempPermutation = Cauldrons[2].createDefaultBlockPermutation();
						break;
					case Cauldrons[2].id:
						tempPermutation = Cauldrons[3].createDefaultBlockPermutation();
						break;
					default: return cancel(args);//?
				}
				data.get(1).value = 0;
				data.get(3).value = 0;
				data.get(5).value = 0;
				data.get(7).value = 0;
				data.get(9).value = 0;
				data.get(11).value = 0;
				data.get(13).value = 0;
				cloneProperties(permutation, tempPermutation);
				permutation = tempPermutation;
				newItem = GlassBottle;
				break;
			} else return cancel(args);
		case 'minecraft:water_bucket':
			if (block.typeId != Cauldrons[3].id) {
				data.get(1).value = 0;
				data.get(3).value = 0;
				data.get(5).value = 0;
				data.get(7).value = 0;
				data.get(9).value = 0;
				data.get(11).value = 0;
				data.get(13).value = 0;
				tempPermutation = Cauldrons[3].createDefaultBlockPermutation();
				cloneProperties(permutation, tempPermutation);
				permutation = tempPermutation;
				newItem = Bucket;
				break;
			} else return cancel(args);
		case 'minecraft:bucket':
			if (!args.item.data && block.typeId == Cauldrons[3].id && !record) {
				permutation = Cauldrons[0].createDefaultBlockPermutation();
				newItem = WaterBucket;
				break;
			} else return cancel(args);
		case 'brewing:lingering_glass_bottle':
		case 'brewing:splash_glass_bottle':
		case 'minecraft:glass_bottle':
			if (block.typeId != Cauldrons[0].id) {
				switch (block.typeId) {
					case Cauldrons[1].id:
						permutation = Cauldrons[0].createDefaultBlockPermutation();
						break;
					case Cauldrons[2].id:
						tempPermutation = Cauldrons[1].createDefaultBlockPermutation();
						break;
					case Cauldrons[3].id:
						tempPermutation = Cauldrons[2].createDefaultBlockPermutation();
						break;
					default: return cancel(args);//?
				}
				cloneProperties(permutation, tempPermutation);
				permutation = tempPermutation ?? permutation;
				newItem = Potion.CreatePotion(args.item.typeId, data, record)
				break;
			} else return cancel(args);
		case 'minecraft:blaze_powder':
			if (block.typeId == Cauldrons[0].id) return cancel(args);
			data.get(14).value = 1;
			break;
		case 'minecraft:sugar':
			if (block.typeId == Cauldrons[0].id) return cancel(args);
			data.get(0).value = 1;
			break;
		case 'minecraft:spider_eye':
			if (block.typeId == Cauldrons[0].id) return cancel(args);
			data.get(5).value = 1;
			data.get(7).value = 1;
			data.get(10).value = 1;
			break;
		case 'minecraft:fermented_spider_eye':
			if (block.typeId == Cauldrons[0].id) return cancel(args);
			data.get(9).value = 1;
			data.get(14).value = 1;
			break;
		case 'minecraft:ghast_tear':
			if (block.typeId == Cauldrons[0].id) return cancel(args);
			data.get(11).value = 1;
			break;
		case 'minecraft:magma_cream':
			if (block.typeId == Cauldrons[0].id) return cancel(args);
			data.get(1).value = 1;
			data.get(6).value = 1;
			data.get(14).value = 1;
			break;
		case 'minecraft:nether_wart':
			if (block.typeId == Cauldrons[0].id) return cancel(args);
			let liquidData = record
			let b;
			if ((liquidData & 0x1) != 0) {
				b = 14
				while ((liquidData & 1 << b) == 0 && b >= 0) {
					b--;
				}
				if (b >= 2 && (liquidData & 1 << b - 1) == 0) {
					liquidData &= ~(1 << b);
					liquidData <<= 1;
					liquidData |= 1 << b;
					liquidData |= 1 << b - 1;
					liquidData &= 0x7FFF;
				}
			}
			b = 14;
			while ((liquidData & 1 << b) == 0 && b >= 0) {
				b--;
			}
			if (b >= 0) {
				liquidData &= ~(1 << b);
			}
			let i = 0;
			let j = liquidData;
			while (j != i) {
				j = liquidData;
				i = 0;
				for (let b1 = 0; b1 < 15; b1++) {
					let bool = (liquidData & 1 << b1) != 0;
					if (bool) {
						if (!((liquidData & 1 << b1 + 1) != 0) && ((liquidData & 1 << (b1 + 2) % 15) != 0)) {
							bool = false;
						} else if (!((liquidData & 1 << (b1 - 1) % 15) != 0) && ((liquidData & 1 << (b1 - 2) % 15) != 0)) {
							bool = false;
						}
					} else {
						bool = (((liquidData & 1 << (b1 - 1) % 15) != 0) && ((liquidData & 1 << b1 + 1) != 0));
					}
					if (bool)
						i |= 1 << b1;
				}
				liquidData = i;
			}
			if (b >= 0) i |= 1 << b;
			liquidData = i & 0x7FFF;
			for (let i = 0; i < 16; i++) data.get(i).value = liquidData >> i & 1;
			break;
		default: return cancel(args);
	}
	if (permutation.type.typeId == block.typeId && record == getLiquidData(data)) return cancel(args);
	args.source.playSound('random.splash');
	args.item.amount--;
	block.setPermutation(permutation);
	container.setItem(args.source.selectedSlot, args.item);
	if (newItem) container.addItem(newItem);
}

export { BeforeItemUseOn };