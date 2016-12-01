"use strict";
const util = require('util');

const notice = util.mk_notice("mining_planner");

// Memory.mining_map

//analyze a given room
function analyze_room(room_name)
{
	if( null == Memory.mining_map)
		Memory.mining_map = {};
	Memory.mining_map[room_name] = {room_name:room_name};
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
	sources = sources.sort((a,b) => a.dis_to_spawn - b.dis_to_spawn);
	sources = sources.map((src) => ({id:src.id, dist:src.dis_to_spawn, harvs:{}}) );
	sources.forEach( (source) => notice(`Source ${source.id} Distance to spawn = ${source.dis_to_spawn}`));
	// plan how many miners per node (more per distance? Path? Road? Etc. start with roundly robins)
	for( let ndx in sources)
	{
		let source = sources[ndx];
		source.required_harvesters = 3;
	}
	let src_map = {};
	sources.map( src => src_map[src.id] = src );
	Memory.mining_map[room_name].sources = src_map;
	return;
}

function dealloc_harv( mining_map, harv_rec )
{
	let on_source_id = harv_rec.assigned_to;
	if(on_source_id)
	{
		//remove from source
		notice(`dealloc harv ${harv_rec.name} from source ${on_source_id}`);
		delete mining_map.sources[on_source_id].harvs[harv_rec.name];
	}
	//remove from map
	notice(`dealloc harv ${harv_rec.name} from map room ${mining_map.room_name}`);
	delete mining_map.harvs[harv_rec.name];
}

//plan room mining
function refresh_room_mining_plan(room_name)
{
	if(!Memory.mining_map || !Memory.mining_map[room_name])
	{
		notice(`Cannot plan for ${room_name}: room analysis not done`);
		return;
	}
	let mine_map = Memory.mining_map[room_name];
	// initialize mining plan if needed
	if( null == mine_map.harvs )
		mine_map.harvs = {};
	else
	{
		// or else garbage collect for dead/missing harvesters
		for(let name in mine_map.harvs)
		{
			if(null == Game.creeps[name])
			{
				notice(`Creep ${name} awol from mining`);
				dealloc_harv(mine_map, mine_map.harvs[name]);
			}
		}
	}
	//allocated harvs are all that is left now
}

function allocate_creep_to_mine(mine_map, creep)
{ 
	let room_name = mine_map.room_name;
	//search through sources for which one has not enough harvies
	let most_needed = null;
	let go_to_source = null;
	for(let source_id in mine_map.sources)
	{
		let source = mine_map.sources[source_id];
		let num_needed = source.required_harvesters - source.harvs.length;
		if( null == go_to_source || num_needed> most_needed)
		{
			most_needed = num_needed;
			go_to_source = source;
		}
	}
	if(!go_to_source)
	{
		notice("Creep ${creep.name} has no source to be allocated to!");
		return null;
	}
	else
	{
		//remove from source
		let harv_rec = {name:creep.name, assigned_to: go_to_source.id};
		notice(`Alloc harv ${creep.name} to source ${go_to_source.id} in room ${room_name}`);
		mine_map.sources[go_to_source.id].harvs[creep.name] = harv_rec;
		mine_map.harvs[creep.name] = harv_rec;
		return go_to_source.id;
	}
}

//request mining target(room, creep)
function request_mining_target(creep)
{
	let room_name = creep.room.name;
	if(! Memory.mining_map || !Memory.mining_map[room_name])
	{
		notice("Creep ${creep.name} has no mining map to be allocated to!");
		return null;
	}
	let mine_map = Memory.mining_map[room_name];
	// if in mining set, return its target
	if( null != mine_map.harvs[creep.name] )
	{
		return mine_map.harvs[creep.name].assigned_to;
	}
	// add to miners set
	// allocate to proper node
	return allocate_creep_to_mine(mine_map, creep);
}

module.exports = 
{
	analyze_room : analyze_room,
	refresh_room_mining_plan : refresh_room_mining_plan,
	request_mining_target: request_mining_target
};

