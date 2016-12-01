"use strict";
const util = require('util');


var roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) {

	    if(creep.memory.building && creep.carry.energy === 0) {
            creep.memory.building = false;
	    }
		else if(!creep.memory.building && creep.carry.energy === creep.carryCapacity) {
	        creep.memory.building = true;
	    }

	    if(creep.memory.building)
		{
	        var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
            if(targets.length)
			{
				util.set_doing_state(creep, "building");
                if(creep.build(targets[0]) === ERR_NOT_IN_RANGE)
				{
                    creep.moveTo(targets[0]);
                }
            }
			else
			{
				util.set_doing_state(creep, "park");
				targets = creep.room.find(FIND_STRUCTURES, 
						{ filter: (structure) => { return (structure.structureType == STRUCTURE_SPAWN ); } });
				if(targets.length > 0)
				{
					let dest_pos = targets[0].pos;
					creep.moveTo(dest_pos.x, dest_pos.y - 3);
				}
			}
	    }
	    else
		{
			util.set_doing_state(creep, "harvesting");
	        var sources = creep.room.find(FIND_SOURCES);
            if(creep.harvest(sources[0]) === ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[0]);
            }
	    }
	}
};

module.exports = roleBuilder;
