var webSocketServer = require('websocket').server;

var clients = [];

let userRepo = require('./repo');
let handler = require('./message-handler');

let connectionRepo = {};

exports.init = function (httpServer) {
   
    var wsServer = new webSocketServer({        
        httpServer: httpServer
    });

    wsServer.on('request', function (request) {
		var connection = request.accept(null, request.origin);
		connectionRepo[connection.remoteAddress] = connection;
		
	    let playersInfo = [];
	   
		playersInfo.push({
			id : 'computer',
			name : 'Computer'
		 });

	    for (var item in userRepo) {			
			if(!userRepo.hasOwnProperty(item)) continue;
			if(item === connection.remoteAddress) continue;
			if(handler.isPlaying(item)) continue;
			
			let playerInfo = {
			   id : item,
			   name : userRepo[item].user
		    }
		    playersInfo.push(playerInfo);
		}			
	     	   
		connection.sendUTF(JSON.stringify({			
			type: 'players',
			players: playersInfo			
		}));
				
        // user sent some message
        connection.on('message', function (message) {            
			handler.messageHandler(message, request, userRepo, connectionRepo);
            connection.sendUTF(JSON.stringify({ data: userRepo[request.remoteAddress].user}));            
        });

        // user disconnected
        connection.on('close', function () {           
			delete connectionRepo[connection.remoteAddress];
			handler.removePlayer(connection.remoteAddress);       
        });
    });

}
