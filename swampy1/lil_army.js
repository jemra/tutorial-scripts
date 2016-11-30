const util = require("util");

let notice = function(textinfo)
{
    console.log("lil " + textinfo)
}


let _BODYPART_COST =
{
	"move": 50,
	"work": 100,
	"attack": 80,
	"carry": 50,
	"heal": 250,
	"ranged_attack": 150,
	"tough": 10,
	"claim": 600
};

let _army_composition = 
[
    {"model":"baby_harvester", "count" : 6},
    {"model":"baby_builder", "count": 3},
    {"model":"baby_upgrader", "count" : 3}
];

let models = 
{
    "baby_builder" : {
        "body" : [MOVE,WORK,CARRY,WORK],
        "role" : "builder",
		"prefix" : "bbldr_"
    },
    "baby_harvester" : {
        "body" : [MOVE,MOVE,WORK,CARRY,CARRY],
        "role" : "harvester",
		"prefix" : "bharv_"
    },
    "baby_upgrader" : {
        "body" : [MOVE,CARRY,WORK,WORK],
        "role" : "upgrader",
		"prefix" : "bupgd_"
    }
};

function _make_creep(model, spawn_name)
{
    let modl = models[model];
	let body_spec = [];
	let energy_to_consume = Game.spawns[spawn_name].room.energyCapacityAvailable;
	let at_ndx = 0;
	let mx_ndx = modl.body.length; 
	let getpart = at_ndx => modl.body[at_ndx];
	let part = getpart(at_ndx);
	let energy_used = 0;
	
	while(energy_to_consume >= _BODYPART_COST[part])
	{
		energy_to_consume -= _BODYPART_COST[part];
		energy_used += BODYPART_COST[part];
		body_spec.push(part);
		at_ndx = (at_ndx + 1) % mx_ndx;
		part = getpart(at_ndx);
	}
    
    if( 0 != Game.spawns[spawn_name].canCreateCreep(body_spec) )
        return;

    let newname = modl.prefix + util.getRandomName();
    notice("Making a \"" + model + "\" " + newname + ` (${energy_used})`);
    let ret = Game.spawns[spawn_name].createCreep(body_spec, newname, {role:modl.role, model:model});
    if(ret < 0)
    {
        notice("Failed to make a \"" + model + "\" " + newname + " "+ ret + ` (${energy_used})`);
    }
    return ret;
}

function next_missing(inventory)
{
    for(let x=0; x<_army_composition.length; ++x )
    {
        let spec = _army_composition[x];
        let cur_count = inventory[spec.model];
        if( cur_count < spec.count )
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
        
    let inv = compute_inventory();
    let needed = next_missing(inv);
    if(needed)
        _make_creep(needed, spawn_name);
}

module.exports = {
    one_run : one_run
};

