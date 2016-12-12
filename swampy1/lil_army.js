"use strict";
const util = require("util");

let notice = function(textinfo)
{
    console.log("lil " + textinfo);
};



let _army_composition = 
[
    {"model":"baby_harvester", "count" : 2},
    {"model":"baby_builder", "count": 1},
    {"model":"baby_upgrader", "count" : 1},
    {"model":"baby_harvester", "count" : 5},
    {"model":"baby_harvester", "count" : 12, "min_energy_class":550},
    {"model":"killbot", "count" : 9},
];

let models = 
{
    "baby_builder" : {
        "body" : [MOVE,WORK,CARRY],
        "role" : "builder",
		"prefix" : "bbldr_"
    },
    "baby_harvester" : {
        "body" : [MOVE,WORK,CARRY,CARRY,CARRY,MOVE,WORK,CARRY,MOVE,CARRY,CARRY,CARRY],
        "role" : "harvester",
		"prefix" : "bharv_"
    },
    "baby_upgrader" : {
        "body" : [MOVE,WORK,CARRY],
        "role" : "upgrader",
		"prefix" : "bupgd_"
    },
	"killbot" : {
        "body" : [	TOUGH, MOVE, MOVE, RANGED_ATTACK ],
        "role" : "defense",
		"min_energy" : 500,
		"prefix" : "bkill_",
		"build" : function(energy)
		{
			//proportions of TOUGH=10, MOVE=50, RANGED_ATTACK=150
			//  for every 400, make: 5 tough, 4 move, 1 RA 
			let bwant = {
				"ranged_attack" : parseInt(energy / 400),
				"move" : parseInt(energy / 100),
				"tough" : parseInt(energy / 80)
			};
			if(bwant[RANGED_ATTACK] < 1)
				bwant[RANGED_ATTACK] = 1;
			let bmap = { "ranged_attack":0, "move":0, "tough":0};
			for( let adding_part in {ranged_attack:1, move:1, tough:1} )
			{
				for(let x = 0; x < bwant[adding_part]; ++x )
				{
					if( energy >= BODYPART_COST[adding_part])
					{
						bmap[adding_part] += 1;
						energy -= BODYPART_COST[adding_part];
					}
					else
						break;
				}
			}
			let ret_body = [];
			for( let adding_part in {tough:1, move:1, ranged_attack:1} )
			{
				for(let x=0; x< bmap[adding_part]; ++x)
					ret_body.push(adding_part);
			}
			return ret_body;
		}
	}
};

function _make_creep(model, spawn_name, energy_to_consume)
{
    let modl = models[model];
	let body_spec = [];
	let at_ndx = 0;
	let mx_ndx = modl.body.length; 
	let getpart = at_ndx => modl.body[at_ndx];
	let part = getpart(at_ndx);
	let energy_used = 0;
	if( modl.build != null )
	{
		body_spec = modl.build(energy_to_consume);
		energy_used = energy_to_consume;//TODO: do better
	}
	else
	{
		while(energy_to_consume >= BODYPART_COST[part])
		{
			energy_to_consume -= BODYPART_COST[part];
			energy_used += BODYPART_COST[part];
			body_spec.push(part);
			at_ndx = (at_ndx + 1) % mx_ndx;
			part = getpart(at_ndx);
		}
	}
    
	let why_not_can = Game.spawns[spawn_name].canCreateCreep(body_spec);
    if( 0 !== why_not_can )
	{
		if( why_not_can !== -6)
			notice( `Failed to spec build ${body_spec.join(",")} : ${why_not_can}}` );
        return;
	}
    let newname = modl.prefix + util.getRandomName();
    notice("Making a \"" + model + "\" " + newname + ` (${energy_used})`);
	//notice("  spec = " + body_spec.join(","));
    let ret = Game.spawns[spawn_name].createCreep(body_spec, newname, {role:modl.role, model:model, cost:energy_used});
    if(ret < 0)
    {
        notice("Failed to make a \"" + model + "\" " + newname + " "+ ret + ` (${energy_used})`);
    }
    return ret;
}

function next_missing(inventory, energy)
{
    for(let x=0; x<_army_composition.length; ++x )
    {
        let spec = _army_composition[x];
		if( !Memory.max_energy || (spec.min_energy_class && spec.min_energy_class > Memory.max_energy)  )
			break;
        let cur_count = inventory[spec.model];
        let min_energy_needed = models[ spec.model ].min_energy;
        if( cur_count < spec.count &&
		  	(null == min_energy_needed || energy >= min_energy_needed))
        {
            return spec.model;
        }
    }
    return null;
}

function compute_inventory()
{
    let ret = {};
    for(let modl in models)
        ret[modl] = 0;
    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        if(creep.memory.model)
            ret[creep.memory.model] ++;
    }
//console.log(JSON.stringify(ret));
    return ret;
}

function one_run(spawn_name)
{
    if(Game.spawns[spawn_name].spawning)
        return;//busy now

	for(let name in Memory.creeps)
	{
		if(!Game.creeps[name]) {
			delete Memory.creeps[name];
			//console.log('Clearing non-existing creep memory:', name);
		}
	}

	let energy_to_consume = Game.spawns[spawn_name].room.energyCapacityAvailable;
	let energy_available = Game.spawns[spawn_name].room.energyAvailable;
	let num_my_creeps = Object.keys(Game.creeps).length;

	if( Memory.max_energy !== energy_to_consume)
	{
		Memory.max_energy = energy_to_consume;
		console.log(`Energy Class updated to ${Memory.max_energy}`);
	}

	if( num_my_creeps === 0 )
	{
		if(energy_available >= 300)
			_make_creep("baby_harvester", spawn_name, energy_available);
		return;
	}
	else if( num_my_creeps < 6 )
	{
		if(energy_available >= 300)
			energy_to_consume = energy_available;
	}

    let inv = compute_inventory();
    let needed = next_missing(inv, energy_to_consume);
    if(needed)
        _make_creep(needed, spawn_name, energy_to_consume);
}

module.exports = {
    one_run : one_run,
	make_creep : _make_creep
};

