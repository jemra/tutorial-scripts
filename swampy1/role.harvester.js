
var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {
        
	    if(creep.carry.energy < creep.carryCapacity) {
            var sources = creep.room.find(FIND_SOURCES_ACTIVE);
            if(creep.memory.harvest_from_node == null || creep.memory.harvest_from_node > sources.length)
            {
                creep.memory.harvest_from_node = getRandomInt(0, sources.length);
            }
            
            if(creep.harvest(sources[creep.memory.harvest_from_node]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[creep.memory.harvest_from_node]);
            }
        }
        else {
            var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION 
                        || structure.structureType == STRUCTURE_SPAWN
                        || structure.structureType == STRUCTURE_TOWER ) &&
                            structure.energy < structure.energyCapacity;
                    }
            });
            if(targets.length > 0) {
                if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0]);
                }
            }
        }
	}
};

