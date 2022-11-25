//Updated by Hosav for SPT-AKI B5+ and v0.5.0+ by Lua
import { DependencyContainer } from "tsyringe";
import { IPreAkiLoadMod } from "@spt-aki/models/external/IPreAkiLoadMod";
import { IPostDBLoadMod } from "@spt-aki/models/external/IPostDBLoadMod";
import { ApplicationContext } from "@spt-aki/context/ApplicationContext";
import { ContextVariableType } from "@spt-aki/context/ContextVariableType";
import { StaticRouterModService } from "@spt-aki/services/mod/staticRouter/StaticRouterModService";
import { LocationCallbacks } from "@spt-aki/callbacks/LocationCallbacks";
import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";
import { ConfigServer } from "@spt-aki/servers/ConfigServer";
import { ConfigTypes } from "@spt-aki/models/enums/ConfigTypes";
import { IBotConfig } from "@spt-aki/models/spt/config/IBotConfig";
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import { RandomUtil } from "@spt-aki/utils/RandomUtil";
import { JsonUtil } from "@spt-aki/utils/JsonUtil";
import { VFS } from "@spt-aki/utils/VFS";
import { HelpFunctions } from "./patterns/helpfunctions";
import { SpawnRework } from "./patterns/SpawnRework";
import pkg from "../package.json";
import modConfig from "../config/config.json";

class Mod implements IPreAkiLoadMod, IPostDBLoadMod
{
    protected Path: string;
    protected Name: string = `${pkg.author}-${pkg.name}`;
    private container: DependencyContainer;
    protected helper = new HelpFunctions();
    protected savedLocations: any;

    public preAkiLoad(container: DependencyContainer): void
    {
		this.container = container;

        const staticRouterModService: StaticRouterModService = container.resolve<StaticRouterModService>("StaticRouterModService");
        staticRouterModService.registerStaticRouter(
            `${this.Name}-/singleplayer/settings/raid/menu`,
            [
                {
                    url: "/singleplayer/settings/raid/menu",
                    action: (url: string, info: any, sessionID: string, output: string): any => 
                    {
                        // Is this hideout already closed?
                        const locations = this.container.resolve<DatabaseServer>("DatabaseServer").getTables().locations;
                        if (locations.hideout.base.AveragePlayerLevel !== 0)
                        {
                            this.LoadModConfig();
                        }
                        return output;
                    }
                }
            ],
            "aki"
        );

        staticRouterModService.registerStaticRouter(
            `${this.Name}-/client/locations`,
            [
                {
                    url: "/client/locations",
                    action: (url: string, info: any, sessionID: string, output: string): any => 
                    {
                		this.LoadModConfig();
                        return this.container.resolve<LocationCallbacks>("LocationCallbacks").getLocationData(url, info, sessionID);
                    }
                }
            ],
            "aki"
        );
    }

    public postDBLoad(container: DependencyContainer): void
    {
		// S P T 3 . 0 . 0
		const logger: ILogger = container.resolve<ILogger>("WinstonLogger");

        logger.info(`Loading: ${this.Name} ${pkg.version}${modConfig.Enabled === true ? "" : " [Disabled]"}`);
        if (!modConfig.Enabled)
        {
            return;
        }

        const applicationContext: ApplicationContext = container.resolve<ApplicationContext>("ApplicationContext");
        applicationContext.getValues(ContextVariableType.MATCH_INFO);

        // #TODO: Ignore red lines, forever.
        const dirArray = __dirname.split("\\");
		this.Path = `${dirArray[dirArray.length - 4]}/${dirArray[dirArray.length - 3]}/${dirArray[dirArray.length - 2]}`; // Pon, Pin, Fon, Fin
        if (modConfig.__DEBUG__Generate_bots_on_start == true)
        {
			this.LoadModConfig();
			logger.debug(`${this.Name} - Debug Generate Bots Completed`);
		}
    }

    public GenerateMapSpawns(patternConfig, maps): void
    {
		const logger: ILogger = this.container.resolve<ILogger>("WinstonLogger");
		const jsonUtil: JsonUtil = this.container.resolve<JsonUtil>("JsonUtil");
        const configServer = this.container.resolve<ConfigServer>("ConfigServer");
        const botConfig = configServer.getConfig<IBotConfig>(ConfigTypes.BOT);
		const databaseServer = this.container.resolve<DatabaseServer>("DatabaseServer").getTables();
        const bots = databaseServer.bots;
        const locations = databaseServer.locations;

        // Uses it as variable for waves were generated (server restart, etc)
		locations.hideout.base.AveragePlayerLevel = 0;

		// AI Config
        botConfig.maxBotCap = patternConfig.spawns.max_alive_bots;
        botConfig.pmc.pmcType = patternConfig.spawns.pmc_type;
        botConfig.chanceSameSideIsHostilePercent = patternConfig.spawns.chanceSameSideIsHostilePercent;
        botConfig.showTypeInNickname = patternConfig.spawns.showTypeInNickname;

        // AI Type Cloning
        bots.types["assaultgroup"] = jsonUtil.clone(bots.types["pmcBot"]);
        if (bots.types["gifter"].inventory.Ammo === undefined)
        {
            bots.types["gifter"].inventory.Ammo = jsonUtil.clone(bots.types["assault"].inventory.Ammo);
        }

        // Set Bot USEC Chance
        botConfig.pmc.isUsec = patternConfig.spawns.pmc_usec_chance;

        // Set PMC Config
        botConfig.pmc.convertIntoPmcChance = {"assaultgroup": {min: 100, max: 100}};

        const spawnRework = new SpawnRework();
        for (const map_name of maps)
        {
            if (locations[map_name] === undefined || locations[map_name].base.Locked === true)
            {
                if (map_name !== "pmc_type" && map_name !== "max_alive_bots") logger.error(`${this.Name} - Pattern config has map "${map_name}" but not available in SPT, Skipping...`);
                continue;
            }
            locations[map_name].base.OpenZones = patternConfig.spawns[map_name].scav_map_openzones.split(",").map(zone => zone.trim()).join(",");
            locations[map_name].base = spawnRework.GenerateSpawnWaves(this.container, patternConfig.spawns[map_name], locations[map_name].base, map_name);
        }
        logger.info("--------------------------------------------------------");
        logger.success(`Generated new bot spawns`);
    }

    public ClearDefaultSpawns(): void
    {
        const jsonUtil: JsonUtil = this.container.resolve<JsonUtil>("JsonUtil");
		const databaseServer = this.container.resolve<DatabaseServer>("DatabaseServer").getTables();
        const locations = databaseServer.locations;
        if (!this.savedLocations)
        {
            this.savedLocations = jsonUtil.clone(locations);
        }

        for (const mapName in locations)
        {
            const map = mapName.toLowerCase();
			if (map === "base" || map === "hideout")
            {
				continue;
            }
            
            // Reset Database, Cringe
            locations[map].base.waves = [... this.savedLocations[map].base.waves];
            locations[map].base.BossLocationSpawn = [... this.savedLocations[map].base.BossLocationSpawn];

            //Clear bots spawn
			if (!modConfig?.UseDefaultSpawns?.Waves)
            {
                locations[map].base.waves = [];
            }

            //Clear boss spawn
            const bossLocationSpawn = locations[map].base.BossLocationSpawn;
			if (!modConfig?.UseDefaultSpawns?.Bosses && !modConfig?.UseDefaultSpawns?.TriggeredWaves)
            {
                locations[map].base.BossLocationSpawn = [];
            }
            else
            {
                // Remove Defualt Boss Spawns
                if (!modConfig?.UseDefaultSpawns?.Bosses)
                {
                    for (let i = 0; i < bossLocationSpawn.length; i++)
                    {
                        // Triggered wave check
                        if (bossLocationSpawn[i]?.TriggerName?.length === 0)
                        {
                            locations[map].base.BossLocationSpawn.splice(i--, 1);
                        }
                    }
                }

                // Remove Default Triggered Waves
                if (!modConfig?.UseDefaultSpawns?.TriggeredWaves)
                {
                    for (let i = 0; i < bossLocationSpawn.length; i++)
                    {
                        // Triggered wave check
                        if (bossLocationSpawn[i]?.TriggerName?.length > 0)
                        {
                            locations[map].base.BossLocationSpawn.splice(i--, 1);
                        }
                    }
                }
            }
		}

        locations.hideout.base.AveragePlayerLevel = 10;
    }
	
	protected LoadModConfig(): void
    {
        //Load configurations
        const config = this.GetModConfig();
        if (config)
        {
            //Spawn functions
            this.ClearDefaultSpawns();
            this.GenerateMapSpawns(config[0], config[1]);
        }
    }

    protected GetModConfig(): any[]
    {
		const vfs: VFS = this.container.resolve<VFS>("VFS");
		const jsonUtil: JsonUtil = this.container.resolve<JsonUtil>("JsonUtil");
		const logger: ILogger = this.container.resolve<ILogger>("WinstonLogger");

        let spawn_pattern = modConfig.default_pattern;
        if (modConfig.use_random_patterns === true && modConfig.random_patterns !== undefined && Object.keys(modConfig.random_patterns).length > 0)
        {
            const randomUtil: RandomUtil = this.container.resolve<RandomUtil>("RandomUtil");
            let pattern_list = this.helper.Generate_info_array(modConfig.random_patterns, "with_chance");
            spawn_pattern = pattern_list[randomUtil.getInt(0, pattern_list.length-1)];
        }

        let config_file: any;
        const filePath = `${this.Path}/config/patterns/${spawn_pattern}.json`;
        if (vfs.exists(filePath) === true)
        {
            config_file = jsonUtil.deserialize( vfs.readFile(filePath) );
        }
        
        if (!config_file)
        {
            logger.error(`${this.Name} - Spawn Pattern "${spawn_pattern}" doesn't exists, Check the config file, Mod Disabled...`);
            return [];
        }

        let maps: string[] = [];
        for (let [key, value] of Object.entries(config_file.spawns))
        {
			if (typeof(value) !== "object" || key === "usec_default_enemy" || key === "bear_default_enemy")
            {
				continue;
            }

            maps.push(key);
        }

		logger.success(`Loaded spawn patter: ${spawn_pattern}. Good Luck!`);
        return [config_file, maps];
    }
}

module.exports = { mod: new Mod() }