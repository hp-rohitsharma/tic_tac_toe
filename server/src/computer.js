let common = require('./common');
var fs = require('fs');

function Node() {
    this.won = 0;
    this.move = '';
    this.children = {};
    this.winningChance = 0;
    this.lost = 1;      
}

let rawdata = fs.readFileSync('./memory.json');  
let memory = JSON.parse(rawdata); 

exports.getRoot = function () {
   return memory;
}

function _bestMove(node, sequenceOfMoves) {    
    if(node && node.children) {
        let possibleMoves = node.children;
        let bestMove;
        let bestWinningChance = 0;
        for (move in possibleMoves) {
            if(possibleMoves.hasOwnProperty(move)) {
                if((possibleMoves[move].won/possibleMoves[move].lost) >= bestWinningChance) {
                    bestMove = possibleMoves[move];
                    bestWinningChance = possibleMoves[move].won/possibleMoves[move].lost;
                }
            }
        }
        if(bestWinningChance === 0) {
            return randomMove(sequenceOfMoves);
        } else {
            return bestMove;
        }        
    } else {
        return randomMove(sequenceOfMoves);
    }
}

exports.bestMove = function (node, sequenceOfMoves) {
    return _bestMove(node, sequenceOfMoves);    
}

function getAvailableOptions(playedMoves, options) {  
    let availableOptions = [];
    options.forEach((item)=>{
        if(!playedMoves[item]) {
            availableOptions.push(item);
        }
    });    
    return availableOptions;
}

function randomMove(playedMoves) {
    let options = [11,12,13,21,22,23,31,32,33];
    let availableOptions = getAvailableOptions(playedMoves, options);
    let index = Math.floor(Math.random() * (availableOptions.length));   
   // console.log(index);
    let move = availableOptions[index];
    let node = new Node();
    node.move = move;
    return node;
}

exports.learnFromGame = function(sequenceOfMoves, firstPlayerWon) {

    _learnFromGame(sequenceOfMoves, firstPlayerWon, memory);   
    fs.writeFileSync('./memory.json' , JSON.stringify(memory));
}

function _learnFromGame(sequenceOfMoves, firstPlayerWon, memory) {
    
    let even = true;
    let current = memory.children;

    sequenceOfMoves.forEach((item) => {        
        let child = current[item];
        if(!child) {
            current[item] = new Node();
            current[item].move = item;
            child = current[item];
        } 
        if(firstPlayerWon) {
            if(even) { 
                child.won = child.won + 1;
            } else {
                child.lost = child.lost + 20000;
            }
        } else {
            if(!even) { 
                child.won = child.won + 1;
            } else {
                child.lost = child.lost + 20000;
            }
        }
        even = !even; 
        current = child.children;       
    });

    memory.practices = memory.practices + 1;
}

exports.practice = function(practiceCount) {

    //memory = JSON.parse(fs.readFileSync('./memory.json')); 

    let rawdata = fs.readFileSync('./memory.json');  
    let _memory = JSON.parse(rawdata);  

    for(let i = 0; i < practiceCount; i++) {
        let sequenceOfMoves = [];
        let even = true;
        let playedMoves = {};
        let playedMovesCount = 0;

        while(true) {
           
            let moveObj = randomMove(playedMoves);
            playedMoves[moveObj.move] = even ? 'x' :'o';
            playedMovesCount++;

            sequenceOfMoves.push(moveObj.move);            
            let _status = common.gameStatus(playedMoves,moveObj.move);

            if(_status === 'won') {
                let firstPlayerWon = false;
                if(even) {
                    firstPlayerWon = true;
                }
                
                _learnFromGame(sequenceOfMoves, firstPlayerWon, _memory);
                break;
            }

            if(playedMovesCount === 9) {
                break;
            }
            even = !even;
        }
    } 
    
    fs.writeFileSync('./memory.json' , JSON.stringify(_memory));
   
}