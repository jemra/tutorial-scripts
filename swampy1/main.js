var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var lil_army = require('lil_army');
var reports = require('reports');
var mining_planner = require('mining_planner');


function defendRoom(roomName) {

	var hostiles = Game.rooms[roomName].find(FIND_HOSTILE_CREEPS);

	if(hostiles.length > 0) {
		var username = hostiles[0].owner.username;
		Game.notify(`User ${username} spotted in room ${roomName}`);
		var towers = Game.rooms[roomName].find(
				FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}});
		towers.forEach(tower => tower.attack(hostiles[0]));
	}
}


module.exports.loop = function () {

	//pos.roomName;
	let cur_room_name = Object.keys(Game.rooms)[0];
	let cur_room = Game.rooms[cur_room_name];
    lil_army.one_run("Spawn1");

	if( null == Memory.mining_map)
	{
		//one time only?
		mining_planner.analyze_room("Spawn1");
	}

    var tower = cur_room.find( FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}})[0];
    if(tower) {
        var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => structure.hits < structure.hitsMax
        });
        if(closestDamagedStructure) {
            tower.repair(closestDamagedStructure);
        }

        var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if(closestHostile) {
            tower.attack(closestHostile);
        }
    }
	else
	{
		cur_room.createConstructionSite(21, 25,  STRUCTURE_TOWER);
	}


    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        if(creep.memory.role == 'harvester') {
            roleHarvester.run(creep);
        }
        if(creep.memory.role == 'upgrader') {
            roleUpgrader.run(creep);
        }
        if(creep.memory.role == 'builder') {
            roleBuilder.run(creep);
        }
    }

	if((Game.time % 25) === 0)
	{
		mining_planner.refresh_room_mining_plan();
		reports.report_creep_makes();
	}

};
