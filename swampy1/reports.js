const util = require("util");

function report_creep_makes()
{
	var toprint = [];
    for(var name in Game.creeps) {
        var creep = Game.creeps[name];

		let Crpname = creep.name;
		let role = creep.memory.role;
		let model = creep.memory.model;
		let body = {};
		let body_str = [];
		for(let part_no in creep.body)
		{
			let part = creep.body[part_no];
			if(null == body[part.type])
				body[part.type] = 1;
			else
				++ body[part.type];
		}
		let energy_rating = 0;
		for(let part in body)
		{
			energy_rating += BODYPART_COST[part] * body[part];
			body_str.push(`${part}: ${body[part]}`)
		}

		energy_rating = parseInt(energy_rating);
		body_str = body_str.join(", ");

		toprint.push({Crpname:Crpname, energy_rating:energy_rating, role:role, model:model, body_str:body_str});
    }
	//sort by type, energy
	toprint = toprint.sort( (a,b) => 
		{
			let res = a.model.localeCompare(b.model);
			if(res)
				return res;
			return a.energy_rating - b.energy_rating
		});
	//print
	for( let ndx in toprint)
	{
		let trp = toprint[ndx];
		console.log(`${trp.Crpname} [${trp.energy_rating}] ${trp.role} ${trp.model} (${trp.body_str})`);
	}
}

module.exports =
{
report_creep_makes : report_creep_makes,
};
