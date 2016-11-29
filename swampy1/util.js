

function getRandomInt(min, max)
{
    min = Math.ceil(min);
    max = Math.floor(max);  
    return Math.floor(Math.random() * (max - min)) + min;
}

function getRandomName()
{
	let ret = "";
	return ret;

	let hex = "01234567890ABCDEF";
	let rando = getRandomInt(0x1000000, 0xFFFFFFF);
	for(let x = 0; x < 7; ++x)
	{
		let cho = rando % 16;
		ret += hex[cho];
		rando = rando / 16;
	}
	return ret;

    
}

module.exports = 
{
	getRandomInt : getRandomInt,
	getRandomName : getRandomName
};

