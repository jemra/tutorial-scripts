

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

module.exports = 
{
	getRandomInt : getRandomInt,
	getRandomName : getRandomName,
};

