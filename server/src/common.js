let winningPosibilities = {
	11 : [[12, 13], [21,31], [22,33]],
	12 : [[22, 32], [11,13]],
	13 : [[11, 12], [22,31], [23,33]],
	21 : [[11, 31], [22,23]],
	22 : [[11, 33], [12,32], [13,31]],
	23 : [[13, 33], [21,22]],
	31 : [[11, 21], [22,13], [32,33]],
	32 : [[31, 33], [22,12]],
	33 : [[31, 32], [11,22], [13,23]],
}

exports.gameStatus = function (data, id) {
	let _char = data[id];
    let won = false;  
	winningPosibilities[id] && winningPosibilities[id].forEach(function(item) {
        let found = true;		       
		item.forEach(function(_item) {
			if(data[_item] !== _char) {
				found = false;				
			}
		});	
		if(found) won = true;		
	});
	if(won) return 'won';		
}