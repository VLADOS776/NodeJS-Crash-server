var config          = new require("./config");
var players         = new require("./clients");
var firebase        = new require('./firebaseDatabase');

var tickTimeout = 0,
    raiseInterval = 0;

var Crash = function() {
    //Игроки
    this.players = [];
    
    //Ставки
    this.bets = {};
    
    //Новые ставки
    this.newBets = {};
    
    //Игроки, которые выводят ставку
    this.cashOuts = {};
    
    //Началась ли игра
    this.gameStart = false;
    
    this.gameStartTime = 0;
    
    //Множитель, на котором закончится игра
    this.multiply = 0;
    
    //Текущий множитель
    this.currentMultiply = 0;
    
    //Через сколько начнется игра
    this.nextGame = Date.now() + config.pauseBeforeGame;
    
    //Скорость обновления множителя
    this.speed = 0;
    
    //Предыдущие множители
    this.history = [];
    
    //Top игроков в краш
    this.top = {};
    
    //Если есть, в следующей игре дойдет до этого значения
    this.nextMultiply = null;
    
    //Получаем топ игроков при запуске
    getTop();
    
    //Следим за бд
    firebase.database().ref('games/crash/nextRound').remove();
    this.checkNextVal();
}

Crash.prototype.newGame = function() {
    this.gameStart = false;
    this.nextGame = Date.now() + config.pauseBeforeGame;
    console.log(`New game start in ${this.nextGame}`);
    this.bets = {};
    this.cashOuts = {};
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
    this.multiply = this.nextMultiply !== null ? this.nextMultiply : getRandomMultiply();
    this.nextMultiply = null;
    
    this.gameStartTime = Date.now();

    console.log('==== Crash at >>> '+this.multiply+' <<< ====');
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
    
    var msg = {
        server: true,
        type: 'tick',
        number: this.currentMultiply.toFixed(0)
    }
    if (Object.keys(this.cashOuts).length != 0) {
        for (var key in this.cashOuts) {
            var cash = this.currentMultiply/100 * this.bets[key].bet;
            var profit = Math.round(cash - this.bets[key].bet);
            
            this.cashOuts[key] = profit;
            
            var checkT = checkTop(profit);
            if (checkT != -1) {
                   topUpdate(checkT, {
                       bet: this.bets[key].bet,
                       multiply: this.currentMultiply.toFixed(0),
                       player: this.bets[key].player,
                       uid: key
                   })
            }
        }
        msg.cashOuts = this.cashOuts;
    }
    
    players.sendToAll(msg)
    this.cashOuts = {};
    var that = this;
    tickTimeout = setTimeout(function () {that.tick()}, 300);
}

Crash.prototype.raiseMultiply = function () {
    var timeDiff = Date.now() - this.gameStartTime;
    var coef = 4e-2;
    if (timeDiff < 10000)
        coef = 7e-7;
    else if (timeDiff < 20000)
        coef = 7e-3;
    this.currentMultiply += Math.pow((timeDiff/1000), 2)*coef + 1;
    var that = this;
    raiseInterval = setTimeout(function() {that.raiseMultiply()}, 100);
}

Crash.prototype.endGame = function() {
    var msg = {
        server: true,
        type: 'endGame',
        number: this.multiply
    }
    if (Object.keys(this.cashOuts).length != 0) {
        for (var key in this.cashOuts) {
            var cash = this.currentMultiply/100 * this.bets[key].bet;
            var profit = Math.round(cash - this.bets[key].bet);
            
            this.cashOuts[key] = profit;
            
            var checkT = checkTop(profit);
            if (checkT != -1) {
                   topUpdate(checkT, {
                       bet: this.bets[key].bet,
                       multiply: this.currentMultiply,
                       player: this.bets[key].player,
                       uid: key
                   })
            }
        }
        msg.cashOuts = this.cashOuts;
    }
    players.sendToAll(msg);
    
    for (var key in this.bets) {
        this.bets[key].status = this.bets[key].status == 'cashOut' ? 'cashOut' : 'crashed';
    }
    
    if (this.history.length > 20) 
        this.history = this.history.slice(1);
    this.history.push(this.multiply);
    
    var that = this;
    setTimeout(function() {that.newGame()}, config.pauseAfterCrash);
}

Crash.prototype.checkNextVal = function() {
    var first = true;
    var that = this;
    firebase.database().ref('games/crash/nextRound').on('value', function(data) {
        if (first) {
            first = false;
        } else {
            console.log('Next multiply is', data.val());
            that.nextMultiply = parseFloat(data.val());
        }
    })
}

function getRandomMultiply() {
    var weight = [];
    for (var key in config.weights) {
        weight.push(config.weights[key]);
    }
    
    var limit = parseInt(getRandomItem(config.weights, weight));

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
     
    var i = 0;
    for (var key in list) {
        weight_sum += weight[i];
        weight_sum = +weight_sum.toFixed(2);
        
        if (random_num <= weight_sum) {
            return key;
        }
        i++;
    }
};

function getTop() {
    firebase.database().ref('top/crash').once('value').then(function (snapshot) {
        Crash.top = snapshot.val();
        Crash.top.oneGame = cleanArray(Crash.top.oneGame);
    })
    
    var first = true;
    firebase.database().ref('top/crash/update').on('value', function(data) {
        if (first) {
            first = false;
        } else {
            firebase.database().ref('top/crash/update').remove();
            getTop();
        }
    })
}

function checkTop(profit) {
    for (var i = 0; i < Crash.top.oneGame.length; i++) {
    
        if (profit > parseInt(parseInt(Crash.top.oneGame[i].bet) * parseInt(Crash.top.oneGame[i].multiply) / 100) - parseInt(Crash.top.oneGame[i].bet)) {
            return i;
        }
    }
    
    //Если в топе игроков не хватает игроков, добавляем в конец
    if (Crash.top.oneGame.length < config.topCount)
        return i;
    else
        return -1;
}

function topUpdate(place, bet) {
    Crash.top.oneGame.splice(place, 0, bet);
    if (Crash.top.oneGame.length > config.topCount) {
        Crash.top.oneGame.splice(Crash.top.oneGame.length - 1, 1);
    }
    Crash.top.oneGame = cleanArray(Crash.top.oneGame);
    firebase.database().ref('top/crash/oneGame').set(Crash.top.oneGame);
}

function cleanArray(actual) {
  var newArray = new Array();
  for (var i = 0; i < actual.length; i++) {
    if (actual[i]) {
      newArray.push(actual[i]);
    }
  }
  return newArray;
}

Crash.prototype.cashOut = function(user) {
    if (typeof this.bets[user.id] == 'undefined' || this.bets[user.id].status != 'regular') return false;
    try {

        this.bets[user.id].status = 'cashOut';
        this.cashOuts[user.id] = true;
        
    } catch (e) {
        return false;
    }
}

Crash.prototype.newBet = function(bet) {
    if (bet.bet > config.maxBet) bet.bet = config.maxBet;
    if (this.gameStart) return;
    bet.status = 'regular';
    
    this.bets[bet.id] = bet;
    //this.newBets.bet);
    players.sendToAll(bet);
}

Crash.prototype.getCurrentMultiply = function() {
    return this.currentMultiply
}

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