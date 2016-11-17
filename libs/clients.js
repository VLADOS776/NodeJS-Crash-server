var WebSocketServer = new require("ws");
var Crash          = new require("./crash");
var config          = new require("./config");

var clients = {};

var PONG = {type: 'pong'};

function newClient(ws) {
    var id = Math.random();
    clients[id] = ws;
    
    var firstConnect = {
        server: true,
        type: 'first-connect',
        id: id,
        status: Crash.gameStart,
        time: Crash.timeToStart(),
        multiply: Crash.multiply,
        bets: Crash.bets,
        history: Crash.history
        /*lastGames: double.lastNumbers(),
        rollTime: double.getNextRoll(),
        rolling: double.status(),
        bets: double.bets()*/
    }
    ws.send(JSON.stringify(firstConnect));
    
    console.log("New connection: "+id);
    
    onlineChanged();
    
    ws.on('message', function(message){
        newMessage(message)
    });
    ws.on('close', function(){
        close(id)
    });
    
    function newMessage(message) {
        console.log(message);
        var message = JSON.parse(message);

        switch (message.type) {
            case 'cashOut':
                Crash.cashOut(message);
                break;
            case 'addBet':
                if (!Crash.gameStart) {
                    Crash.newBet(message);
                    //sendToAll(message);
                }
                break;
            case 'ping':
                //ws.send(JSON.stringify(PONG));
                break;
            default:
                sendToAll(message);
        }
    };
};
    
function close(id) {
    console.log('Connection closed: ' + id);
    delete clients[id];
    onlineChanged();
};

function onlineChanged() {
    var msg = {
        server: true,
        type: 'online',
        online: Object.keys(clients).length
    }
    sendToAll(msg);
}

function sendToAll(msg) {
    msg = JSON.stringify(msg);
    for (var key in clients) {
        clients[key].send(msg);
    }
}

module.exports.newClient = newClient;
module.exports.sendToAll = sendToAll;