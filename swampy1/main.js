var roleHarvester = require('role.harvester');
var roleDefense = require('role.defense');
var lil_army = require('lil_army');
var reports = require('reports');
var mining_planner = require('mining_planner');


roleHarvester.init(mining_planner);


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

	if( null == Memory.mining_map || null == Memory.mining_map[cur_room_name] )
	{
		//one time only?
		mining_planner.analyze_room(cur_room_name);
	}

	//War:
	roleDefense.plan_all_squads();

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
		else
		{
			var injured_creeps = room.find( FIND_MY_CREEPS, {filter: (creep)=> creep.hits<creep.hitsMax});

			if(injured_creeps && injured_creeps.length > 0)
				tower.heal(injured_creeps[0]);
		}
    }
	else
	{
		cur_room.createConstructionSite(21, 25,  STRUCTURE_TOWER);
	}


	mining_planner.refresh_room_mining_plan(cur_room_name);
    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
		if(creep.spawning)
			continue;
        if(creep.memory.role == 'harvester') {
            roleHarvester.run(creep);
        }
		else if(creep.memory.role == 'upgrader') {
            roleHarvester.run(creep);
        }
		else if(creep.memory.role == 'builder') {
            roleHarvester.run(creep);
        }
		else if(creep.memory.role == 'defense') {
            roleDefense.run(creep);
        }
    }

	if((Game.time % 25) === 0)
	{
		reports.report_creep_makes();
	}

};
//
