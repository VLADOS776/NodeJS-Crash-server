var config = {
    minMultiply: 100,
    maxMultiply: 30000,
    pauseBeforeGame: 6000,
    pauseAfterCrash: 3000,
    startSpeed: 200,
    step: 1,
    maxBet: 500000
}

var weights = {
    0:      10,
    200:    50,
    300:    75,
    1000:   25,
    2000:   10,
    5000:   8,
    7000:   5,
    10000:  3,
    20000:  2,
    30000:  1
}

config.weights = weights;

module.exports = config;