"use strict";
const util = require('util');

let roleHarvester = {

	alloc_func : null,

	init : function( work_allcator )
	{
		roleHarvester.alloc_func = work_allcator;
	},

    /** @param {Creep} creep **/
    run: function(creep) {
	    if(creep.carry.energy < creep.carryCapacity) {

			if(creep.memory.harvest_from_src_id == null )
			{
				if( roleHarvester.alloc_func )
				{
					creep.memory.harvest_from_src_id = roleHarvester.alloc_func(creep);
				}
			
				if(creep.memory.harvest_from_src_id == null )
				{
					var sources = creep.room.find(FIND_SOURCES_ACTIVE);
					creep.memory.harvest_from_src_id = sources[util.getRandomInt(0, sources.length)].id;
				}
			}

			let source = Game.getObjectById(creep.memory.harvest_from_src_id);

			util.set_doing_state(creep, "harvest");
            if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
                creep.moveTo(source);
            }
        }
        else
		{
            var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION 
                        || structure.structureType == STRUCTURE_SPAWN
                        || structure.structureType == STRUCTURE_TOWER ) &&
                            structure.energy < structure.energyCapacity;
                    }
            });
            if(targets.length > 0) {
				util.set_doing_state(creep, "retrieve");
                if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0]);
                }
            }
			else
			{
				util.set_doing_state(creep, "park");
				targets = creep.room.find(FIND_STRUCTURES, { filter: (structure) => { return (structure.structureType == STRUCTURE_SPAWN ); } });
				if(targets.length > 0)
					creep.moveTo(targets[0]);
			}
        }
	}
};

module.exports = roleHarvester;
