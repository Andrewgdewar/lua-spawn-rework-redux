*** THIS ReadMe.txt FILE IS OUTDATED FOR v2.0.0, JUST USE IT AS REFERENCE ***
*** THIS ReadMe.txt FILE IS OUTDATED FOR v2.0.0, JUST USE IT AS REFERENCE ***
*** THIS ReadMe.txt FILE IS OUTDATED FOR v2.0.0, JUST USE IT AS REFERENCE ***
*** THIS ReadMe.txt FILE IS OUTDATED FOR v2.0.0, JUST USE IT AS REFERENCE ***
*** THIS ReadMe.txt FILE IS OUTDATED FOR v2.0.0, JUST USE IT AS REFERENCE ***
*** THIS ReadMe.txt FILE IS OUTDATED FOR v2.0.0, JUST USE IT AS REFERENCE ***
*** THIS ReadMe.txt FILE IS OUTDATED FOR v2.0.0, JUST USE IT AS REFERENCE ***
*** THIS ReadMe.txt FILE IS OUTDATED FOR v2.0.0, JUST USE IT AS REFERENCE ***






INFO (Tarkov v12.12.30)
===============================
BOSS:				bossBully, bossGluhar, bossKilla, bossKojaniy, bossSanitar, bossTagilla, sectantPriest, bossKnight
BOSS ESCORT:		followerBully, followerKojaniy, followerSanitar, followerGluharSnipe, followerGluharAssault, followerGluharScout, followerGluharSecurity, sectantWarrior, followerBirdEye, followerBigPipe
SCAV:				assault
RAIDER:				pmcBot, exUsec
PMC BOT:			assaultGroup, cursedAssault (*Not recommend to use as Boss escort/supporter, They will attacking boss and bosses ignore them until death)
EVENT AI:           gifter
===============================

{
    "spawns":{
		"max_alive_bots": 35,
			(Game Default: 20~30)
			(Description: Change Ai's Max alive bots on map count, more performance by reducing it)


		"pmc_usec_chance": 50,
				(Game default: 50)
				(Description: PMC Bot USEC spawn chance)


		"pmc_behavior_role": "pmcBot",
				(Mod Default: "pmcBot")
				(Description: Copy bot's behavior and apply on PMC Bot)


        "customs":{
            "map_rules": "AvoidAllPmc",
				(Values: Normal, AvoidAllPmc, AvoidOwnPmc | Custom's default: AvoidAllPmc)
​				(Description: This is not used variable for now, apply on maps MapRules)
					(Normal: Scavs and opposite PMC hostile to you)
					(AvoidOwnPMC: Scavs and your PMC side hostile to you)
					(AvoidAllPMC: Scavs and all PMC hostile to you)

            "show_generated_bots":"secret",
				(Values: disable, all, secret)
				(Description: Print bot generating logs on server console)
					(all: Showing everything, exact spawn values with Group Size, Spawn time, Location, Supporters, Trigger Raider Waves with Trigger ID)
					(secret: Showing secretly, without Spawn time, Location, Trigger Raider Waves, Cultists/Bosses and Min-Max Values unless Min-Max is Same)

			"max_spawn_time": 1000,
				(Values: Seconds)
				(Recommend: Your average play/escape time)
				(Description: Maximum wave spawn time for mod to reduce total wave numbers, Recommend to set this for your average play/escape time to optimization fps)

            "max_spawn_time_limit_warning":false,
				(Description: Print warning logs on server console when wave_spawn_time is beyond map's escape_time_limit or [max_spawn_time], so you can notice the problem and edit wave configs)


            "max_bot_per_zone": 10,
				(Recommend: 8~15, Depend on your computer specs)
				(Description: Adjust the value if you want more performance or Increase to hell *NOT TESTED*)


            "allow_other_bot_spawn_with_boss":false,
				(Description: Allow other bots (except triggered_raider_waves) to use spawn location where boss generated)
				(Description: Set true for small maps like factory or Wants to spawn bots on wide locations)
				(Description: [bosses_also_use_scavs_spawn_locations] Or [bosses_also_use_raiders_spawn_locations] are not effected by this config)


            "has_boss":true,
				(Description: You want some boss?)


            "bosses_spawn_location_type":"evenly",
				(Values: random, together, evenly)
				(Description: random	= Pure random, possible for spawn multiple bosses at one location)
				(Description: together	= All bosses spawns at one location)
				(Description: evenly	= Spawn bosses at all locations evenly, If spawn locations are not enough to spawn bosses it will rotate map cycle again therefore it could be spawn same location)


            "max_boss":1,
				(Description: Maximum numbers of boss types, currently there are only 6+1 (Cultists) boss types in game)
			

            "boss_spawn_trying_loop":1,
				(Description: How many trying to spawn bosses by chance, 0 = Keep spawn bosses until reach the [max_boss] value)


            "allow_same_boss_spawn":false,
				(Description: Allow to spawn same type of boss, If multiple of same boss type has configured on "boss_settings", It still can spawn same type of boss)


            "bosses_also_use_scavs_spawn_locations":false,
            "bosses_also_use_raiders_spawn_locations":true,
				(Description: Allow to use scav/raider's [spawn_locations] for boss spawn)


			"cultists_spawn_count_for_max_boss": false,
				(Description: Allow to count for [max_boss] when cultists spawned, WARNING: Cultists are not spawning at day time even waves generated, therefore recommend to set false or increase [max_boss] value)


			"cultists_spawn_at_own_locations": true,
				(Description: Allow to use own [spawn_locations] for cultists because cultists are meant to do hiding on specific locations, This also ignore [bosses_spawn_location_type] and [bosses_also_use_*_spawn_locations])


            "boss_settings":[
                {
                    "name":"bossBully",						: Boss Type, Also possible to use multiple of name to be random like "bossBully, bossGluhar, bossTagilla" (If multiple of name has been set, This boss's spawn queue will try last)
                    "chance":100,							: Spawn Chance
                    "difficulty":"normal",					: Difficulty (Bosses all have same difficulty, normal == impossible), Also possible to use multiple of difficulty to be random like "normal, hard, impossible"
                    "escort_type":"followerBully",			: Escort Bots Type, Also possible to use multiple of name to be random like "followerGluharAssault, pmcBot, followerBully" (If "supports" are configured, this config has no effect)
                    "escort_difficulty":"normal",			: Escort Bots Difficulty, Also possible to use multiple of difficulty to be random like "easy, normal, hard" (If "supports" are configured, this config has no effect)
                    "escort_amount_min":4,					: Escort Bots Minimum Amount (If "supports" are configured, this config has no effect)
                    "escort_amount_max":4,					: Escort Bots Maximum Amount, 0 for none spawn (If "supports" are configured, this config has no effect)
                    "wave_total":1,							: Total Wave Count, 0 for none spawn
                    "wave_spawn_time_for_each_min":600,		: Spawn Time Min/Max, Uses after first wave
                    "wave_spawn_time_for_each_max":900,
                    "wave_spawn_all_same_location":false,	: All waves spawn at where first wave spawned location
                    "spawn_locations":{						: Spawn Locations, Numbers are chance
                        "ZoneScavBase":1,
                        "ZoneGasStation":1,
                        "ZoneDormitory":1
                    },
					"trigger_id":"",						: Map Trigger ID, Set this If you want to spawn like triggered_raider_waves
					"trigger_name":"",
					"supports":null
                },
                {
                    "name":"bossGluhar",
                    "chance":30,
                    "difficulty":"normal",
                    "escort_type":"followerGluharAssault",
                    "escort_difficulty":"normal",
                    "wave_total":1,
                    "wave_spawn_time_for_each_min":600,
                    "wave_spawn_time_for_each_max":900,
                    "wave_spawn_all_same_location":false,
                    "spawn_locations":{
                        "ZoneScavBase":1,
                        "ZoneGasStation":1,
                        "ZoneDormitory":1
                    },
                    "trigger_id":"",
                    "trigger_name":"",
                    "supports":[										: Supporters, Gluhar has multiple supporters to spawn. Other bosses escorts are spawn without these setting
																		  Also boss with "supports" will bypass escort_* configs
																		  Use this configs If you want multiple type of followers
                        {
                            "BossEscortType":"followerGluharAssault",	: Support Type, Also possible to use multiple of name to be random like "followerGluharAssault, pmcBot, followerBully"
                            "BossEscortDifficult":[
                                "normal"								: Supporter Difficulty, Also possible to use multiple of difficulty to be random like "easy, hard, impossible"
                            ],
                            "BossEscortAmount_min":1,					: Supporter Bots Minimum Amount
                            "BossEscortAmount_max":2					: Supporter Bots Maximum Amount, 0 for none spawn
                        },
                        {
                            "BossEscortType":"followerGluharSecurity",
                            "BossEscortDifficult":[
                                "normal"
                            ],
                            "BossEscortAmount_min":1,
                            "BossEscortAmount_max":2
                        },
                        {
                            "BossEscortType":"followerGluharScout",
                            "BossEscortDifficult":[
                                "normal"
                            ],
                            "BossEscortAmount_min":1,
                            "BossEscortAmount_max":2
                        }
                    ]
                },
				{
					"name":"sectantPriest",						: Cultists Boss Type
					"chance":20,								: Spawn Chance, WARNING: Cultists are only spawned at specific time (22:00 ~ 06:00) even 100% chance, (Default = Custom: 20, Woods/Shoreline: 28)
					"difficulty":"normal",
					"escort_type":"sectantWarrior",				: Cultists Follower Type
					"escort_difficulty":"normal",
					"escort_amount_min":1,						: Cultists Follower Minimum Amount (Default = Custom: 3, Woods/Shoreline: 5)
					"escort_amount_max":3,						: Cultists Follower Maximum Amount (Default = Custom: 3, Woods/Shoreline: 5)
					"wave_total":1,
					"wave_spawn_time_for_each_min":900,
					"wave_spawn_time_for_each_max":1200,
					"wave_spawn_all_same_location":false,
					"spawn_locations":{
						"ZoneDormitory":1						: Recommend to use game's default [spawn_locations] for cultists
					},
					"trigger_id":"",
					"trigger_name":"",
					"supports":null
				},
				{
					"name":"bossBully, bossGluhar, bossKilla, bossKojaniy, bossSanitar, bossTagilla",		: Random Boss Type, It will pick random one (If [allow_same_boss_spawn] is false and name is all filled than it will skip)
																											  (If multiple of name has been set, This boss's spawn queue will try last)
					"chance":20,
					"difficulty":"normal, hard, impossible",												: Random Difficulty, It will pick random one from list
					"wave_total":1,
					"wave_spawn_time_for_each_min":900,
					"wave_spawn_time_for_each_max":1200,
					"wave_spawn_all_same_location":false,
					"spawn_locations":{
						"ZoneScavBase":1,
						"ZoneGasStation":1,
						"ZoneDormitory":1
					},
					"trigger_id":"",
					"trigger_name":"",
					"supports":[
						{
							"BossEscortType":"pmcBot, assault",												: You should notice by now, How it works
							"BossEscortDifficult":[
								"normal, hard"
							],
							"BossEscortAmount_min":1,
							"BossEscortAmount_max":2
						},
						{
							"BossEscortType":"sectantPriest, followerBully, followerKojaniy, followerSanitar, followerGluharSnipe, followerGluharAssault, followerGluharScout, followerGluharSecurity",
							"BossEscortDifficult":[
								"normal, hard"
							],
							"BossEscortAmount_min":1,
							"BossEscortAmount_max":2
						}
					]
				}
            ],
            "wave_settings":{
                "scav_waves":{
                    "wave_total":6,								: Total/Maximum Waves to have, This also includes [insta_spawn_waves], In this case "6 Normal Waves" and "2 Instant Waves"
                    "slot_min":1,								: Minimum Number of Spawn for each wave
                    "slot_max":4,								: Maximum Number of Spawn for each wave, It also means size of group
                    "insta_spawn_waves":2,						: Instant Spawn Wave, This number of waves will spawn without spawn time delay when map started
                    "spawn_time_delay_after_insta_wave": 0,		: Initial Delay after all [insta_spawn_waves] waves spawned, In this case second wave has spawn delay by 0 + [random number between by spawn_time_delay_for_each_min/max]
                    "spawn_time_delay_for_each_min": 180,		: Minimum Number of Spawn Time Delay for each wave
                    "spawn_time_delay_for_each_max": 360,		: Maximum Number of Spawn Time Delay for each wave
                    "spawn_time_delay_accumulate_for_each_zone": false,
						: If true, Accmulate Spawn Time for Each spawn zone and Check for [escape_time_limit] and set spawn delay for each zone
						: If false, Accmulate Spawn Time as One and Check for [escape_time_limit]
						: This only works when more than 1 [spawn_locations]
					"spawn_location_type": "random",			: Same as [bosses_spawn_location_type], [spawn_time_delay_accumulate_for_each_zone] only works when this has "evenly"

                    "difficulty":{								: Difficulty, Numbers are chance
                        "easy":0,
                        "normal":3,
                        "hard":3,
                        "impossible":1
                    },
                    "spawn_locations":{
                        "ZoneBrige":1,
                        "ZoneCrossRoad":1,
                        "ZoneOldAZS":1,
                        "ZoneBlockPost":1,
                        "ZoneDormitory":1,
                        "ZoneGasStation":1,
                        "ZoneFactoryCenter":1,
                        "ZoneFactorySide":1,
                        "ZoneWade":1,
                        "ZoneScavBase":1,
                        "ZoneTankSquare":1
                    }
                },
                "raider_waves":{
                    "raider_random_role":true,					: Allow to Raiders have random role chance (Default Role = pmcBot)
                    "raider_random_role_chance":15,				: Chance to have other role
					"raider_random_role_list":"followerBully, followerGluharAssault, followerGluharScout, followerGluharSecurity, followerGluharSnipe, followerKojaniy, followerSanitar",	: Random role lists, It will pick random one from list
                    "wave_total":4,
                    "slot_min":3,
                    "slot_max":4,
                    "insta_spawn_waves":1,
                    "spawn_time_delay_after_insta_wave": 120,
                    "spawn_time_delay_for_each_min": 480,
                    "spawn_time_delay_for_each_max": 720,
                    "spawn_time_delay_accumulate_for_each_zone": false,
					"spawn_location_type": "random",
                    "difficulty":{
                        "easy":0,
                        "normal":1,
                        "hard":3,
                        "impossible":1
                    },
                    "spawn_locations":{
                        "ZoneDormitory":2,
                        "ZoneGasStation":2,
                        "ZoneWade":1,
                        "ZoneScavBase":1,
                        "ZoneCrossRoad":1
                    }
                },
                "pmc_waves":{
                    "wave_total":5,
                    "slot_min":1,
                    "slot_max":5,
                    "insta_spawn_waves":2,
                    "spawn_scav_raider_location_chance": 10,	: Spawn Chance to Scav/Raider's [spawn_locations], It's pure random and not effected by [spawn_location_type]
                    "spawn_time_delay_after_insta_wave": 180,
                    "spawn_time_delay_for_each_min": 300,
                    "spawn_time_delay_for_each_max": 480,
                    "spawn_time_delay_accumulate_for_each_zone": true,
					"spawn_location_type": "evenly",
                    "difficulty":{
                        "easy":0,
                        "normal":1,
                        "hard":2,
                        "impossible":2
                    },
                    "spawn_locations":{
                        "ZoneDormitory":2,
                        "ZoneGasStation":2,
                        "ZoneWade":1,
                        "ZoneScavBase":2,
                        "ZoneCrossRoad":1,
                        "ZoneCustoms":1
                    }
                }
            }
        }
​    }
​}
​