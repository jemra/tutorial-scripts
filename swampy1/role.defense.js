"use strict";
const util = require('util');

const notice = util.mk_notice("defense");

// Memory.squads
function _form_new_squad(room_name)
{
	if(!Memory.squads)
		Memory.squads = {};
	let new_squad = {
		"name" : "squad_" + util.getRandomName(),
		"room_name" : room_name,
		"members_needed" : 3,
		"members" : {},
		"target" : null,
		"mode" : "form", // "form", "fight", "rally"
		"rally_point" : {"x" : 20, "y" : 27},
	};
	Memory.squads[new_squad.name] = new_squad;
	let room = Game.rooms[room_name];
	if(room)
	{
		let hostile_buildings = room.find(FIND_HOSTILE_STRUCTURES);
		if(hostile_buildings && hostile_buildings.length > 0)
		{
			let topos = hostile_buildings[0].pos;
			new_squad.rally_point.x = topos.x;
			new_squad.rally_point.y = topos.y;
		}
	}

	notice(`Form new squad ${new_squad.name}`);
	return new_squad;
}

function _squad_run_creep(squad, creep, target)
{
	if(squad.mode === "form" || squad.mode === "rally")
	{
		creep.moveTo( squad.rally_point.x, squad.rally_point.y);
	}
	else
	{
		let result = creep.rangedAttack(target);
		if( result === OK )
		{
		}
		else if(creep.rangedAttack(target) === ERR_NOT_IN_RANGE) {
			creep.moveTo(target);
		}
		else
		{
			notice(`War Fail ${creep.name}.rangedAttack = ${result}`);
		}
	}
}

function _try_insert_creep_to_squad(creep, squad)
{
	if( squad.room_name != creep.pos.roomName )
		return false;
	if( Object.keys(squad.members).length >= squad.members_needed )
		return false;
	notice(`Added ${creep.name} to ${squad.name}`);
	squad.members[creep.name] = creep.name;
	creep.memory.belongs_to_squad = squad.name;
	return true;
}
function _remove_creep_from_squad(creep_name, squad)
{
	let creep_mem = Memory.creeps[creep_name];
	if( !squad && creep_mem)
		if(creep_mem.belongs_to_squad)
			squad = Memory.squads[creep_mem.belongs_to_squad];
	notice(`Remove ${creep_name} from ${squad ? squad.name : "missing squad"}`);
	if(squad)
		delete squad.members[creep_name];
	if(creep_mem)
		delete creep_mem.belongs_to_squad;
}
function _delete_squad(squad)
{
	notice(`Decommission squad ${squad.name}`);
	for(let name in squad.members)
	{
		_remove_creep_from_squad(name, squad);
	}
	delete Memory.squads[squad.name];
}

function _plan_squad(squad_name, enemies)
{
	//garbage collect dead creeps
	let squad = Memory.squads[squad_name];
	for( let name in squad.members)
		if(null == Game.creeps[name])
			_remove_creep_from_squad(name, squad);
	let squad_size = Object.keys(squad.members).length;

	if( squad.mode === "form" )
	{
		if( squad_size < squad.members_needed )
			return;
		notice(`Squad ${squad.name} has completed all ${squad_size} members of ${squad.members_needed} needed`);
		squad.mode = "rally";
	}

	if( squad_size < 1 )
	{
		_delete_squad(squad);
		return;
	}


	if( squad.mode === "rally" )
	{
		if(enemies.length > 0)
		{
			squad.mode = "fight";
			squad.target = enemies[0].id;
			notice(`Squad ${squad.name} to Fight ${squad.target}`);
			return;
		}
	}
	if( squad.mode === "fight" )
	{
		if( enemies.length === 0 )
			squad.mode = "rally";
		else 
		{
			//let real_target = Game.getObjectById(squad.target);
			if( !Game.getObjectById(squad.target) )
			{
				squad.target = enemies[0].id;
				//real_target = Game.getObjectById(squad.target);
			}
		}

	}
}

function plan_all_squads()
{
	if(!Memory.squads)
		Memory.squads = {};
	var enemies_map = {};
	for(let name in Memory.squads)
	{
		let squad = Memory.squads[name];
		var enemies = enemies_map[squad.room_name];
		if(!enemies)
		{
			let hostile_creeps = Game.rooms[squad.room_name].find(FIND_HOSTILE_CREEPS);
			let hostile_structures = [];//Game.rooms[squad.room_name].find(FIND_HOSTILE_STRUCTURES);
			enemies = enemies_map[squad.room_name] = [].concat(hostile_creeps,hostile_structures);
		}
		_plan_squad(name, enemies);
	}
}

function run_roleDefense(creep)
{
	if(!creep.memory.belongs_to_squad || !Memory.squads[creep.memory.belongs_to_squad])
	{
		creep.memory.belongs_to_squad = null;
		for(let name in Memory.squads)
		{
			if( _try_insert_creep_to_squad(creep, Memory.squads[name]) )
				break;
		}
		if( ! creep.memory.belongs_to_squad )
		{
			let newsquad = _form_new_squad(creep.pos.roomName);
			_try_insert_creep_to_squad(creep, newsquad);
		}
	}

	if(creep.memory.belongs_to_squad)
	{
		let squad = Memory.squads[creep.memory.belongs_to_squad];
		let target = Game.getObjectById(squad.target);
		_squad_run_creep(squad, creep, target);
	}
	else
	{
		notice("Could not assign creep ${creep.name} to any squadron!!!");
	}
}

module.exports = {
	plan_all_squads : plan_all_squads,
	run : run_roleDefense,
};

