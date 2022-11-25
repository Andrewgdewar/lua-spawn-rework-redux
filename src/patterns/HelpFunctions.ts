export class HelpFunctions
{
    //Return a array with spawn locations with or without chances
    //(obj, string)
    //type: "with_chance","without_chance"
    public Generate_info_array(info: object, type: string): string[]
    {
        let chance_array = [];
        //Location array with chances
        if (type === "with_chance")
        {
            for (let [loc_name, chance] of Object.entries(info))
            {
                for (let count: any = chance; count > 0; count--)
                {
                    chance_array.push(loc_name);
                }
            }
        }
        //Location array without chances. Can be used to instant spawn waves without overlapping location at raid start.
        else if (type === "without_chance")
        {
            for (let [loc_name, chance] of Object.entries(info))
            {
                if (chance > 0) chance_array.push(loc_name);
            }
        }

        return chance_array;
    }

    public Add_boss_type_spawn_simple(map_base: any, name: string, chance: number, spawn_location: string, difficulty: string, escort_type: string, escort_difficulty: string, escort_amount: number, spawn_time: number, random_time_spawn: boolean): object
    {
        if (spawn_location == undefined)
        {
            spawn_location = "";
        }
        
        const boss_template = {
            "BossName": name,
			"BossChance": chance,
			"BossZone": spawn_location,
			"BossPlayer": false,
			"BossDifficult": difficulty,
			"BossEscortType": escort_type,
			"BossEscortDifficult": escort_difficulty,
			"BossEscortAmount": escort_amount,
			"Time": spawn_time,
            "RandomTimeSpawn": random_time_spawn
        };

        map_base.BossLocationSpawn.push(boss_template);
        return map_base;
    }

    public Add_boss_type_spawn_complete(map_base: any, name: string, chance: number, spawn_location: string, difficulty: string, escort_type: string, escort_difficulty: string, escort_amount: number, spawn_time: number, trigger_id: string, trigger_name: string, supports: any, random_time_spawn: boolean): object
    {
        if (spawn_location == undefined)
        {
            spawn_location = "";
        }
        
        const boss_template = {
            "BossName": name,
			"BossChance": chance,
			"BossZone": spawn_location,
			"BossPlayer": false,
			"BossDifficult": difficulty,
			"BossEscortType": escort_type,
			"BossEscortDifficult": escort_difficulty,
			"BossEscortAmount": escort_amount,
			"Time": spawn_time,
            "TriggerId": trigger_id,
            "TriggerName": trigger_name,
            "Supports":supports,
            "RandomTimeSpawn": random_time_spawn
        };

        map_base.BossLocationSpawn.push(boss_template);
        return map_base;
    }

    public Add_trigger_type_spawn(map_base: any, name: string, chance: number, spawn_location: string, difficulty: string, escort_type: string, escort_difficulty: string, escort_amount: number, spawn_time: number, trigger_id: string, trigger_name: string, supports: any, random_time_spawn: boolean): object
    {
        if (spawn_location == undefined)
        {
            spawn_location = "";
        }
        
        const boss_template = {
            "BossName": name,
			"BossChance": chance,
			"BossZone": spawn_location,
			"BossPlayer": false,
			"BossDifficult": difficulty,
			"BossEscortType": escort_type,
			"BossEscortDifficult": escort_difficulty,
			"BossEscortAmount": escort_amount,
			"Time": spawn_time,
            "TriggerId": trigger_id,
            "TriggerName": trigger_name,
            "Supports":supports,
            "RandomTimeSpawn": random_time_spawn
        };

        map_base.BossLocationSpawn.push(boss_template);
        return map_base;
    }

    //Remove boss spawn location from other bots' spawn location
    public Remove_boss_loc(map_configs: any, spawn_location: string): any
    {
        for (let [key,value] of Object.entries(map_configs.wave_settings))
        {
            if (key !== "triggered_raider_waves")
            {
                if (map_configs.wave_settings[key].spawn_locations != undefined)
                {
                    delete map_configs.wave_settings[key].spawn_locations[spawn_location];
                }
            }
        }

        return map_configs;
    }

    public Add_wave_type_spawn(map_base: any, current_wave: number, spawn_time: number, slot_min: number, slot_max: number, spawn_location: string, difficulty: string, wild_spawn_type: string): object
    {
        if (spawn_location == undefined)
        {
            spawn_location = "";
        }

        // trying to fix wave slots by lowering the number otherwise it won't spawn exact amount of slots :shrug:
        if (slot_min === slot_max)
         {
            // Make the wave spawns only two not three or one (bSG maGic)
            if (slot_min === 2) slot_max = 1;
            else if (slot_min > 2) slot_min = --slot_max; // higher than 2 slots will be spawn one more bot, reduce it
        }

        const wave_template = {
            "number": current_wave,
			"time_min": spawn_time,
			"time_max": spawn_time,
			"slots_min": slot_min,
			"slots_max": slot_max,
			"SpawnPoints": spawn_location,
			"BotSide": "Savage",
			"BotPreset": difficulty,
			"WildSpawnType": wild_spawn_type,
			"isPlayers": false
        };
        if (current_wave > 0)
        {
           map_base.waves.push(wave_template);
        }
        else
        {
            map_base.waves.unshift(wave_template);
        }

        return map_base;
    }
}