var WebSocketServer = new require("ws");
var Crash          = new require("./crash");
var config          = new require("./config");

var clients = {};

var PONG = {type: 'pong'};

function newClient(ws) {
    var id = Math.random().toString(36).slice(2);
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
        var message = JSON.parse(message);

        switch (message.type) {
            case 'cashOut':
                Crash.cashOut(message);
                break;
            case 'addBet':
                if (!Crash.gameStart) {
                    Crash.newBet(message);
                }
                break;
            case 'ping':
                //ws.send(JSON.stringify(PONG));
                break;
            case 'message':
                sendToAll(message);
            default:
                console.log(message);
        }
    };
};
    
function close(id) {
    console.log('Connection closed: ' + id);
    try{
        clients[id].destroy();
    } catch(e){}
    clients[id] = null;
    delete clients[id];
    onlineChanged();
};

function onlineChanged() {
    var onlineCount = 0;
    for (var key in clients) {
        if(clients[key].readyState == 1)
            onlineCount++;
    }
    var msg = {
        server: true,
        type: 'online',
        online: onlineCount
    }
    sendToAll(msg);
}

function sendToAll(msg) {
    msg = JSON.stringify(msg);
    for (var key in clients) {
        if (clients[key].readyState == 1)
            clients[key].send(msg);
    }
}

module.exports.newClient = newClient;
module.exports.sendToAll = sendToAll;