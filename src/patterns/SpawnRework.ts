import { ConfigTypes } from "@spt-aki/models/enums/ConfigTypes";
import { DependencyContainer } from "@spt-aki/models/external/tsyringe";
import { IBotConfig } from "@spt-aki/models/spt/config/IBotConfig";
import { ConfigServer } from "@spt-aki/servers/ConfigServer";
import { DatabaseServer } from "@spt-aki/servers/DatabaseServer"
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import { LogTextColor } from "@spt-aki/models/spt/logging/LogTextColor";
import { LogBackgroundColor } from "@spt-aki/models/spt/logging/LogBackgroundColor";
import { RandomUtil } from "@spt-aki/utils/RandomUtil";
import { HelpFunctions } from "./HelpFunctions";
import modConfig from "../../config/config.json";

export class SpawnRework
{
    protected helper = new HelpFunctions();

	public getBotTypeFromMapName(mapName: string, botConfig: IBotConfig)
	{
		switch(mapName)
		{
			case "bigmap": return botConfig.pmc.pmcType.Customs;
			case "shoreline": return botConfig.pmc.pmcType.Shoreline;
			case "interchange": return botConfig.pmc.pmcType.Interchange;
			case "rezervbase": return botConfig.pmc.pmcType.ReserveBase;
			case "factory4_day": return botConfig.pmc.pmcType.Factory;
			case "factory4_night": return botConfig.pmc.pmcType.Factory;
			case "laboratory": return botConfig.pmc.pmcType.Laboratory;
			case "woods": return botConfig.pmc.pmcType.Woods;
			case "lighthouse": return botConfig.pmc.pmcType.Lighthouse;
			default: return botConfig.pmc.pmcType.default;
		}
	}

	public getMaxBotFromMapName(mapName: string, botConfig: IBotConfig)
	{
		switch(mapName)
		{
			case "bigmap": return botConfig.maxBotCap.customs;
			case "shoreline": return botConfig.maxBotCap.shoreline;
			case "interchange": return botConfig.maxBotCap.interchange;
			case "rezervbase": return botConfig.maxBotCap.reserveBase;
			case "factory4_day": return botConfig.maxBotCap.factory;
			case "factory4_night": return botConfig.maxBotCap.factory;
			case "laboratory": return botConfig.maxBotCap.laboratory;
			case "woods": return botConfig.maxBotCap.woods;
			case "lighthouse": return botConfig.maxBotCap.lighthouse;
			default: return botConfig.maxBotCap.default;
		}
	}

	public GenerateSpawnWaves(container: DependencyContainer, map_configs, map_base, map_name)
	{
		const logger: ILogger = container.resolve<ILogger>("WinstonLogger");
		const randomUtil: RandomUtil = container.resolve<RandomUtil>("RandomUtil");
        const configServer = container.resolve<ConfigServer>("ConfigServer");
        const botConfig = configServer.getConfig<IBotConfig>(ConfigTypes.BOT);
		const databaseServer = container.resolve<DatabaseServer>("DatabaseServer").getTables();
		const botTypes = this.getBotTypeFromMapName(map_name, botConfig);
		const botMaxCap = this.getMaxBotFromMapName(map_name, botConfig);

		// Set map's rules, configs => Currently zero effects
		databaseServer.locations[map_name].base.Rules = map_configs.map_rules;
		databaseServer.locations[map_name].base.MaxBotPerZone = map_configs.max_bot_per_zone;

		logger.info("\n");
		logger.log(`  ${map_name.toUpperCase()}`, LogTextColor.CYAN, LogBackgroundColor.DEFAULT);
		if (map_configs.show_generated_bots != "disable") logger.log(`  MaxBotPerZone: ${map_configs.max_bot_per_zone}\tMaxAlive: ${botMaxCap}`, LogTextColor.YELLOW, LogBackgroundColor.DEFAULT);
		if (map_configs.show_generated_bots == "all")
		{
			logger.log(`  UsecType: ${botTypes.usec.toUpperCase()}\tBearType: ${botTypes.bear.toUpperCase()}`, LogTextColor.YELLOW, LogBackgroundColor.DEFAULT);
			logger.log(`  Scav OpenZones: ${map_configs.scav_map_openzones}`, LogTextColor.GREEN, LogBackgroundColor.DEFAULT);
		}

		//Numbers
        let chance, escort_amount, current_wave, spawn_time, wave_number, boss_count, spawn_index, escape_time_limit, spawn_count;
        //Objects
        let boss_settings, sniper_waves, scav_waves, raider_waves, pmc_waves, supports, triggered_waves, current_boss_settings, spawn_time_list;
        //Arrays
        let spawn_location_array, difficulty_array, spawned_bosses, spawned_locations;
        //Strings
        let spawn_location, difficulty, name, escort_type, escort_difficulty, trigger_id, trigger_name;
        //Random
        let rnd;

		boss_count = 0;
		spawn_index = 0;
		wave_number = 0;
        scav_waves = map_configs.wave_settings.scav_waves;
        pmc_waves = map_configs.wave_settings.pmc_waves;
        sniper_waves = map_configs.wave_settings.sniper_waves;
        raider_waves = map_configs.wave_settings.raider_waves;
        triggered_waves = map_configs.wave_settings.triggered_waves;

		// Map escape time limit in seconds
		escape_time_limit = databaseServer.locations[map_name].base.EscapeTimeLimit * 60;

		// Force factory's map config, it need to be true or config should
		// Disabled for later when Factory has more tan one spawn zone :kappa:
		if (map_name === "factory4_day" || map_name === "factory4_night") {
			map_configs.bosses_spawn_location_type = "together";
			if (scav_waves !== undefined) {
				scav_waves.spawn_location_type = "together";
				scav_waves.spawn_time_delay_accumulate_for_each_zone = false;
			}
			if (sniper_waves !== undefined) {
				sniper_waves.spawn_location_type = "together";
				sniper_waves.spawn_time_delay_accumulate_for_each_zone = false;
			}
			if (raider_waves !== undefined) {
				raider_waves.spawn_location_type = "together";
				raider_waves.spawn_time_delay_accumulate_for_each_zone = false;
			}
			if (pmc_waves !== undefined) {
				pmc_waves.spawn_location_type = "together";
				pmc_waves.spawn_time_delay_accumulate_for_each_zone = false;
			}
			map_configs.allow_other_bot_spawn_with_boss = true;
		}

		// Re-enable the Scav if there are scav waves
		if (databaseServer.locations[map_name].base.DisabledForScav === true && (scav_waves && scav_waves.wave_total > 0 || sniper_waves && sniper_waves.wave_total > 0) )
			databaseServer.locations[map_name].base.DisabledForScav = false;

        //Boss spawn
        if (map_configs.has_boss && modConfig?.UsePatternSpawns?.Bosses) {
			if (map_configs.boss_settings !== undefined && map_configs.boss_settings.length > 0 && map_configs.max_boss > 0) {
				if (map_configs.show_generated_bots != "disable")
					logger.log(`------------------------- Boss -------------------------`, LogTextColor.WHITE, LogBackgroundColor.DEFAULT);

				if (map_configs.show_generated_bots == "secret")
					logger.log(` [¿] Secret`, LogTextColor.MAGENTA, LogBackgroundColor.DEFAULT);

				spawned_bosses = [];
				spawned_locations = [];

				let loop = 0;
				boss_settings = map_configs.boss_settings;

				if (boss_settings.length > 1) {
					boss_settings.sort(function f(a, b){return 0.5-Math.random();}); // Random Sort

					 // Re-sort for multiple type to end of the array to check same bosses, if [allow_same_boss_spawn] is false
					if (map_configs.allow_same_boss_spawn === false) {
						for (let i = boss_settings.length-1; i >= 0; i--) {
							if (boss_settings[i].name === undefined)
								continue;

							if (boss_settings[i].name.includes(",")) {
								boss_settings.push(boss_settings[i]);
								boss_settings.splice(i, 1);
								if (i < boss_settings.length-2)
									i++;
							}
						}
					}
				}

				let trying = map_configs.boss_spawn_trying_loop;
				while(map_configs.max_boss > boss_count) {
					let isRandom = false;
					current_boss_settings = boss_settings[loop];
					name = current_boss_settings.name;

					if (name === undefined) {
						logger.error(`{map_name} - One of Boss has no boss type settings (${name}), Skipping...`);
						boss_settings.splice(loop--, 1);
						if (boss_settings.length === 0) break;
						if (++loop >= boss_settings.length) loop = 0;
						continue;
					}

					if (name.includes(",")) {
						let arr = [... name.split(",").map((item)=>item.trim())];
						for (let i = arr.length-1; i >= 0; i--) {
							if (databaseServer.bots.types[arr[i].toLowerCase()] === undefined) {
								logger.error(`${map_name} - (${current_boss_settings.name}) Boss has bad type settings ${arr[i]}, Removed...`);
								arr.splice(i, 1);
							}
						}
						if (spawned_bosses.length > 0 && map_configs.allow_same_boss_spawn === false) {
							for (let i = 0; i < arr.length; i++) {
								for (let j = 0; j < spawned_bosses.length; j++) {
									if (arr[i] === spawned_bosses[j]) {
										arr.splice(i--, 1);
										break;
									}
								}
							}

							// Skipping Multiple Boss Name because [allow_same_boss_spawn] is false and out of name
							if (arr.length === 0) {
								boss_settings.splice(loop--, 1);
								if (boss_settings.length === 0) break;
								if (++loop >= boss_settings.length) loop = 0;
								continue;
							}
						}
						if (arr.length === 1) name = arr[0];
						else if (arr.length > 1) {
							name = arr[randomUtil.getInt(0, arr.length-1)];
							// If all values are same than IT'S NOT RANDOM! Reeeeeeeeeeee
							for (let i = 0; i < arr.length-1; i++) {
								if (arr[i] !== name) {
									isRandom = true; // Oh, wait...
									break;
								}
							}
						}
						else name = undefined;
					}

					if (name === undefined || databaseServer.bots.types[name.toLowerCase()] === undefined) {
						logger.error(`${map_name} - (${name} | ${current_boss_settings.name}) Boss has bad type settings, Skipping...`);
						boss_settings.splice(loop--, 1);
						if (boss_settings.length === 0) break;
						if (++loop >= boss_settings.length) loop = 0;
						continue;
					}

					chance = current_boss_settings.chance;
					difficulty = current_boss_settings.difficulty;
					if (difficulty !== undefined && difficulty.includes(",")) {
						let arr = [... difficulty.split(",").map((item)=>item.trim())];
						for (let i = arr.length-1; i >= 0; i--) {
							if (databaseServer.bots.types[name.toLowerCase()].difficulty[arr[i].toLowerCase()] === undefined) {
								logger.error(`${map_name} - (${current_boss_settings.name}) Boss doesn't have "${arr[i]}" difficulty, Removed...`);
								arr.splice(i, 1);
							}
						}
						if (arr.length === 1) difficulty = arr[0].toLowerCase();
						else if (arr.length > 1) difficulty = arr[randomUtil.getInt(0, arr.length-1)].toLowerCase();
					}

					if (difficulty === undefined || databaseServer.bots.types[name.toLowerCase()].difficulty[difficulty] === undefined) {
						logger.error(`${map_name} - (${current_boss_settings.name}) Boss doesn't have "${difficulty}" difficulty, Skipping...`);
						boss_settings.splice(loop--, 1);
						if (boss_settings.length === 0) break;
						if (++loop >= boss_settings.length) loop = 0;
						continue;
					}

					if (current_boss_settings.supports === undefined || current_boss_settings.supports === null || current_boss_settings.supports.length === 0) {
						escort_type = current_boss_settings.escort_type;
						escort_difficulty = current_boss_settings.escort_difficulty;

						if (escort_type === undefined) {
							logger.error(`${map_name} - Boss ${current_boss_settings.name}'s Escort has no type settings (${current_boss_settings.escort_type}), Skipping...`);
							boss_settings.splice(loop--, 1);
							if (boss_settings.length === 0) break;
							if (++loop >= boss_settings.length) loop = 0;
							continue;
						}

						if (escort_difficulty === undefined) {
							logger.error(`${map_name} - Boss ${current_boss_settings.name}'s Escort ${current_boss_settings.escort_type} has no difficulty settings (${escort_difficulty}), Skipping...`);
							boss_settings.splice(loop--, 1);
							if (boss_settings.length === 0) break;
							if (++loop >= boss_settings.length) loop = 0;
							continue;
						}

						if (escort_type !== null && escort_difficulty !== null) {
							if (escort_type.includes(",")) {
								let arr = [... escort_type.split(",").map((item)=>item.trim())];
								for (let i = arr.length-1; i >= 0; i--) {
									if (databaseServer.bots.types[arr[i].toLowerCase()] === undefined) {
										logger.error(`${map_name} - Boss ${current_boss_settings.name}'s Escort has bad type settings (${arr[i]}), Removed...`);
										arr.splice(i, 1);
									}
								}
								if (arr.length === 1) escort_type = arr[0];
								else if (arr.length > 1) escort_type = arr[randomUtil.getInt(0, arr.length-1)];
							}

							if (escort_type === undefined || databaseServer.bots.types[escort_type.toLowerCase()] === undefined) {
								logger.error(`${map_name} - Boss ${current_boss_settings.name}'s Escort has bad type settings (${current_boss_settings.escort_type}), Skipping...`);
								boss_settings.splice(loop--, 1);
								if (boss_settings.length === 0) break;
								if (++loop >= boss_settings.length) loop = 0;
								continue;
							}

							if (escort_difficulty.includes(",")) {
								let arr = [... escort_difficulty.split(",").map((item)=>item.trim())];
								for (let i = arr.length-1; i >= 0; i--) {
									if (databaseServer.bots.types[escort_type.toLowerCase()].difficulty[arr[i].toLowerCase()] === undefined) {
										logger.error(`${map_name} - Boss ${current_boss_settings.name}'s Escort doesn't have "${arr[i]}" difficulty, Removed...`);
										arr.splice(i, 1);
									}
								}
								if (arr.length === 1) escort_difficulty = arr[0].toLowerCase();
								else if (arr.length > 1) escort_difficulty = arr[randomUtil.getInt(0, arr.length-1)].toLowerCase();
							}

							if (escort_difficulty === undefined || databaseServer.bots.types[escort_type.toLowerCase()].difficulty[escort_difficulty] === undefined ) {
								logger.error(`${map_name} - Boss ${current_boss_settings.name}'s Escort ${current_boss_settings.escort_type} doesn't have "${escort_difficulty}" difficulty, Skipping...`);
								boss_settings.splice(loop--, 1);
								if (boss_settings.length === 0) break;
								if (++loop >= boss_settings.length) loop = 0;
								continue;
							}
						} else {
							escort_type = "followerBully"; // fill up escort settings to avoid loading error
							escort_difficulty = "normal";
							current_boss_settings.escort_amount_min = 0; // Override spawn amount to avoid bad escort type spawns
							current_boss_settings.escort_amount_max = 0;
						}
					}

					if (current_boss_settings.escort_amount_min === undefined || current_boss_settings.escort_amount_min < 0)
						current_boss_settings.escort_amount_min = 0;
					if (current_boss_settings.escort_amount_max === undefined || current_boss_settings.escort_amount_max < 0)
						current_boss_settings.escort_amount_max = 0;

					if (name !== "sectantPriest" || map_configs.cultists_spawn_at_own_locations === false)
						spawn_location_array = this.helper.Generate_info_array(current_boss_settings.spawn_locations, (map_configs.bosses_spawn_location_type == "evenly")?"without_chance":"with_chance");
					else
						spawn_location_array = this.helper.Generate_info_array(current_boss_settings.spawn_locations, "with_chance");

					let boss_locations = [... spawn_location_array];
					if (name !== "sectantPriest" || map_configs.cultists_spawn_at_own_locations === false || Object.keys(current_boss_settings.spawn_locations).length === 0) {
						if (map_configs.bosses_also_use_scavs_spawn_locations === true) {
							if (scav_waves && scav_waves.spawn_locations && Object.keys(scav_waves.spawn_locations).length > 0) {
								let scav_spawn_locations = this.helper.Generate_info_array(scav_waves.spawn_locations,"with_chance");
								if (map_configs.bosses_spawn_location_type == "evenly") {
									for (let z = 0; z < scav_spawn_locations.length; z++) {
										let push = true;
										for (let x = 0; x < spawn_location_array.length; x++) {
											if (spawn_location_array[x] === scav_spawn_locations[z]) {
												push = false;
												break;
											}
										}
										if (push) spawn_location_array.push(scav_spawn_locations[z]);
									}
								}
								if (spawn_location_array.length === 0)
									spawn_location_array = [... scav_spawn_locations];
							} else logger.error(`${map_name} has no scav spawn locations to use on boss spawn`);
						}

						if (map_configs.bosses_also_use_raiders_spawn_locations === true) {
							if (raider_waves && raider_waves.spawn_locations && Object.keys(raider_waves.spawn_locations).length > 0) {
								let raiders_spawn_locations = this.helper.Generate_info_array(raider_waves.spawn_locations,"with_chance");
								if (map_configs.bosses_spawn_location_type == "evenly") {
									for (let z = 0; z < raiders_spawn_locations.length; z++) {
										let push = true;
										for (let x = 0; x < spawn_location_array.length; x++) {
											if (spawn_location_array[x] === raiders_spawn_locations[z]) {
												push = false;
												break;
											}
										}
										if (push) spawn_location_array.push(raiders_spawn_locations[z]);
									}
								}
								if (spawn_location_array.length === 0)
									spawn_location_array = [... raiders_spawn_locations];
							} else logger.error(`${map_name} has no raider spawn locations to use on boss spawn`);
						}
					}
					
					if (spawn_location_array === undefined || spawn_location_array.length === 0) {
						logger.error(`${map_name} - ${current_boss_settings.name} has no boss spawn locations to use, Skipping...`);
						boss_settings.splice(loop--, 1);
						if (boss_settings.length === 0) break;
						if (++loop >= boss_settings.length) loop = 0;
						continue;
					}
					
					let spawned = false;
					if (randomUtil.getInt(0,99) < chance) {
						//Spawn boss and take boss location from other bots' spawn locations
						chance = 100;
						spawn_time = -1;
						supports = (current_boss_settings.supports !== undefined && current_boss_settings.supports !== null && current_boss_settings.supports.length > 0) ? current_boss_settings.supports : null;
						trigger_id = (current_boss_settings.trigger_id !== undefined) ? current_boss_settings.trigger_id : "";
						trigger_name = (current_boss_settings.trigger_name !== undefined) ? current_boss_settings.trigger_name : "";

						let spawn_time_total = 0;
						let needSkip = false;
						const random_time_spawn = current_boss_settings?.random_time_spawn || false;
						if (current_boss_settings.wave_total === undefined) {
							needSkip = true;
							logger.error(`${map_name} - Boss ${current_boss_settings.name} has no [wave_total] settings, Skipping...`);
						} else if (current_boss_settings.wave_total < 1) {
							needSkip = true;
						}

						if (current_boss_settings.wave_spawn_time_for_each_min === undefined) {
							needSkip = true;
							logger.error(`${map_name} - Boss ${current_boss_settings.name} has no [wave_spawn_time_for_each_min] settings, Skipping...`);
						} else if (current_boss_settings.wave_spawn_time_for_each_min < -1) {
							current_boss_settings.wave_spawn_time_for_each_min = -1;
						}

						if (current_boss_settings.wave_spawn_time_for_each_max === undefined) {
							needSkip = true;
							logger.error(`${map_name} - Boss ${current_boss_settings.name} has no [wave_spawn_time_for_each_max] settings, Skipping...`);
						} else if (current_boss_settings.wave_spawn_time_for_each_max < -1) {
							current_boss_settings.wave_spawn_time_for_each_max = -1;
						}

						if (current_boss_settings.wave_spawn_all_same_location === undefined) {
							current_boss_settings.wave_spawn_all_same_location = false;
							logger.error(`${map_name} - Boss ${current_boss_settings.name} has no [wave_spawn_all_same_location] settings, set to "false"...`);
						}

						if (needSkip) {
							boss_settings.splice(loop--, 1);
							if (boss_settings.length === 0) break;
							if (++loop >= boss_settings.length) loop = 0;
							continue;
						}

						for (let i = 0; i < current_boss_settings.wave_total; i++) {
							if (i > 0) {
								let addTime = randomUtil.getInt(current_boss_settings.wave_spawn_time_for_each_min, current_boss_settings.wave_spawn_time_for_each_max);
								spawn_time = (addTime > 0 ? addTime : 0) + spawn_time_total;
								spawn_time_total += spawn_time;
							} else {
								// Instant Spawn
								spawn_time = -1;
								spawn_time_total = 0;
							}
							
							if (spawn_time >= escape_time_limit || spawn_time >= map_configs.max_spawn_time) {
								if (map_configs.max_spawn_time_limit_warning === true) {
									let var_name;
									let timelimit;
									if (spawn_time >= escape_time_limit) {
										var_name = "escape_time_limit";
										timelimit = escape_time_limit;
									} else {
										var_name = "max_spawn_time";
										timelimit = map_configs.max_spawn_time;
									}
									logger.warning(`${map_name} - Boss has beyond [${var_name}] (${timelimit}s) wave, Skipping rest of wave generation...`);
									logger.warning(`[Info: boss (${name}) | spawn_time (${spawn_time}s / ${timelimit}s) | wave (${i} / ${current_boss_settings.wave_total})]`);
								}
								break;
							}

							if (spawn_time < -1)
								spawn_time = -1;

							escort_amount = 0;
							if (supports !== null) {
								escort_type = "followerBully"; // fill up escort settings to avoid loading error
								escort_difficulty = "normal";
	
								for (let i = 0; i < supports.length; i++) {
									// Fixing random escorts amount that I'm missing somewhere
									if (supports[i].BossEscortAmount && (!supports[i]?.BossEscortAmount_min || !supports[i].BossEscortAmount_max) ) {
										supports[i].BossEscortAmount_min = supports[i].BossEscortAmount;
										supports[i].BossEscortAmount_max = supports[i].BossEscortAmount;
									}

									if (supports[i].BossEscortAmount_min === undefined || supports[i].BossEscortAmount_max === undefined) {
										logger.error(`${map_name} - Boss ${current_boss_settings.name}'s Index ${i+1}. Supporter has no min/max amount settings (${supports[i].BossEscortAmount_min}/${supports[i].BossEscortAmount_max}), Skipping...`);
										current_boss_settings.supports.splice(i--, 1);
										continue;
									}
	
									if (supports[i].BossEscortType === undefined) {
										logger.error(`${map_name} - Boss ${current_boss_settings.name}'s Index ${i+1}. Supporter has no escort type settings (${supports[i].BossEscortType}), Skipping...`);
										current_boss_settings.supports.splice(i--, 1);
										continue;
									}
	
									if (supports[i].BossEscortDifficult[0] === undefined) {
										logger.error(`${map_name} - Boss ${current_boss_settings.name}'s Index ${i+1}. Supporter has no difficulty settings (${supports[i].BossEscortDifficult[0]}), Skipping...`);
										current_boss_settings.supports.splice(i--, 1);
										continue;
									}
	
									if (supports[i].BossEscortAmount_max < 1) {
										current_boss_settings.supports.splice(i--, 1);
										continue;
									}
	
									let numMin = supports[i].BossEscortAmount_min;
									let numMax = supports[i].BossEscortAmount_max;
									current_boss_settings.escort_amount_min += numMin;
									current_boss_settings.escort_amount_max += numMax;
									supports[i].BossEscortAmount = randomUtil.getInt(numMin, numMax);
									escort_amount += supports[i].BossEscortAmount;
									delete supports[i].BossEscortAmount_min;
									delete supports[i].BossEscortAmount_max;
	
									if (supports[i].BossEscortType.includes(",")) {
										let arr = [... supports[i].BossEscortType.split(",").map((item)=>item.trim())];
										for (let j = arr.length-1; j >= 0; j--) {
											if (databaseServer.bots.types[arr[j].toLowerCase()] === undefined) {
												logger.error(`${map_name} - Boss ${current_boss_settings.name}'s Index ${i+1}. Supporter has bad escort type settings (${arr[j]}), Removed...`);
												arr.splice(j, 1);
											}
										}
										if (arr.length === 1) supports[i].BossEscortType = arr[0];
										else supports[i].BossEscortType = arr[randomUtil.getInt(0, arr.length-1)];
									}
	
									if (supports[i].BossEscortType === undefined || databaseServer.bots.types[supports[i].BossEscortType.toLowerCase()] === undefined) {
										logger.error(`${map_name} - Boss ${current_boss_settings.name}'s Index ${i+1}. Supporter has bad escort type settings (${supports[i].BossEscortType}), Skipping...`);
										current_boss_settings.supports.splice(i--, 1);
										continue;
									}
	
									if (supports[i].BossEscortDifficult[0].includes(",")) {
										let arr = [... supports[i].BossEscortDifficult[0].split(",").map((item)=>item.trim())];
										for (let j = arr.length-1; j >= 0; j--) {
											if (databaseServer.bots.types[supports[i].BossEscortType.toLowerCase()].difficulty[arr[j]] === undefined) {
												logger.error(`${map_name} - Boss ${current_boss_settings.name}'s Index ${i+1}. Supporter doesn't have "${arr[j]}" difficulty, Removed...`);
												arr.splice(j, 1);
											}
										}
										if (arr.length === 1) supports[i].BossEscortDifficult[0] = arr[0].toLowerCase();
										else if (arr.length > 1) supports[i].BossEscortDifficult[0] = arr[randomUtil.getInt(0, arr.length-1)].toLowerCase();
									}
	
									if (supports[i].BossEscortDifficult[0] === undefined || databaseServer.bots.types[supports[i].BossEscortType.toLowerCase()].difficulty[supports[i].BossEscortDifficult[0]] === undefined ) {
										logger.error(`${map_name} - Boss ${current_boss_settings.name}'s Index ${i+1}. Supporter doesn't have "${supports[i].BossEscortDifficult[0]}" difficulty, Skipping...`);
										current_boss_settings.supports.splice(i--, 1);
										continue;
									}
								}
							} else escort_amount = randomUtil.getInt(current_boss_settings.escort_amount_min, current_boss_settings.escort_amount_max);
							if (escort_amount < 0) escort_amount = 0;

							if (current_boss_settings.wave_spawn_all_same_location === false || i === 0) {
								if (name !== "sectantPriest" || map_configs.cultists_spawn_at_own_locations === false) {
									switch(map_configs.bosses_spawn_location_type) {
										case "together":
											if (boss_count === 0)
												spawn_location = spawn_location_array[randomUtil.getInt(0, spawn_location_array.length-1)];
										break;

										case "evenly":
											let spawn_location_array_cleaned_array = [... spawn_location_array];
											if (spawned_locations.length > 0) {
												for (let i = 0; i < spawned_locations.length; i++) {
													for (let j = 0; j < spawn_location_array_cleaned_array.length; j++) {
														if (spawn_location_array_cleaned_array[j] === spawned_locations[i])
															spawn_location_array_cleaned_array.splice(j, 1);
													}
												}
												if (spawn_location_array_cleaned_array.length === 0) {
													spawned_locations = [];
													spawn_location_array_cleaned_array = [... spawn_location_array];
												}
											}
											spawn_location = spawn_location_array_cleaned_array[randomUtil.getInt(0, spawn_location_array_cleaned_array.length-1)];
										break;

										default: // "random"
											spawn_location = spawn_location_array[randomUtil.getInt(0, spawn_location_array.length-1)];
										break;
									}
								} else spawn_location = spawn_location_array[randomUtil.getInt(0, spawn_location_array.length-1)];
							}
							
							//Call boss type spawn function
							//Gluhar (supports) use spawn format with supports and trigger info
							if (supports === null || supports.length === 0)
								map_base = this.helper.Add_boss_type_spawn_simple(map_base, name, chance, spawn_location, difficulty, escort_type, escort_difficulty, escort_amount, spawn_time, random_time_spawn);
							else
								map_base = this.helper.Add_boss_type_spawn_complete(map_base, name, chance, spawn_location, difficulty, escort_type, escort_difficulty, escort_amount, spawn_time, trigger_id, trigger_name, supports, random_time_spawn);

							spawned = true;
							spawn_index++;
							if (i === 0 && (name !== "sectantPriest" || map_configs.cultists_spawn_count_for_max_boss === true) ) boss_count++;

							if (map_configs.show_generated_bots == "all") {
								const _t = boss_count;
								if (i > 0) boss_count = ">";
								else if (name === "sectantPriest" && map_configs.cultists_spawn_count_for_max_boss === false)
									boss_count = "*";

								if (spawn_time < 1)
									spawn_time = "Instant";
								else
									spawn_time += "s";

								if (escort_amount === 0)
									logger.log(` [${boss_count}] ${(isRandom === true) ? "(Random) " + name : name} (Spawn Time: ${spawn_time}) at [${spawn_location}]`, LogTextColor.MAGENTA, LogBackgroundColor.DEFAULT);
								else
									logger.log(` [${boss_count}] ${(isRandom === true) ? "(Random) " + name : name} (Spawn Time: ${spawn_time}) with ${escort_amount} supporters at [${spawn_location}]`, LogTextColor.MAGENTA, LogBackgroundColor.DEFAULT);
								boss_count = _t;
							}

							//Remove boss spawn location from other bots' spawn location
							if (spawned === true && map_configs.allow_other_bot_spawn_with_boss === false && boss_locations.includes(spawn_location))
								map_configs = this.helper.Remove_boss_loc(map_configs, spawn_location);

							if (map_configs.bosses_spawn_location_type == "evenly")
								spawned_locations.push(spawn_location);
						}
					}

					if (boss_count >= map_configs.max_boss)
						break;
					
					if (map_configs.allow_same_boss_spawn === false) {
						if (spawned) {
							spawned_bosses.push(name);
							boss_settings.splice(loop--, 1);
						}
						
						if (boss_settings.length === 0) {
							logger.error(`${map_name} has not enough boss settings to spawn ${map_configs.max_boss} bosses or Enable [allow_same_boss_spawn] to allow same bosses`);
							break;
						}
					}

					if (++loop >= boss_settings.length) {
						loop = 0;
						if (--trying === 0) break;
					}
				}

				if (spawn_index === 0 && map_configs.show_generated_bots == "all" && map_base?.BossLocationSpawn?.length === 0)
				{
					logger.log(` [x] None`, LogTextColor.MAGENTA, LogBackgroundColor.DEFAULT);
				}
				else if (modConfig?.UseDefaultSpawns?.Bosses)
				{
					logger.log(` [+]\t...Default Boss Spawns`, LogTextColor.MAGENTA, LogBackgroundColor.DEFAULT);
				}
			} else logger.error(`${map_name} has no boss settings or max boss (${map_configs.max_boss}) is zero to spawn even [has_boss] is true`);
        }
		else if (modConfig?.UsePatternSpawns?.Bosses && map_configs.show_generated_bots != "disable" && map_base?.BossLocationSpawn?.length > 0)
		{
			logger.log(`------------------------- Boss -------------------------`, LogTextColor.WHITE, LogBackgroundColor.DEFAULT);
			logger.log(` [+]\t...Default Boss Spawns`, LogTextColor.MAGENTA, LogBackgroundColor.DEFAULT);
		}
		boss_count = spawn_index;

        //PMC wave spawn
        //PMC are always set to be impossible difficulty
		spawn_index = 0;
        if (pmc_waves !== undefined && pmc_waves.wave_total > 0 && modConfig?.UsePatternSpawns?.Waves){
			if (map_configs.show_generated_bots != "disable")
				logger.log(`------------------------- PMC --------------------------`, LogTextColor.WHITE, LogBackgroundColor.DEFAULT);

			spawn_location_array = this.helper.Generate_info_array(pmc_waves.spawn_locations, (pmc_waves.spawn_location_type == "evenly")?"without_chance":"with_chance");
			if (spawn_location_array.length > 0) {
				spawn_count = 0;
				spawn_time_list = [];
				spawned_locations = [];
				let anywhere_spawn_array = [];

				if (spawn_location_array.length > 1) spawn_location_array.sort(function f(a, b){return 0.5-Math.random();});
				if (pmc_waves.spawn_scav_raider_location_chance > 0) {
					if (scav_waves && scav_waves.spawn_locations && Object.keys(scav_waves.spawn_locations).length > 0)
						anywhere_spawn_array = this.helper.Generate_info_array(scav_waves.spawn_locations,"with_chance");
					if (raider_waves && raider_waves.spawn_locations && Object.keys(raider_waves.spawn_locations).length > 0) 
						anywhere_spawn_array.push.apply(anywhere_spawn_array, this.helper.Generate_info_array(raider_waves.spawn_locations,"with_chance"));

					// Check Scav & Raider Spawn locations and Remove same locations from PMC Spawn locations
					if (anywhere_spawn_array.length > 0) {
						for (let i = 0; i < anywhere_spawn_array.length; i++) {
							for (let j = 0; j < spawn_location_array.length; j++) {
								if (anywhere_spawn_array[i] === spawn_location_array[j]) {
									anywhere_spawn_array.splice(i--, 1);
									break;
								}
							}
						}
					}

					if (anywhere_spawn_array.length > 1)
						anywhere_spawn_array.sort(function f(a, b){return 0.5-Math.random();});
				}
				difficulty_array = this.helper.Generate_info_array(pmc_waves.difficulty, "with_chance");

				for (current_wave = 0; current_wave < pmc_waves.wave_total; current_wave++) {
					//Group size
					escort_amount = randomUtil.getInt(pmc_waves.slot_min, pmc_waves.slot_max);

					if (escort_amount < 1) {
						// skips wave because zero amount of spawn
						continue;
					}

					// PMC type
					name = "assaultGroup";

					// Spawn location
					if (anywhere_spawn_array.length === 0 || randomUtil.getInt(0,99) > pmc_waves.spawn_scav_raider_location_chance) {
						// PMC Spawn Location
						switch(pmc_waves.spawn_location_type) {
							case "together":
								if (spawn_count === 0)
									spawn_location = spawn_location_array[randomUtil.getInt(0, spawn_location_array.length-1)];
							break;

							case "evenly":
								let spawn_location_array_cleaned_array = [... spawn_location_array];
								if (spawned_locations.length > 0) {
									for (let i = 0; i < spawned_locations.length; i++) {
										for (let j = 0; j < spawn_location_array_cleaned_array.length; j++) {
											if (spawn_location_array_cleaned_array[j] === spawned_locations[i])
												spawn_location_array_cleaned_array.splice(j, 1);
										}
									}
									if (spawn_location_array_cleaned_array.length === 0) {
										spawned_locations = [];
										spawn_location_array_cleaned_array = [... spawn_location_array];
									}
								}
								spawn_location = spawn_location_array_cleaned_array[randomUtil.getInt(0, spawn_location_array_cleaned_array.length-1)];
							break;

							default:
								spawn_location = spawn_location_array[randomUtil.getInt(0, spawn_location_array.length-1)];
							break;
						}
					}
					else{
						// Scav & Raider Spawn Location
						spawn_location = anywhere_spawn_array[randomUtil.getInt(0, anywhere_spawn_array.length-1)];
					}

					//Spawn Time
					rnd = (spawn_count >= pmc_waves.insta_spawn_waves) ? randomUtil.getInt(pmc_waves.spawn_time_delay_for_each_min, pmc_waves.spawn_time_delay_for_each_max) : -1; //Insta wave

					if (pmc_waves.spawn_time_delay_accumulate_for_each_zone === true) {
						if (spawn_time_list[spawn_location] === undefined)
							spawn_time_list[spawn_location] = (spawn_count >= pmc_waves.insta_spawn_waves) ? pmc_waves.spawn_time_delay_after_insta_wave : 0;

						spawn_time = spawn_time_list[spawn_location] + (rnd > 0 ? rnd : -1);
						spawn_time_list[spawn_location] += (rnd > 0 ? rnd : 0);
					} else {
						if (spawn_time_list["total_spawn_time"] === undefined)
							spawn_time_list["total_spawn_time"] = (spawn_count >= pmc_waves.insta_spawn_waves) ? pmc_waves.spawn_time_delay_after_insta_wave : 0;

						spawn_time = spawn_time_list["total_spawn_time"] + (rnd > 0 ? rnd : -1);
						spawn_time_list["total_spawn_time"] += (rnd > 0 ? rnd : 0);
					}

					if (spawn_time >= escape_time_limit || spawn_time >= map_configs.max_spawn_time) {
						if (pmc_waves.spawn_time_delay_accumulate_for_each_zone === true) {
							// Check map array to find available spawn locations or gives warning and skip
							if (Object.keys(spawn_time_list).length >= spawn_location_array.length && Object.keys(spawn_time_list).length >= anywhere_spawn_array.length) {
								let x_x = true;
								for (const [key, value] of Object.entries(spawn_time_list)) {
									if (value < escape_time_limit-pmc_waves.spawn_time_delay_for_each_min && value <= map_configs.max_spawn_time-pmc_waves.spawn_time_delay_for_each_min) {
										x_x = false;
										break;
									}
								}
								if (x_x === false) {
									spawn_time_list[spawn_location] = escape_time_limit;
									continue;
								}
							} else continue;
						}
						if (map_configs.max_spawn_time_limit_warning === true) {
							let var_name;
							let timelimit;
							if (spawn_time >= escape_time_limit) {
								var_name = "escape_time_limit";
								timelimit = escape_time_limit;
							} else {
								var_name = "max_spawn_time";
								timelimit = map_configs.max_spawn_time;
							}
							logger.warning(`${map_name} - PMC Bot has beyond [${var_name}] (${timelimit}s) wave, Skipping rest of wave generation...`);
							logger.warning(`[Info: role (${name}) | spawn_time (${spawn_time}s / ${timelimit}s) | wave (${current_wave} / ${pmc_waves.wave_total}) | used spawn time locations (${Object.keys(spawn_time_list).length} / ${spawn_location_array.length})]`);
						}
						break;
					}
					if (spawn_time < -1)
						spawn_time = -1;

					//Difficulty
					difficulty = difficulty_array[randomUtil.getInt(0, difficulty_array.length-1)].toLowerCase();

					if (databaseServer.bots.types[name.toLocaleLowerCase()].difficulty[difficulty] === undefined) {
						logger.error(`${map_name} - ${name} doesn't have "${difficulty}" difficulty, Skipping...`);
						continue;
					}

					// Adds PMC Bot Waves
					map_base = this.helper.Add_wave_type_spawn(map_base, (spawn_time === -1) ? 0 : ++wave_number, spawn_time, escort_amount, escort_amount, spawn_location, difficulty, name);
					spawn_count++;
					if (pmc_waves.spawn_location_type == "evenly")
						spawned_locations.push(spawn_location);

					if (map_configs.show_generated_bots != "disable") {
						let factionString = "USEC";
						if (botConfig.pmc.isUsec < 1)
							factionString = "BEAR";
						else if (botConfig.pmc.isUsec > 99)
							factionString = "USEC";
						else
							factionString = "USEC Chance: " + botConfig.pmc.isUsec;

						if (map_configs.show_generated_bots == "all") {
							if (spawn_time < 1)
								spawn_time = "Instant";
							else
								spawn_time += "s";

							if (escort_amount > 1) logger.log(` [${++spawn_index}] ${escort_amount} @ ${name} [${factionString}] (Spawn Time: ${spawn_time}) at [${spawn_location}]`, LogTextColor.YELLOW, LogBackgroundColor.BLUE);
							else logger.log(` [${++spawn_index}] ${name} [${factionString}] (Spawn Time: ${spawn_time}) at [${spawn_location}]`, LogTextColor.YELLOW, LogBackgroundColor.BLUE);
						}
						else {
							let numString;
							if (pmc_waves.slot_min === pmc_waves.slot_max)
								numString = pmc_waves.slot_min;
							else
								numString = `${pmc_waves.slot_min}-${pmc_waves.slot_max}`;

							logger.log(` [${++spawn_index}] ${numString} @ PMC [${factionString}]`, LogTextColor.YELLOW, LogBackgroundColor.BLUE);
						}
					}
				}
            }
			else {
				logger.error(`${map_name} - PMC bot doesn't have any "spawn_locations" to use, Skipping...`);
				logger.error(`${map_name} - ( Maybe you set "allow_other_bot_spawn_with_boss" to false? )`);
			}
        }

        // Scav wave spawn
        // Map will have x scav waves spawned at start, the rest of scav waves will spawn starting from 5 min with random location and time
        if (scav_waves !== undefined && scav_waves.wave_total > 0 && modConfig?.UsePatternSpawns?.Waves){
			if (map_configs.show_generated_bots != "disable")
				logger.log(`------------------------- Scav -------------------------`, LogTextColor.WHITE, LogBackgroundColor.DEFAULT);

			spawn_location_array = this.helper.Generate_info_array(scav_waves.spawn_locations, (scav_waves.spawn_location_type == "evenly")?"without_chance":"with_chance");
			if (spawn_location_array.length > 0) {
				spawn_count = 0;
				spawn_time_list = [];
				spawned_locations = [];

				spawn_location_array = this.helper.Generate_info_array(scav_waves.spawn_locations, (scav_waves.spawn_location_type == "evenly")?"without_chance":"with_chance");
				if (spawn_location_array.length > 1) spawn_location_array.sort(function f(a, b){return 0.5-Math.random();});
				difficulty_array = this.helper.Generate_info_array(scav_waves.difficulty, "with_chance");

				for (current_wave = 0; current_wave < scav_waves.wave_total; current_wave++) {
					// Wave Amount
					escort_amount = randomUtil.getInt(scav_waves.slot_min, scav_waves.slot_max);
					if (escort_amount < 1) {
						// skips wave because zero amount of spawn
						continue;
					}

					//Spawn location
					switch(scav_waves.spawn_location_type) {
						case "together":
							if (spawn_count === 0)
								spawn_location = spawn_location_array[randomUtil.getInt(0, spawn_location_array.length-1)];
						break;

						case "evenly":
							let spawn_location_array_cleaned_array = [... spawn_location_array];
							if (spawned_locations.length > 0) {
								for (let i = 0; i < spawned_locations.length; i++) {
									for (let j = 0; j < spawn_location_array_cleaned_array.length; j++) {
										if (spawn_location_array_cleaned_array[j] === spawned_locations[i])
											spawn_location_array_cleaned_array.splice(j, 1);
									}
								}
								if (spawn_location_array_cleaned_array.length === 0) {
									spawned_locations = [];
									spawn_location_array_cleaned_array = [... spawn_location_array];
								}
							}
							spawn_location = spawn_location_array_cleaned_array[randomUtil.getInt(0, spawn_location_array_cleaned_array.length-1)];
						break;

						default:
							spawn_location = spawn_location_array[randomUtil.getInt(0, spawn_location_array.length-1)];
						break;
					}
					
					//Spawn Time
					rnd = (spawn_count >= scav_waves.insta_spawn_waves) ? randomUtil.getInt(scav_waves.spawn_time_delay_for_each_min, scav_waves.spawn_time_delay_for_each_max) : -1; //Insta wave

					if (scav_waves.spawn_time_delay_accumulate_for_each_zone === true) {
						if (spawn_time_list[spawn_location] === undefined)
							spawn_time_list[spawn_location] = (spawn_count >= scav_waves.insta_spawn_waves) ? scav_waves.spawn_time_delay_after_insta_wave : 0;
						
						spawn_time = spawn_time_list[spawn_location] + (rnd > 0 ? rnd : -1);
						spawn_time_list[spawn_location] += (rnd > 0 ? rnd : 0);
					} else {
						if (spawn_time_list["total_spawn_time"] === undefined)
							spawn_time_list["total_spawn_time"] = (spawn_count >= scav_waves.insta_spawn_waves) ? scav_waves.spawn_time_delay_after_insta_wave : 0;

						spawn_time = spawn_time_list["total_spawn_time"] + (rnd > 0 ? rnd : -1);
						spawn_time_list["total_spawn_time"] += (rnd > 0 ? rnd : 0);
					}

					if (spawn_time >= escape_time_limit || spawn_time >= map_configs.max_spawn_time) {
						if (scav_waves.spawn_time_delay_accumulate_for_each_zone === true) {
							if (Object.keys(spawn_time_list).length >= spawn_location_array.length) {
								let x_x = true;
								for (const [key, value] of Object.entries(spawn_time_list)) {
									if (value < escape_time_limit-scav_waves.spawn_time_delay_for_each_min && value <= map_configs.max_spawn_time-scav_waves.spawn_time_delay_for_each_min) {
										x_x = false;
										break;
									}
								}
								if (x_x === false) {
									spawn_time_list[spawn_location] = escape_time_limit;
									continue;
								}
							} else continue;
						}

						if (map_configs.max_spawn_time_limit_warning === true) {
							let var_name;
							let timelimit;
							if (spawn_time >= escape_time_limit) {
								var_name = "escape_time_limit";
								timelimit = escape_time_limit;
							} else {
								var_name = "max_spawn_time";
								timelimit = map_configs.max_spawn_time;
							}
							logger.warning(`${map_name} - Scav has beyond [${var_name}] (${timelimit}s) wave, Skipping rest of wave generation...`);
							logger.warning(`[Info: spawn_time (${spawn_time}s / ${timelimit}s) | wave (${current_wave} / ${scav_waves.wave_total}) | used spawn time locations (${Object.keys(spawn_time_list).length} / ${spawn_location_array.length})]`);
						}
						break;
					}
					if (spawn_time < -1)
						spawn_time = -1;

					//Difficulty
					difficulty = difficulty_array[randomUtil.getInt(0, difficulty_array.length-1)].toLowerCase();

					if (databaseServer.bots.types["assault"].difficulty[difficulty] === undefined) {
						logger.error(`${map_name} - Scav doesn't have "${difficulty}" difficulty, Skipping...`);
						continue;
					}

					//Call wave type spawn function
					map_base = this.helper.Add_wave_type_spawn(map_base, (spawn_time === -1) ? 0 : ++wave_number, spawn_time, escort_amount, escort_amount, spawn_location, difficulty, "assault");

					spawn_count++;
					if (scav_waves.spawn_location_type == "evenly")
						spawned_locations.push(spawn_location);

					if (map_configs.show_generated_bots == "all")
					{
						if (spawn_time < 1)
							spawn_time = "Instant";
						else
							spawn_time += "s";

						logger.log(` [${++spawn_index}] ${escort_amount} @ Scav (Spawn Time: ${spawn_time}) at [${spawn_location}]`, LogTextColor.WHITE, LogBackgroundColor.DEFAULT);
					}
					else if (map_configs.show_generated_bots == "secret") {
						let numString;
						if (scav_waves.slot_min === scav_waves.slot_max)
							numString = scav_waves.slot_min;
						else
							numString = `${scav_waves.slot_min}-${scav_waves.slot_max}`;

						logger.log(` [${++spawn_index}] ${numString} @ Scav`, LogTextColor.WHITE, LogBackgroundColor.DEFAULT);
					}
				}
				current_wave -= (spawn_count >= scav_waves.insta_spawn_waves) ? scav_waves.insta_spawn_waves : spawn_count;
			}
			else {
				logger.error(`${map_name} - Scav doesn't have any "spawn_locations" to use, Skipping...`);
				logger.error(`${map_name} - ( Maybe you set "allow_other_bot_spawn_with_boss" to false? )`);
			}
        }

        //Sniper wave spawn
        //Sniper waves all spawn at start of raid at different locations. Sniper wave will have maximum of 1 scav.
        //This is basically the same as scav wave spawn. Just separating them in case I want to modify sniper scavs in future
        if (sniper_waves !== undefined && sniper_waves.wave_total > 0 && modConfig?.UsePatternSpawns?.Waves){
			if (map_configs.show_generated_bots != "disable")
				logger.log(`---------------------- Sniper Scav ---------------------`, LogTextColor.WHITE, LogBackgroundColor.DEFAULT);

			spawn_location_array = this.helper.Generate_info_array(sniper_waves.spawn_locations, (sniper_waves.spawn_location_type == "evenly")?"without_chance":"with_chance");
			if (spawn_location_array.length > 0) {
				spawn_count = 0;
				spawn_time_list = [];
				spawned_locations = [];

				difficulty_array = this.helper.Generate_info_array(sniper_waves.difficulty, "with_chance");
				if (spawn_location_array.length > 1) spawn_location_array.sort(function f(a, b){return 0.5-Math.random();});

				//current_wave will continue to count after save waves spawns, since they use the same type of function to spawn.
				for (current_wave = 0; current_wave < sniper_waves.wave_total; current_wave++){
					// Wave Amount
					escort_amount = randomUtil.getInt(sniper_waves.slot_min, sniper_waves.slot_max);
					if (escort_amount < 1) {
						// skips wave because zero amount of spawn
						continue;
					}

					//Spawn location
					switch(sniper_waves.spawn_location_type) {
						case "together":
							if (spawn_count === 0)
								spawn_location = spawn_location_array[randomUtil.getInt(0, spawn_location_array.length-1)];
						break;

						case "evenly":
							let spawn_location_array_cleaned_array = [... spawn_location_array];
							if (spawned_locations.length > 0) {
								for (let i = 0; i < spawned_locations.length; i++) {
									for (let j = 0; j < spawn_location_array_cleaned_array.length; j++) {
										if (spawn_location_array_cleaned_array[j] === spawned_locations[i])
											spawn_location_array_cleaned_array.splice(j, 1);
									}
								}
								if (spawn_location_array_cleaned_array.length === 0) {
									spawned_locations = [];
									spawn_location_array_cleaned_array = [... spawn_location_array];
								}
							}
							spawn_location = spawn_location_array_cleaned_array[randomUtil.getInt(0, spawn_location_array_cleaned_array.length-1)];
						break;

						default:
							spawn_location = spawn_location_array[randomUtil.getInt(0, spawn_location_array.length-1)];
						break;
					}
					
					//Spawn Time
					rnd = (spawn_count >= sniper_waves.insta_spawn_waves) ? randomUtil.getInt(sniper_waves.spawn_time_delay_for_each_min, sniper_waves.spawn_time_delay_for_each_max) : -1; //Insta wave

					if (sniper_waves.spawn_time_delay_accumulate_for_each_zone === true) {
						if (spawn_time_list[spawn_location] === undefined)
							spawn_time_list[spawn_location] = (spawn_count >= sniper_waves.insta_spawn_waves) ? sniper_waves.spawn_time_delay_after_insta_wave : 0;
						
						spawn_time = spawn_time_list[spawn_location] + (rnd > 0 ? rnd : -1);
						spawn_time_list[spawn_location] += (rnd > 0 ? rnd : 0);
					} else {
						if (spawn_time_list["total_spawn_time"] === undefined)
							spawn_time_list["total_spawn_time"] = (spawn_count >= sniper_waves.insta_spawn_waves) ? sniper_waves.spawn_time_delay_after_insta_wave : 0;

						spawn_time = spawn_time_list["total_spawn_time"] + (rnd > 0 ? rnd : -1);
						spawn_time_list["total_spawn_time"] += (rnd > 0 ? rnd : 0);
					}
					
					if (spawn_time >= escape_time_limit || spawn_time >= map_configs.max_spawn_time) {
						if (sniper_waves.spawn_time_delay_accumulate_for_each_zone === true) {
							if (Object.keys(spawn_time_list).length >= spawn_location_array.length) {
								let x_x = true;
								for (const [key, value] of Object.entries(spawn_time_list)) {
									if (value < escape_time_limit-sniper_waves.spawn_time_delay_for_each_min && value <= map_configs.max_spawn_time-sniper_waves.spawn_time_delay_for_each_min) {
										x_x = false;
										break;
									}
								}
								if (x_x === false) {
									spawn_time_list[spawn_location] = escape_time_limit;
									continue;
								}
							} else continue;
						}

						if (map_configs.max_spawn_time_limit_warning === true) {
							let var_name;
							let timelimit;
							if (spawn_time >= escape_time_limit) {
								var_name = "escape_time_limit";
								timelimit = escape_time_limit;
							} else {
								var_name = "max_spawn_time";
								timelimit = map_configs.max_spawn_time;
							}
							logger.warning(`${map_name} - Sniper Scav has beyond [${var_name}] (${timelimit}s) wave, Skipping rest of wave generation...`);
							logger.warning(`[Info: spawn_time (${spawn_time}s / ${timelimit}s) | wave (${current_wave} / ${sniper_waves.wave_total}) | used spawn time locations (${Object.keys(spawn_time_list).length} / ${spawn_location_array.length})]`);
						}
						break;
					}
					if (spawn_time < -1)
						spawn_time = -1;
		
					//Difficulty
					difficulty = difficulty_array[randomUtil.getInt(0, difficulty_array.length-1)].toLowerCase();

					if (databaseServer.bots.types["marksman"].difficulty[difficulty] === undefined) {
						logger.error(`${map_name} - Sniper Scav doesn't have "${difficulty}" difficulty, Skipping...`);
						continue;
					}

					//Call wave type spawn function
					map_base = this.helper.Add_wave_type_spawn(map_base, (spawn_time === -1) ? 0 : ++wave_number, spawn_time, escort_amount, escort_amount, spawn_location, difficulty, "marksman");

					spawn_count++;
					if (sniper_waves.spawn_location_type == "evenly")
						spawned_locations.push(spawn_location);

					if (map_configs.show_generated_bots == "all")
					{
						if (spawn_time < 1)
							spawn_time = "Instant";
						else
							spawn_time += "s";

						logger.log(` [${++spawn_index}] ${escort_amount} @ Sniper Scav (Spawn Time: ${spawn_time}) at [${spawn_location}]`, LogTextColor.WHITE, LogBackgroundColor.DEFAULT);
					}
					else if (map_configs.show_generated_bots == "secret") {
						let numString;
						if (sniper_waves.slot_min === sniper_waves.slot_max)
							numString = sniper_waves.slot_min;
						else
							numString = `${sniper_waves.slot_min}-${sniper_waves.slot_max}`;

						logger.log(` [${++spawn_index}] ${numString} @ Sniper Scav`, LogTextColor.WHITE, LogBackgroundColor.DEFAULT);
					}
				}
				current_wave -= (spawn_count >= sniper_waves.insta_spawn_waves) ? sniper_waves.insta_spawn_waves : spawn_count;
			}
			else {
				logger.error(`${map_name} - Scav doesn't have any "spawn_locations" to use, Skipping...`);
				logger.error(`${map_name} - ( Maybe you set "allow_other_bot_spawn_with_boss" to false? )`);
			}
        }

        // Raider wave spawn
        // Raider only spawn at certain type zones(most contested zones). Raider spawn as followerGluharAssault(very agressive raider type).
        if (raider_waves !== undefined && raider_waves.wave_total > 0 && modConfig?.UsePatternSpawns?.Waves){
			if (map_configs.show_generated_bots != "disable")
				logger.log(`------------------------ Raider ------------------------`, LogTextColor.WHITE, LogBackgroundColor.DEFAULT);

			spawn_location_array = this.helper.Generate_info_array(raider_waves.spawn_locations, (raider_waves.spawn_location_type == "evenly")?"without_chance":"with_chance");
			if (spawn_location_array.length > 0) {
				spawn_count = 0;
				spawn_time_list = [];
				spawned_locations = [];

				difficulty_array = this.helper.Generate_info_array(raider_waves.difficulty,"with_chance");
				if (spawn_location_array.length > 1) spawn_location_array.sort(function f(a, b){return 0.5-Math.random();});

				for (current_wave = 0; current_wave < raider_waves.wave_total; current_wave++){
					// Wave Amount
					escort_amount = randomUtil.getInt(raider_waves.slot_min, raider_waves.slot_max);
					if (escort_amount < 1) {
						// skips wave because zero amount of spawn
						continue;
					}

					let role = raider_waves.raider_default_role;
					if (raider_waves.raider_high_role === true && randomUtil.getInt(0, 99) < raider_waves.raider_high_role_chance) {
						if (raider_waves.raider_high_role_list === undefined || raider_waves.raider_high_role_list === null || raider_waves.raider_high_role_list.length < 6) 
							logger.error(`${map_name} - Raider has no high role list (${raider_waves.raider_high_role_list}), set to default "${role}"...`);
						else {
							if (raider_waves.raider_high_role_list.includes(",")) {
								let arr = [... raider_waves.raider_high_role_list.split(",").map((item)=>item.trim())];
								for (let i = arr.length-1; i >= 0; i--) {
									if (databaseServer.bots.types[arr[i].toLowerCase()] === undefined) {
										logger.error(`${map_name} - Raider has bad role (${arr[i]}), Removed...`);
										arr.splice(i, 1);
									}
								}
								if (arr.length === 1) role = arr[0];
								else if (arr.length > 1) role = arr[randomUtil.getInt(0, arr.length-1)];

								if (role === undefined || databaseServer.bots.types[role.toLowerCase()] === undefined) {
									logger.error(`${map_name} - Raider has bad high role list (${raider_waves.raider_high_role_list}), set to default "${raider_waves.raider_default_role}"...`);
									role = raider_waves.raider_default_role;
								}
							} else role = raider_waves.raider_high_role_list;
						}
					}

					//Spawn location
					switch(raider_waves.spawn_location_type) {
						case "together":
							if (spawn_count === 0)
								spawn_location = spawn_location_array[randomUtil.getInt(0, spawn_location_array.length-1)];
						break;

						case "evenly":
							let spawn_location_array_cleaned_array = [... spawn_location_array];
							if (spawned_locations.length > 0) {
								for (let i = 0; i < spawned_locations.length; i++) {
									for (let j = 0; j < spawn_location_array_cleaned_array.length; j++) {
										if (spawn_location_array_cleaned_array[j] === spawned_locations[i])
											spawn_location_array_cleaned_array.splice(j, 1);
									}
								}
								if (spawn_location_array_cleaned_array.length === 0) {
									spawned_locations = [];
									spawn_location_array_cleaned_array = [... spawn_location_array];
								}
							}
							spawn_location = spawn_location_array_cleaned_array[randomUtil.getInt(0, spawn_location_array_cleaned_array.length-1)];
						break;

						default:
							spawn_location = spawn_location_array[randomUtil.getInt(0, spawn_location_array.length-1)];
						break;
					}
					
					//Spawn Time
					rnd = (spawn_count >= raider_waves.insta_spawn_waves) ? randomUtil.getInt(raider_waves.spawn_time_delay_for_each_min, raider_waves.spawn_time_delay_for_each_max) : -1; //Insta wave

					if (raider_waves.spawn_time_delay_accumulate_for_each_zone === true) {
						if (spawn_time_list[spawn_location] === undefined)
							spawn_time_list[spawn_location] = (spawn_count >= raider_waves.insta_spawn_waves) ? raider_waves.spawn_time_delay_after_insta_wave : 0;
						
						spawn_time = spawn_time_list[spawn_location] + (rnd > 0 ? rnd : -1);
						spawn_time_list[spawn_location] += (rnd > 0 ? rnd : 0);
					} else {
						if (spawn_time_list["total_spawn_time"] === undefined)
							spawn_time_list["total_spawn_time"] = (spawn_count >= raider_waves.insta_spawn_waves) ? raider_waves.spawn_time_delay_after_insta_wave : 0;

						spawn_time = spawn_time_list["total_spawn_time"] + (rnd > 0 ? rnd : -1);
						spawn_time_list["total_spawn_time"] += (rnd > 0 ? rnd : 0);
					}

					if (spawn_time >= escape_time_limit || spawn_time >= map_configs.max_spawn_time) {
						if (raider_waves.spawn_time_delay_accumulate_for_each_zone === true) {
							if (Object.keys(spawn_time_list).length >= spawn_location_array.length) {
								let x_x = true;
								for (const [key, value] of Object.entries(spawn_time_list)) {
									if (value < escape_time_limit-raider_waves.spawn_time_delay_for_each_min && value <= map_configs.max_spawn_time-raider_waves.spawn_time_delay_for_each_min) {
										x_x = false;
										break;
									}
								}
								if (x_x === false) {
									spawn_time_list[spawn_location] = escape_time_limit;
									continue;
								}
							} else continue;
						}
						if (map_configs.max_spawn_time_limit_warning === true) {
							let var_name;
							let timelimit;
							if (spawn_time >= escape_time_limit) {
								var_name = "escape_time_limit";
								timelimit = escape_time_limit;
							} else {
								var_name = "max_spawn_time";
								timelimit = map_configs.max_spawn_time;
							}
							logger.warning(`${map_name} - Raider has beyond [${var_name}] (${timelimit}s) wave, Skipping rest of wave generation...`);
							logger.warning(`[Info: role (${role}) | spawn_time (${spawn_time}s / ${timelimit}s) | wave (${current_wave} / ${raider_waves.wave_total}) | used spawn time locations (${Object.keys(spawn_time_list).length} / ${spawn_location_array.length})]`);
						}
						break;
					}

					if (spawn_time < -1)
						spawn_time = -1;

					//Difficulty
					difficulty = difficulty_array[randomUtil.getInt(0, difficulty_array.length-1)].toLowerCase();

					if (databaseServer.bots.types[role.toLowerCase()].difficulty[difficulty] === undefined) {
						logger.error(`${map_name} - Raider (${role}) doesn't have "${difficulty}" difficulty, Skipping...`);
						continue;
					}

					//Call wave type spawn function
					map_base = this.helper.Add_wave_type_spawn(map_base, (spawn_time === -1) ? 0 : ++wave_number, spawn_time, escort_amount, escort_amount, spawn_location, difficulty, role);

					spawn_count++;
					if (raider_waves.spawn_location_type == "evenly")
						spawned_locations.push(spawn_location);

					if (map_configs.show_generated_bots == "all")
					{
						if (spawn_time < 1)
							spawn_time = "Instant";
						else
							spawn_time += "s";

						logger.log(` [${++spawn_index}] ${escort_amount} @ ${role} (Spawn Time: ${spawn_time}) at [${spawn_location}]`, LogTextColor.WHITE, LogBackgroundColor.MAGENTA);
					}
					else if (map_configs.show_generated_bots == "secret") {
						let numString;
						if (raider_waves.slot_min === raider_waves.slot_max)
							numString = raider_waves.slot_min;
						else
							numString = `${raider_waves.slot_min}-${raider_waves.slot_max}`;

						logger.log(` [${++spawn_index}] ${raider_waves.slot_min}-${raider_waves.slot_max} @ ${role}`, LogTextColor.WHITE, LogBackgroundColor.MAGENTA);
					}
				}
				current_wave -= (spawn_count >= raider_waves.insta_spawn_waves) ? raider_waves.insta_spawn_waves : spawn_count;
			}
			else {
				logger.error(`${map_name} - Raider doesn't have any "spawn_locations" to use, Skipping...`);
				logger.error(`${map_name} - ( Maybe you set "allow_other_bot_spawn_with_boss" to false? )`);
			}
        }

        //Triggered raider waves
		let trigger_spawn_index = 0;
		let hasTriggeredWave = false;
		if (modConfig?.UseDefaultSpawns?.TriggeredWaves)
		{
			for (let i = 0; i < map_base.BossLocationSpawn.length; i++)
			{
				const bossWave = map_base.BossLocationSpawn[i];

				// Triggered wave check
				if (bossWave?.TriggerName?.length > 0)
				{
					hasTriggeredWave = true;
					break;
				}
			}
		}

		if (triggered_waves !== undefined && triggered_waves.length > 0 && modConfig?.UsePatternSpawns?.TriggeredWaves){
			if (map_configs.show_generated_bots == "all")
				logger.log(`------------------- Triggered Waves -------------------`, LogTextColor.WHITE, LogBackgroundColor.DEFAULT);

            for (let wave of triggered_waves){
                //Group size
                escort_amount = randomUtil.getInt(wave.slot_min, wave.slot_max)-1;

				// Checks Escort amount has under -1 (because this has boss_type_sapwn)
				if (escort_amount < 0) {
					// skips wave because zero amount of spawn
					continue;
				}

				if (wave.time < -1)
					wave.time = -1;

                //Spawn chance
                if (randomUtil.getInt(0, 99) < wave.chance)
                    chance = 100;
                else
                    continue;
				
				if (databaseServer.bots.types[wave.raider_type.toLowerCase()] === undefined) {
					logger.error(`${map_name} - Triggered Wave has bad type settings ${wave.raider_type}, Skipping...`);
					continue;
				}

				if (databaseServer.bots.types[wave.raider_type.toLowerCase()].difficulty[wave.difficulty.toLowerCase()] === undefined) {
					logger.error(`${map_name} - Triggered Wave doesn't have "${wave.raider_type}" difficulty, Skipping...`);
					continue;
				}
				const random_time_spawn = wave?.random_time_spawn || false;
                map_base = this.helper.Add_trigger_type_spawn(map_base, wave.raider_type, chance, wave.spawn_location, wave.difficulty, wave.raider_type, wave.difficulty, escort_amount, wave.time, wave.trigger_id, wave.trigger_name, wave.supports, random_time_spawn);
				trigger_spawn_index++;

				if (map_configs.show_generated_bots == "all")
				{
					if (wave.time < 1)
						wave.time = "Instant";
					else
						wave.time += "s";

					logger.log(` [${trigger_spawn_index}] ${escort_amount+1} @ ${wave.raider_type} (Spawn Time: ${wave.time}${random_time_spawn ? " + Random Time" : ""}) at [${wave.spawn_location}] by "${wave.trigger_id}"`, LogTextColor.YELLOW, LogBackgroundColor.DEFAULT);
				}
            }
			if (map_configs.show_generated_bots == "all" && hasTriggeredWave) logger.log(` [+]\t...Default Triggered Waves`, LogTextColor.YELLOW, LogBackgroundColor.DEFAULT);
        }
		else if (map_configs.show_generated_bots == "all" && hasTriggeredWave)
		{
			logger.log(`------------------- Triggered Waves -------------------`, LogTextColor.YELLOW, LogBackgroundColor.DEFAULT);
			logger.log(` [+]\t...Default Triggered Waves`, LogTextColor.YELLOW, LogBackgroundColor.DEFAULT);
		}

		if (map_configs.show_generated_bots != "all") boss_count = 0;
		logger.log(`\t${map_name} @ Bots Generated / Total ${spawn_index+boss_count} Waves${modConfig?.UseDefaultSpawns?.Waves ? " + Default Waves Spawn" : ""}`, LogTextColor.GREEN, LogBackgroundColor.DEFAULT);
        return map_base;
    }
}