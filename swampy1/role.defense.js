"use strict";
const util = require('util');

var roleDefense = {

    /** @param {Creep} creep **/
    run: function(creep) {

		var enemies = creep.room.find(FIND_HOSTILE_CREEPS);
		if(enemies.length > 0)
		{
			util.set_doing_state(creep, "fight");

			if(creep.attack(enemies[0]) === ERR_NOT_IN_RANGE) {
				creep.moveTo(enemies[0]);
			}
		}
		else
		{
			util.set_doing_state(creep, "lurk");
		}
	}
};

module.exports = roleDefense;

