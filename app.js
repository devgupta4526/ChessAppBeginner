const express = require('express')
const socket = require('socket.io')
const http = require('http')
const {Chess} = require('chess.js');
const path = require('path');

const app = express();

const server = http.createServer(app);

const io = socket(server);

const chess = new Chess();

let player = {}
let currentPlayer = 'w'

app.set('view engine' , 'ejs')
app.use(express.static(path.join(__dirname,"public")))

io.on("connection",function(uniquesocket){
    console.log("connected to backend")

    if(!player.white){
        player.white = uniquesocket.id;
        uniquesocket.emit('playerRole','w');
    }
    else if(!player.black){
        player.black = uniquesocket.id;
        uniquesocket.emit('playerRole','b');
    }
    else{
        uniquesocket.emit('spectatorRole');
    }


    uniquesocket.on("disconnect",function(){
        if(uniquesocket.id == player.white){
            delete player.white;
        }
        else if(uniquesocket.id == player.black){
            delete player.black;
        }
        
    });

    uniquesocket.on("move", (move) => {
        try{
         if(chess.turn() === 'w' && uniquesocket.id !== player.white) return;
         if(chess.turn() === 'b' && uniquesocket.id !== player.black) return;

         const result = chess.move(move);
         if(result){
            currentPlayer = chess.turn()
            io.emit("move",move)
            io.emit("boardstate",chess.fen())

         }
         else{
            console.log("Invalid Move: " , move)
            uniquesocket.emit("invalid move", move)

         }

        }
        catch(err){
            console.log(err);
            uniquesocket.emit("invalid move", move)
        }
    });
})


app.get('/',(req, res) =>{
    res.render("index")
})

server.listen(3000,()=>{
    console.log("Server is started!!!!")
})
