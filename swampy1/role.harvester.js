"use strict";
const util = require('util');
const notice = util.mk_notice("mining_map");


const rmap = {"builder":"build", "harvester":"retrieve", "upgrader":"upgrade"};

let roleHarvester = {

	alloc_func : null,

	init : function( work_allcator )
	{
		roleHarvester.work_api = work_allcator;
	},


    /** @param {Creep} creep **/
    run: function(creep)
	{
		if(creep.ticksToLive < 100 && (Memory.max_energy - creep.memory.cost) <= 50 )
		{
			creep.memory.mode = "renew";
		}
		else if(creep.carry.energy < 1 && creep.memory.mode != "renew" && creep.memory.mode != "harvest")
		{
			//notice(`Creep ${creep.name} has ${creep.ticksToLive} ticks to live and is ${Memory.max_energy - creep.memory.cost} costpenalty`);
			if(creep.ticksToLive < 312 && (Memory.max_energy - creep.memory.cost) <= 50 )
			{
				creep.memory.mode = "renew";
			}
			else
				creep.memory.mode = "harvest";
		}
		else if( creep.memory.mode === "harvest" )
		{
			if(creep.carry.energy >= creep.carryCapacity)
			{
				creep.memory.mode = "upgrade";
				if( creep.memory.role && rmap[creep.memory.role] )
					creep.memory.mode = rmap[creep.memory.role];
			}
		}
		else if(!creep.memory.mode)
		{
			creep.memory.mode = "harvest";
		}

	    if( creep.memory.mode === "harvest" )
		{
			creep.memory.harvest_from_src_id = roleHarvester.work_api.request_mining_target(creep);
		
			if(creep.memory.harvest_from_src_id == null )
				return;

			let source = Game.getObjectById(creep.memory.harvest_from_src_id);

			util.set_doing_state(creep, "harvest");
            if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
                creep.moveTo(source);
            }
        }
        else if( creep.memory.mode === "repair" )
		{
			let repair_target = roleHarvester.work_api.request_repair_target(creep);
			repair_target = Game.getObjectById(repair_target);
			if(repair_target)
			{
				util.set_doing_state(creep, "repair");
				let res = creep.repair(repair_target, RESOURCE_ENERGY);
				if(res == ERR_NOT_IN_RANGE)
				{
					creep.moveTo(repair_target);
				}else if (res === OK)
				{
				}else
					notice(`creep ${creep.name} failed to repair: ${res}`);

			}
			else
			{
				//No building to work on, fall back to next work
				if( creep.memory.role === 'harvester' )
					creep.memory.mode = "upgrade";
				else
					creep.memory.mode = "retrieve";
			}
		}
        else if( creep.memory.mode === "build" )
		{
			let build_target = roleHarvester.work_api.request_build_target(creep);
			build_target = Game.getObjectById(build_target);
            if(build_target)
			{
				util.set_doing_state(creep, "build");
				let res = creep.build(build_target, RESOURCE_ENERGY);
                if(res == ERR_NOT_IN_RANGE)
				{
                    creep.moveTo(build_target);
				}else if (res === OK)
				{
				}else
					notice(`creep ${creep.name} failed to build: ${res}`);
            }
			else
			{
				let repair_target = roleHarvester.work_api.request_repair_target(creep);
				if(creep.memory.role === "builder" && repair_target)
				{
					creep.memory.mode = "repair";
				}
				else
				{
					//No building to work on, fall back to next work
					if( creep.memory.role === 'harvester' )
						creep.memory.mode = "upgrade";
					else
						creep.memory.mode = "retrieve";
				}
			}
		}
		else if ( creep.memory.mode === "renew" )
		{
			util.set_doing_state(creep, "renew");
			let spawnid =  roleHarvester.work_api.get_spawn_id(creep);
			let spawn = Game.getObjectById(spawnid);
			let retv = spawn.renewCreep(creep);
			if(retv == OK)
			{
				//notice(`Creep ${creep.name} has RECHARGED TO ${creep.ticksToLive} `);
			}
			else if(retv === ERR_NOT_ENOUGH_ENERGY)
			{
				//give energy to spawn if have any
                creep.transfer(spawn, RESOURCE_ENERGY);
				//otherwise idle
				//notice(`Creep ${creep.name} needs to wait to get recharged`);
			}
			else if( retv === ERR_FULL)
			{
				//finished repairs
				notice(`Creep ${creep.name} has RECHARGED TO FULL @ ${creep.ticksToLive} `);
				creep.memory.mode = rmap[creep.memory.role];
			}
			else if( retv == ERR_NOT_IN_RANGE )
			{
                creep.moveTo(spawn);
			}
		}
        else if( creep.memory.mode === "upgrade" )
		{
            if(creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller);
            }
		}
        else if( creep.memory.mode === "retrieve" )
		{
			let retrieve_target = roleHarvester.work_api.request_retrieve_target(creep);
			retrieve_target = Game.getObjectById(retrieve_target);
            if(retrieve_target)
			{
				util.set_doing_state(creep, "retrieve");
                if(creep.transfer(retrieve_target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
                    creep.moveTo(retrieve_target);
            }
			else
			{
				//notice(`Creep ${creep.name} has ${creep.ticksToLive} ticks to live and is ${Memory.max_energy - creep.memory.cost} costpenalty`);
				if(creep.ticksToLive < 312 && (Memory.max_energy - creep.memory.cost) <= 50 )
				{
					creep.memory.mode = "renew";
				}
				//No place to drop energy, fall back to next work
				else if( creep.memory.role === 'harvester' )
					creep.memory.mode = "build";
				else
					creep.memory.mode = "upgrade";
			}
        }
	}
};

module.exports = roleHarvester;
