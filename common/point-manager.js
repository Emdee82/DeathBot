const find = require("./find");
const stateUtils = require("./state");

const applyPointsToState = (playerId, points, state) => {
    let player = {...state.players[playerId]};
    player.basePoints = points;
    console.log(new Date(), JSON.stringify(player, null, 1));
    stateUtils.updatePlayer(playerId, player);
}

exports.setPoints = (playerId, points, stateFuncs) => {
    const state = stateFuncs.getState();
    applyPointsToState(playerId, points, state);
}

exports.addPoints = (playerId, points, msg, stateFuncs) => {
    const state = stateFuncs.getState();
    let player = find.findPlayer(playerId, msg, stateFuncs);
    
    if(player) {
        let totalPoints = state.players[playerId].basePoints;
        totalPoints = totalPoints + points;

        applyPointsToState(playerId, totalPoints, state);
    }
}

exports.subPoints = (playerId, points, msg, stateFuncs) => {
    const state = stateFuncs.getState();
    let player = find.findPlayer(playerId, msg, stateFuncs);
    
    if (player) {
        let totalPoints = state.players[playerId].basePoints;
        totalPoints = totalPoints - points;

        applyPointsToState(playerId, totalPoints, state);
    }
}