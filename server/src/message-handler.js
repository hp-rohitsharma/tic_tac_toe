let ongoingGames = {};
let ongoingGamesVsComputer = {};

let computer = require('./computer');
let common = require('./common');

exports.messageHandler = function(message, request, userRepo, connectionRepo) {			
	var obj = JSON.parse(message.utf8Data);

	if(obj.otherPlayer === 'computer' || ongoingGamesVsComputer[request.remoteAddress]) {

		if(obj.type === 'challenge') {		
			ongoingGamesVsComputer[request.remoteAddress] = {
				moves : [],
				sequenceOfMoves : [],
				isFirst : false
			};		
			// computer starts with O
			connectionRepo[request.remoteAddress].sendUTF(JSON.stringify({			
				type: 'start',
				symbol:'X'	
			}));

			/*
			let moveObj = computer.bestMove(computer.getRoot(), []);
			ongoingGamesVsComputer[request.remoteAddress].moves.push(moveObj);
			ongoingGamesVsComputer[request.remoteAddress].sequenceOfMoves.push(moveObj.move);

			let data = {};
			data[moveObj.move] = 'O';
			connectionRepo[request.remoteAddress].sendUTF(JSON.stringify({			
				type: 'move',
				data: data,
				'status': ''		
			}));*/

		} else if(obj.type === 'move') {
			
			let _status = common.gameStatus(obj.data, obj.id);		

			if(_status === 'won') {
				connectionRepo[request.remoteAddress].sendUTF(JSON.stringify({			
					type: 'move',
					data: obj.data,
					'status': _status			
				}));

				computer.learnFromGame(ongoingGamesVsComputer[request.remoteAddress].sequenceOfMoves, !ongoingGamesVsComputer[request.remoteAddress].isFirst);
			} else {

				function nextComputerMove(lastMoveByCom, sequenceOfMoves) {					
					let possibleMovesOfOtherPlayer = lastMoveByCom.children;
					if(possibleMovesOfOtherPlayer) {
						let otherPlayerMove = possibleMovesOfOtherPlayer[obj.id];						
						return computer.bestMove(otherPlayerMove, sequenceOfMoves);
					} else {
						return computer.bestMove(lastMoveByCom, sequenceOfMoves);
					}						
				}

				let playedMoves = ongoingGamesVsComputer[request.remoteAddress].moves;
				let moveObj = null;
				if(playedMoves.length > 0) {
					let lastMoveByCom = playedMoves[playedMoves.length - 1];
					moveObj = nextComputerMove(lastMoveByCom, obj.data);
				} else {
					moveObj = nextComputerMove(computer.getRoot(), obj.data);
				}
				
				ongoingGamesVsComputer[request.remoteAddress].sequenceOfMoves.push(obj.id); // last move by other
				ongoingGamesVsComputer[request.remoteAddress].moves.push(moveObj);
				ongoingGamesVsComputer[request.remoteAddress].sequenceOfMoves.push(moveObj.move); // current computer move
				obj.data[moveObj.move] = 'O';

				connectionRepo[request.remoteAddress].sendUTF(JSON.stringify({			
					type: 'move',
					data: obj.data,
					'status': ''		
				}));
								
				let _status = common.gameStatus(obj.data, moveObj.move);		

				if(_status === 'won') {
					connectionRepo[request.remoteAddress].sendUTF(JSON.stringify({			
						type: 'move',
						data: obj.data,
						'status': 'lost'			
					}));
					computer.learnFromGame(ongoingGamesVsComputer[request.remoteAddress].sequenceOfMoves, ongoingGamesVsComputer[request.remoteAddress].isFirst);
				}					
			}	
		}
	} else {

		if(obj.type === 'challenge'){
			connectionRepo[obj.otherPlayer].sendUTF(JSON.stringify({			
				type: 'challenged',
				challenger: userRepo[request.remoteAddress].user			
			}));
			ongoingGames[request.remoteAddress] = obj.otherPlayer;
			ongoingGames[obj.otherPlayer] = request.remoteAddress;
		} else if(obj.type === 'move') {
			
			let _status = common.gameStatus(obj.data, obj.id);
			// other player
			connectionRepo[ongoingGames[request.remoteAddress]].sendUTF(JSON.stringify({			
				type: 'move',
				data: obj.data,
				'status': _status === 'won' ? 'lost' : ''		
			}));
			
			if(_status === 'won') {
				connectionRepo[request.remoteAddress].sendUTF(JSON.stringify({			
					type: 'move',
					data: obj.data,
					'status': _status			
				}));
			}					
		} else if(obj.type === 'challenge_accepted') {		
			connectionRepo[ongoingGames[request.remoteAddress]].sendUTF(JSON.stringify({			
				type: 'start',
				symbol:'O'				
			}));
			connectionRepo[request.remoteAddress].sendUTF(JSON.stringify({			
				type: 'start',
				symbol:'X'	
			}));
			
			// publish updated listStyle 
			let playersInfo = availablePlayers(userRepo);
			for (var connectionId in connectionRepo) {			
				if(!connectionRepo.hasOwnProperty(connectionId)) continue;			
				connectionRepo[connectionId].sendUTF(JSON.stringify({			
					type: 'players',
					players: playersInfo			
				}));					
			}	     	   
		} else if(obj.type === 'challenge_rejected') {		
			connectionRepo[ongoingGames[request.remoteAddress]].sendUTF(JSON.stringify({			
				type: 'rejected'			
			}));
			let second = ongoingGames[request.remoteAddress];
			delete ongoingGames[second];
			delete ongoingGames[request.remoteAddress];
		}	
	}
}

exports.isPlaying = function(id) {
	return isPlaying(id);
}

exports.removePlayer = function(id) {	
	let second = ongoingGames[id];
	delete ongoingGames[second];
	delete ongoingGames[id];	
}

function _gameStatus(data, id) {
	
	//let cache = [][];
	/*function check(x,y, _char, depth ) {
	
		if(depth === 3)	{
			return 'won';
		}
		
		
		let left = data[]
	}
	
	let x = id.charAt(0);
	let y = id.charAt(1);
	
	return check(x,y, data[id], 1);
	*/
}

function isPlaying(id) {
	return ongoingGames[id] ? true: false;
}

function availablePlayers(userRepo) {
	let playersInfo = [];
   
	for (var item in userRepo) {			
		if(!userRepo.hasOwnProperty(item)) continue;		
		if(isPlaying(item)) continue;
		
		let playerInfo = {
		   id : item,
		   name : userRepo[item].user
		}
		playersInfo.push(playerInfo);
	}
	return playersInfo;
}
