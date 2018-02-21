var config = {
    minMultiply: 100,
    maxMultiply: 50000,
    pauseBeforeGame: 6000,
    pauseAfterCrash: 3000,
    startSpeed: 200,
    step: 1,
    maxBet: 500000,
    topCount: 10
}

var weights = {
    0:      10,
    200:    50,
    300:    75,
    1000:   15,
    2000:   13,
    5000:   10,
    7000:   8,
    10000:  6,
    20000:  5,
    30000:  3,
    40000:  2,
    50000:  1
}

config.weights = weights;

module.exports = config;