var config          = new require("./config");
var players         = new require("./clients");

var tickTimeout = 0,
    raiseInterval = 0;

var Crash = function() {
    //Игроки
    this.players = [];
    
    //Ставки
    this.bets = {};
    
    //Началась ли игра
    this.gameStart = false;
    
    //Множитель, на котором закончится игра
    this.multiply = 0;
    
    //Текущий множитель
    this.currentMultiply = 0;
    
    //Когда сколько начнется игра
    this.nextGame = Date.now() + config.pauseBeforeGame;
    
    //Скорость обновления множителя
    this.speed = 0;
    
    //Предыдущие множители
    this.history = [];
}

Crash.prototype.newGame = function() {
    this.gameStart = false;
    this.nextGame = Date.now() + config.pauseBeforeGame;
    console.log(`New game start in ${this.nextGame}`);
    this.bets = {};
    this.speed = config.startSpeed;
    this.currentMultiply = config.minMultiply;
    var that = this;
    setTimeout(function(){that.start()}, config.pauseBeforeGame);
    players.sendToAll({
        server: true,
        type: 'newGame',
        time: config.pauseBeforeGame
    })
}

Crash.prototype.start = function() {
    this.gameStart = true;
    this.multiply = getRandomMultiply();

    console.log('Crash multiply: '+this.multiply);
    this.raiseMultiply();
    players.sendToAll({
        server: true,
        type: 'gameStart',
    })
    
    this.tick();
}

Crash.prototype.tick = function() {
    if (this.currentMultiply >= this.multiply) {
        clearTimeout(tickTimeout);
        tickTimeout = 0;
        clearTimeout(raiseInterval);
        raiseInterval = 0;
        this.endGame();
        return false;
    }
    
    players.sendToAll({
        server: true,
        type: 'tick',
        number: this.currentMultiply
    })
    var that = this;
    tickTimeout = setTimeout(function () {that.tick()}, 300);
}

Crash.prototype.raiseMultiply = function (speed) {
    this.speed = this.speed || 200;
    this.speed -= Math.pow(this.speed, 2)*6e-5;
    this.speed = this.speed < 2 ? 2 : this.speed;
    this.currentMultiply += config.step;
    var that = this;
    raiseInterval = setTimeout(function() {that.raiseMultiply(speed)}, this.speed);
}

Crash.prototype.endGame = function() {
    players.sendToAll({
        server: true,
        type: 'endGame',
        number: this.multiply
    })
    
    for (var key in this.bets) {
        this.bets[key].status = this.bets[key].status == 'cashOut' ? 'cashOut' : 'crashed';
    }
    
    if (this.history.length > 20) 
        this.history = this.history.slice(1);
    this.history.push(this.multiply);
    
    var that = this;
    setTimeout(function() {that.newGame()}, config.pauseAfterCrash);
}

function getRandomMultiply() {
    var weight = [];
    for (var key in config.weights) {
        weight.push(config.weights[key]);
    }
    
    var limit = parseInt(getRandomItem(config.weights, weight));
    console.log(`Limit: ${limit}`);

    if (limit == 0) return 0

    var random = Math.rand(config.minMultiply, limit);
    
    return random;
}

var getRandomItem = function(list, weight) {
    var total_weight = weight.reduce(function (prev, cur, i, arr) {
        return prev + cur;
    });
     
    var random_num = Math.rand(0, total_weight);
    var weight_sum = 0;
    console.log(`RandomNum: ${random_num}`)
     
    var i = 0;
    for (var key in list) {
        weight_sum += weight[i];
        weight_sum = +weight_sum.toFixed(2);
         
        if (random_num <= weight_sum) {
            return key;
        }
        i++;
    }
     
    // end of function
};

Crash.prototype.cashOut = function(user) {
    if (typeof this.bets[user.id] == 'undefined') return false;
    try {
        var cash = this.currentMultiply/100 * this.bets[user.id].bet;
        var profit = Math.round(cash - this.bets[user.id].bet);
        console.log(`Cash: ${cash}, Profit: ${profit}`);
        this.bets[user.id].status = 'cashOut';
        players.sendToAll({
            server: true,
            type: 'cashOut',
            id: user.id,
            multiply: (this.currentMultiply/100),
            profit: profit
        })
    } catch (e) {
        return false;
    }
}

Crash.prototype.newBet = function(bet) {
    if (bet.bet > config.maxBet) bet.bet = config.maxBet;
    if (this.gameStart) return;
    
    this.bets[bet.id] = bet;
    this.bets[bet.id].status = 'regular';
    players.sendToAll(bet);
}

Crash.prototype.getCurrentMultiply = function() {
    return this.currentMultiply
}

/*function getMultiply() {
    return multiply;
}*/

Crash.prototype.getSpeed = function() {
    return this.speed;
}

Crash.prototype.getBets = function() {
    return this.bets;
}

Crash.prototype.getStatus = function() {
    return this.gameStart;
}

Crash.prototype.timeToStart = function() {
    console.log(`Next game: ${this.nextGame}`);
    return (this.nextGame - Date.now());
}

Math.rand = function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

var crashGame = new Crash();

module.exports = crashGame;


/*module.exports.newGame      = newGame;
module.exports.cashOut      = cashOut;
module.exports.newBet       = newBet;
module.exports.multiply     = getCurrentMultiply;
module.exports.status       = getStatus;
module.exports.speed        = getSpeed;
module.exports.bets         = getBets;
module.exports.timeToStart  = timeToStart;*/