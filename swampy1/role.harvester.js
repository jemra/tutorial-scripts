
function set_doing_state(creep, state)
{
	if(creep.memory.doing_state != state)
	{
		creep.say("${state}!");
	}
	creep.memory.doing_state = state;
}
var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {
        
	    if(creep.carry.energy < creep.carryCapacity) {
            var sources = creep.room.find(FIND_SOURCES_ACTIVE);
            if(creep.memory.harvest_from_node === null || creep.memory.harvest_from_node > sources.length)
            {
                creep.memory.harvest_from_node = getRandomInt(0, sources.length);
            }
            
			set_doing_state("harvest");
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
				set_doing_state("retrieve");
                if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0]);
                }
            }
			else
			{
				set_doing_state("park");
				targets = creep.room.find(FIND_STRUCTURES, { filter: (structure) => { return (structure.structureType == STRUCTURE_SPAWN ); } });
				if(targets.length > 0)
					creep.moveTo(targets[0]);
			}
        }
	}
};

module.exports = roleHarvester;
