"use strict";
const util = require('util');
// Memory.mining_map

//analyze a given room
function analyze_room(room_name)
{
	Memory.mining_map = {};
	let room = Game.rooms[room_name];
    var spawn = room.find( FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_SPAWN}})[0];
	let sources = room.find(FIND_SOURCES);
	// find all minable nodes, order by distance 
	for( let ndx in sources)
	{
		// measure distance to spawn, capacity
		let source = sources[ndx];
		source.dis_to_spawn = util.qPosDist(spawn.pos, source.pos);
	}
	sources = sources.sort((a,b) => b.dis_to_spawn - a.dis_to_spawn);
	sources.forEach( (source) => console.log(`Source ${source.id} Distance to spawn = ${source.dis_to_spawn}`));
	Memory.mining_map.sources = sources;
	// plan how many miners per node (more per distance? Path? Road? Etc. start with roundly robins)
	return;
}
//plan room mining
	// initialize mining plan if needed
	// or else garbage collect for dead/missing harvesters
	// 

//request mining target(room, creep)
	// if in mining set, return its target
	// add to miners set
	// allocate to proper node
	// return node

module.exports = 
{
	analyze_room : analyze_room,
};
