*** 이 READ 파일은 v2.0.0 기준, 업데이트 되지 않았습니다. 참고만 하시기 바랍니다. ***
*** 이 READ 파일은 v2.0.0 기준, 업데이트 되지 않았습니다. 참고만 하시기 바랍니다. ***
*** 이 READ 파일은 v2.0.0 기준, 업데이트 되지 않았습니다. 참고만 하시기 바랍니다. ***
*** 이 READ 파일은 v2.0.0 기준, 업데이트 되지 않았습니다. 참고만 하시기 바랍니다. ***
*** 이 READ 파일은 v2.0.0 기준, 업데이트 되지 않았습니다. 참고만 하시기 바랍니다. ***
*** 이 READ 파일은 v2.0.0 기준, 업데이트 되지 않았습니다. 참고만 하시기 바랍니다. ***
*** 이 READ 파일은 v2.0.0 기준, 업데이트 되지 않았습니다. 참고만 하시기 바랍니다. ***
*** 이 READ 파일은 v2.0.0 기준, 업데이트 되지 않았습니다. 참고만 하시기 바랍니다. ***





INFO (Tarkov v12.12.30)
===============================
보스:				bossBully, bossGluhar, bossKilla, bossKojaniy, bossSanitar, bossTagilla, sectantPriest, bossKnight
보스 호위:			followerBully, followerKojaniy, followerSanitar, followerGluharSnipe, followerGluharAssault, followerGluharScout, followerGluharSecurity, sectantWarrior, followerBirdEye, followerBigPipe
스캐브:		    	assault
레이더:				pmcBot, exUsec
PMC 봇:		    	assaultGroup, cursedAssault (*보스의 호위 타입으로 사용하지 않는게 좋습니다, 호위 봇들이 보스가 죽을 때까지 공격하지만 보스는 무시합니다.)
이벤트 AI:          gifter
===============================

{
    "spawns":{
		"max_alive_bots": 35,
			(게임 기본값: 20~30)
			(설명: 맵 상에서 최대한으로 살아있을 수 있는 봇의 수, 값이 적을 수록 프레임이 향상됩니다.)


		"pmc_usec_chance": 50,
				(게임 기본값: 50)
				(설명: PMC 봇의 USEC 스폰 확률)


		"pmc_behavior_role": "pmcBot",
				(모드 기본값: "pmcBot")
				(설명: PMC 봇이 사용할 난이도 설정, 설정한 봇 역할로 부터 가져옵니다.)


        "customs":{
            "map_rules": "AvoidAllPmc",
				(값: Normal, AvoidAllPmc, AvoidOwnPmc | 커스텀 맵의 기본값: AvoidAllPmc)
​				(설명: 현재 쓰이지 않는 설정, 맵의 MapRules 값에 적용됩니다.)
					(Normal: 스캐브와 반대 PMC 세력이 공격)
					(AvoidOwnPMC: 스캐브와 같은 PMC 세력이 공격)
					(AvoidAllPMC: 스캐브와 모든 PMC 세력이 공격)

            "show_generated_bots":"secret",
				(값: disable, all, secret)
				(설명: 생성된 봇 웨이브를 서버 콘솔에 출력합니다)
					(all: 모든 수치를 출력, 스폰되는 웨이브의 정확한 수치를 보여줍니다. 그리고 트리거된 레이드 웨이브를 출력합니다.)
					(secret: 수치를 비밀스럽게 출력, 최소한의 정보만 보여줍니다. 컬티스트 및 보스와 트리거된 레이드 웨이브는 보이지 않으며 최소-최대 값이 같지 않는 이상 최소-최대 값을 보여줍니다.)

			"max_spawn_time": 1000,
				(값: 초 단위)
				(권장: 평균적인 플레이/탈출 시간)
				(설명: 모드에서 사용하는 웨이브 스폰 최대 시간으로 전체 웨이브 수를 줄여줍니다, 평균적인 플레이/탈출 시간을 권장드리며 프레임 향상에 도움됩니다.)

            "max_spawn_time_limit_warning":false,
				(설명: 웨이브 스폰 시간 값이 escape_time_limit (맵 탈출 제한 시간) 또는 [max_spawn_time] 을 경과할 경우 서버 로그에 경고를 출력할지 여부를 설정합니다, 이 경고를 보고 웨이브 시간, 최대 수를 수정하는 걸 권장합니다.)


            "max_bot_per_zone": 10,
				(권장: 8~15, 컴퓨터 사양에 따라 설정하세요)
				(설명: 값이 낮을 수록 프레임이 향상됩니다. *미확인*)


            "allow_other_bot_spawn_with_boss":false,
				(설명: 보스 웨이브가 생성된 장소에 다른 봇(스캐브, 레이더, PMC)이 해당 장소에 스폰할 수 있는지 여부를 정합니다. (트리거된 레이더 웨이브 제외)
				(설명: 팩토리 처럼 작거나 스폰 장소가 한 군데인 경우나, 봇이 좀 더 광범위한 장소에 스폰하고 싶을 경우 값을 true 로 사용하세요.)
				(설명: [bosses_also_use_scavs_spawn_locations] 과 [bosses_also_use_raiders_spawn_locations] 설정은 이 설정에 영향을 받지 않습니다.)


            "has_boss":true,
				(설명: 보스 맛좀 보쉴?)


            "bosses_spawn_location_type":"evenly",
				(값: random, together, evenly)
				(설명: random		= 순수 무작위, 여러 보스가 한 곳에 스폰 될 수도 있습니다.)
				(설명: together	= 모든 보스가 한 위치에 스폰합니다.)
				(설명: evenly		= 보스를 모든 위치에 골고루 스폰합니다, 만약 스폰 장소가 스폰할 보스 수보다 작다면 스폰 장소를 다시 돌려 같은 장소에 여러 보스가 스폰됩니다.)


            "max_boss":1,
				(설명: 보스가 최대 스폰 수)
			

            "boss_spawn_trying_loop":1,
				(설명: 보스 스폰을 얼마나 시도할 지 정합니다, 0 = 보스 스폰을 [max_boss] 값에 도달할 때까지 계속 반복합니다.)


            "allow_same_boss_spawn":false,
				(설명: 같은 보스 타입을 스폰할 수 있게 할지 여부를 정합니다.)


            "bosses_also_use_scavs_spawn_locations":false,
            "bosses_also_use_raiders_spawn_locations":true,
				(설명: 스캐브/레이더의 [spawn_locations] 값을 보스 스폰에 사용할 지 여부를 정합니다.)


			"cultists_spawn_count_for_max_boss": false,
				(설명: 컬티스트 보스를 [max_boss] 값에 포함시킬 지 여부를 정합니다, 주의: 컬티스트는 웨이브가 생성되어도 밤에만 스폰합니다, 그러므로 [max_boss] 값을 늘리시거나 false 로 해두길 권장합니다.)


			"cultists_spawn_at_own_locations": true,
				(설명: 컬티스트 보스의 스폰 장소를 고유의 [spawn_locations] 만 사용하게 합니다, 기본 게임에 존재하는 컬티스트 스폰 장소는 보통 숨을 수 있는 공간을 두기 때문에 본래 컬티스트가 스폰하는 맵은 사용하시는 것이 좋습니다.
					  이 설정은 [bosses_spawn_location_type] 과 [bosses_also_use_*_spawn_locations] 에 영향을 받지 않습니다.)


            "boss_settings":[
                {
                    "name":"bossBully",						: 보스 타입, 여러 보스 타입 중 무작위로 선택하려면 "bossBully, bossGluhar, bossTagilla" 처럼 쉼표로 구분하여 설정 (여러 타입 사용 시 스폰 확률 시도를 맨 마지막에 합니다)
                    "chance":100,							: 스폰 확률
                    "difficulty":"normal",					: 난이도 (보스는 모두 난이도가 같습니다, normal와 impossible는 동일 난이도), 여러 난이도 중 무작위로 선택하려면 "normal, hard, impossible" 처럼 쉼표로 구분하여 설정
                    "escort_type":"followerBully",			: 호위 봇 타입, 여러 호위 타입 중 무작위로 선택하려면 "followerGluharAssault, pmcBot, followerBully" 처럼 쉼표로 구분하여 설정 ("supports" 목록이 설정되면 이 설정은 무시됩니다.)
                    "escort_difficulty":"normal",			: 호위 봇 난이도, 여러 난이도 중 무작위로 선택하려면 "easy, normal, hard" 처럼 쉼표로 구분하여 설정 ("supports" 목록이 설정되면 이 설정은 무시됩니다.)
                    "escort_amount_min":2,					: 호위 봇 최소 수 ("supports" 목록이 설정되면 이 설정은 무시됩니다.)
                    "escort_amount_max":4,					: 호위 봇 최대 수, 값을 0 으로 주면 스폰하지 않습니다. ("supports" 목록이 설정되면 이 설정은 무시됩니다.)
                    "wave_total":1,							: 최대 웨이브 수, 값을 0 으로 주면 스폰하지 않습니다.
                    "wave_spawn_time_for_each_min":600,		: 웨이브 후 추가 웨이브 마다 지연될 최소/최대 스폰 시간
                    "wave_spawn_time_for_each_max":900,
                    "wave_spawn_all_same_location":false,	: 추가 웨이브를 첫 웨이브가 스폰한 장소에서만 스폰할지에 대한 여부
                    "spawn_locations":{						: 스폰 장소, 숫자는 확률입니다.
                        "ZoneScavBase":1,
                        "ZoneGasStation":1,
                        "ZoneDormitory":1
                    },
					"trigger_id":"",						: 맵 트리거 ID, triggered_raider_waves (트리거된 레이더 웨이브) 처럼 스폰을 원할 경우 설정합니다.
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
                    "supports":[										: 호위 봇 목록, 글루하는 여러 타입의 호위 봇이 있어 아래와 같이 별도로 설정됩니다. 다른 보스 타입은 아래와 같은 설정이 요구되지 않습니다.
																		  또한 "supports" 가 설정된 보스는 [escort_*] 설정들을 무시하며 필요하지 않습니다.
																		  만약 여러 호위 타입의 봇을 보스에 사용하려고 한다면 사용하세요.
                        {
                            "BossEscortType":"followerGluharAssault",	: 호위 봇 타입, 여러 호위 타입 중 무작위로 선택하려면 "followerGluharAssault, pmcBot, followerBully" 처럼 쉼표로 구분하여 설정
                            "BossEscortDifficult":[
                                "normal"								: 호위 봇 난이도, 여러 난이도 중 무작위로 선택하려면 "easy, normal, hard" 처럼 쉼표로 구분하여 설정
                            ],
                            "BossEscortAmount_min":1,					: 호위 봇 최소 수
                            "BossEscortAmount_max":2					: 호위 봇 최대 수, 값을 0 이하로 주면 스폰하지 않습니다.
                        },
                        {
                            "BossEscortType":"followerGluharSecurity",
                            "BossEscortDifficult":[
                                "normal"
                            ],
                            "BossEscortAmount_min":1,
                            "BossEscortAmount_max":2"
                        },
                        {
                            "BossEscortType":"followerGluharScout",
                            "BossEscortDifficult":[
                                "normal"
                            ],
                            "BossEscortAmount_min":1",
                            "BossEscortAmount_max":2"
                        }
                    ]
                },
				{
					"name":"sectantPriest",						: 컬티스트 보스 타입
					"chance":20,								: 스폰 확률, 주의: 컬티스트는 100% 확률을 주어도 정해진 시간에만 스폰합니다 (22:00 ~ 06:00), (기본값 = 커스텀: 20, 우즈/쇼어라인: 28)
					"difficulty":"normal",
					"escort_type":"sectantWarrior",				: 컬티스트 호위 봇 타입
					"escort_difficulty":"normal",
					"escort_amount_min":1,						: 컬티스트 호위 봇 최소 수 (기본값 = 커스텀: 3, 우즈/쇼어라인: 5)
					"escort_amount_max":3,						: 컬티스트 호위 봇 최대 수 (기본값 = 커스텀: 3, 우즈/쇼어라인: 5)
					"wave_total":1,
					"wave_spawn_time_for_each_min":900,
					"wave_spawn_time_for_each_max":1200,
					"wave_spawn_all_same_location":false,
					"spawn_locations":{
						"ZoneDormitory":1						: [cultists_spawn_at_own_locations] 에서 설명 했듯이 컬티스트는 가능하면 맵에 지정된 [spawn_locations] 을 사용하는게 좋습니다.
					},
					"trigger_id":"",
					"trigger_name":"",
					"supports":null
				},
				{
					"name":"bossBully, bossGluhar, bossKilla, bossKojaniy, bossSanitar, bossTagilla",		: 무작위 보스 타입, 목록 중에 한 타입이 선택됩니다. (만약 [allow_same_boss_spawn] 값이 false 일 때 적힌 보스 타입이 모두 스폰되어 겹친다면 스폰을 스킵합니다.)
																											  (여러 타입 사용 시 스폰 확률 시도를 맨 마지막에 합니다)
					"chance":20,
					"difficulty":"normal, hard, impossible",												: 무작위 난이도, 목록 중에 한 난이도가 선택됩니다.
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
							"BossEscortType":"pmcBot, assault",												: 이쯤되면 이제 말 안해도 아시겠죠?
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
                    "wave_total":6,								: 전체/최대 웨이브 수를 지정합니다, [insta_spawn_waves] 또한 이에 포함됩니다, 현재 설정을 예로 들면 2번의 웨이브가 시작과 동시에 스폰하며 4번의 추가 웨이브가 생성되어 총 6번의 웨이브가 됩니다."
                    "slot_min":1,								: 한 웨이브에 스폰할 최소 봇 수
                    "slot_max":4,								: 한 웨이브에 스폰할 최대 봇 수, 스캐브 그룹의 사이즈 크기
                    "insta_spawn_waves":2,						: 즉시 스폰할 웨이브의 수
                    "spawn_time_delay_after_insta_wave": 0,		: [insta_spawn_waves] 웨이브가 모두 스폰된 후 설정될 스폰 시간의 초기 딜레이, 이 경우 두 번째 웨이브는 0 + [spawn_time_delay_for_each_min 과 _max 값 중 무작위 값] 의 딜레이를 가지고 웨이브가 스폰됩니다.
                    "spawn_time_delay_for_each_min": 180,		: 웨이브 후 추가 웨이브 마다 지연될 최소/최대 스폰 시간
                    "spawn_time_delay_for_each_max": 360,		: 웨이브 후 추가 웨이브 마다 지연될 최소/최대 스폰 시간
                    "spawn_time_delay_accumulate_for_each_zone": false,
						: 값이 true 일 경우, 스폰 장소마다 각각의 스폰 딜레이 시간을 누적하여 사용합니다.
						: 값이 false 일 경우, 모든 스폰 장소를 하나의 스폰 딜레이 시간으로 누적하여 사용합니다.
						: [spawn_locations] 값이 1개 이상일 때만 사용됩니다.
					"spawn_location_type": "random",			: [bosses_spawn_location_type] 과 동일하며, 값이 "evenly" 일 때만 [spawn_time_delay_accumulate_for_each_zone] 설정을 사용합니다.

                    "difficulty":{								: 난이도, 숫자는 확률입니다.
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
                    "raider_random_role":true,					: 레이더가 무작위로 다른 역할이 될 수 있게 합니다 (기본 역할 = pmcBot)
                    "raider_random_high_role_chance":15,		: 무작위 역할 확률
					"raider_random_role_list":"followerBully, followerGluharAssault, followerGluharScout, followerGluharSecurity, followerGluharSnipe, followerKojaniy, followerSanitar",		: 무작위 역할 목록, 목록 중에 한 역할이 선택됩니다.
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
                    "spawn_scav_raider_location_chance": 10,	: 스캐브/레이더의 [spawn_locations] 에 스폰할 확률
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