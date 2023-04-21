const currentTurn = document.getElementById('current-turn');
const client = document.getElementById('clientId');
const winner = document.getElementById('winnerId')
const popup = document.getElementById('popup');

const socket = io();

const token = {
    1: 'cross',
    2: 'circle'
}
let clientId;
let activeId;

socket.on('clientId', function (idPlayer) {
    clientId = idPlayer;
    console.log(clientId);
})

socket.on('start', function (startId) { 
    activeId = startId;
    currentTurn.classList.remove('hide');
    client.innerHTML = clientId == activeId ? 'your' : 'not your';
})

socket.on('continue', function (active, field) {
    activeId = active;
    for (let x = 0; x < field.length; x++) {
        for (let y = 0; y < field.length; y++) {
            setField(x, y, field[x][y]);
        }
    }
    currentTurn.classList.remove('hide');
    client.innerHTML = clientId == activeId ? 'your' : 'not your';
})

socket.on('turn', function (turn) {
    setField(turn.x,turn.y,activeId);
    activeId = turn.next;
    client.innerHTML = clientId == activeId ? 'your' : 'not your';
})

socket.on('result', function (result) {
    const winnerId = result['id']
    if(winnerId !== 0 ){
        winner.innerHTML = clientId == winnerId ?'won' : 'lost';
    }else{
        winner.innerHTML = 'draw';
    }
    
    socket.disconnect();
   
    popup.classList.remove('hide') ;
    currentTurn.classList.add('hide');
})

function getField(x, y) {
    return document.getElementById(`x${x}y${y}`)
};

function setField(x, y, id) {
    const field = getField(x, y);
    field.classList.add(`${token[id]}`);
    console.log(field);
}

function turn(x, y) {
    if (activeId != clientId) return;
    if (getField(x, y).classList.contains(token[1])
        || getField(x, y).classList.contains(token[2])) {
        return;
    }
    console.log('send');
    socket.emit('turn',{
        'x':x,
        'y':y
    });
}

function restart(){
    window.location.reload();
}
