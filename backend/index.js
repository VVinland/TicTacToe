import path from 'path';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { Field } from './components/field.js'

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 1337;
const __dirname = path.resolve();

const field = new Field();
const players = {
    1: '',
    2: ''
}
let started = false;
let activePlayer = 1;
let gameOver = false;

app.use('/frontend', express.static(path.resolve(__dirname, 'frontend')))
app.set('view engine', 'ejs');

app.get('/', function (req, res) {
    res.render('index');
})
io.on('connection', function (socket) {
    if (io.sockets.sockets.size > 2) {
        console.log('No place. Expect')
        socket.disconnect();
    }
    console.log('User connect')
    const socketIdPlayer = socket.id;
    joinPlayers(socketIdPlayer);
    console.log(players);
    const idPlayer = getKeyByValue(players, socketIdPlayer);
    console.log(idPlayer);
    socket.emit('clientId', idPlayer)

    if (io.sockets.sockets.size === 2 && !started) {
        started = true;
        io.emit('start', activePlayer);
        console.log('Match started')
    }

    if (started) {
        socket.emit('continue', activePlayer, field.getField())
        console.log('send continue')
        console.log(field.getField())
    }

    socket.on('turn', function (turn) {
        console.log(`Turn by ${idPlayer}: ${turn.x}, ${turn.y}`);
        if (gameOver) return;

        activePlayer = 3 - activePlayer;

        field.setCell(turn.x, turn.y, idPlayer);

        io.emit('turn', {
            'x': turn.x,
            'y': turn.y,
            'next': activePlayer
        });
        console.log('turn')
        const result = field.checkGameOver(idPlayer);
        gameOver = result['result'];
        if (gameOver) {
            console.log(result['id'] != 0 ? `Game over! The winner is player ${idPlayer}` : `Game over! Draw`)
            io.emit('result', result);
            field.resetField();
            console.log(field);
            started = false;
            gameOver = false;
            activePlayer= 1;
        }
    })

    socket.on('disconnect', () => {
        const player = getKeyByValue(players, socket.id);
        players[player] = '';
        console.log(players)
    })
})

function joinPlayers(clientId) {
    for (const player in players) {
        const currentPlayer = players[player];
        if (currentPlayer === '') {
            players[player] = clientId;
            return;
        }
    }
}

function getKeyByValue(obj, value) {
    return Object.keys(obj).find((key) => obj[key] === value);
}

server.listen(PORT);
