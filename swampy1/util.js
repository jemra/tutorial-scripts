

function getRandomInt(min, max)
{
    min = Math.ceil(min);
    max = Math.floor(max);  
    return Math.floor(Math.random() * (max - min)) + min;
}

function getRandomName()
{
	let ret = "";

	let hex = "01234567890ABCDEF";
	let rando = getRandomInt(0x1000000, 0xFFFFFFF);
	for(let x = 0; x < 7; ++x)
	{
		let cho = parseInt(rando % 16);
		//console.log(`||| x = ${x} cho = ${cho} hex=${hex.charAt(cho)}`);
		ret += hex.charAt(cho);
		rando = rando / 16;
	}
	return ret;
}

let XXXBODYPART_COST =
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

function set_doing_state(creep, state)
{
	if(creep.memory.doing_state != state)
	{
		creep.say(`${state}!`);
	}
	creep.memory.doing_state = state;
}

function qPosDist(p1,p2)
{
	let xdist = p2.x - p1.x;
	let ydist = p2.y - p1.y;
	return xdist*xdist + ydist*ydist;
}

//TODO: make it an obj with level, (0=off, 3=info, 1=error, 2=warning, 4=debug, 5=uper_debug)
let mk_notice = function(domain)
{
	let prefix = domain + " ";
	return function(textinfo)
	{
		console.log(prefix + textinfo);
	};
};


module.exports = 
{
	getRandomInt : getRandomInt,
	getRandomName : getRandomName,
	set_doing_state : set_doing_state,
	qPosDist : qPosDist,
	mk_notice : mk_notice
};

