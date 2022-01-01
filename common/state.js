const fs = require("fs");
const players = require("../data/players.json");
const celebs = require("../data/celebs.json");
const bonuses = require("../data/bonuses.json");
const privilegedUsers = require("../data/privileged-users.json");
const path = "data/saved-state.json";

var state = {
    metadata: null,
    players: null,
    celebs: null,
    playerKeys: null,
    bonuses: null,
    privilegedUsers: null
};

const loadState = () => {
    if (fs.existsSync(path)) {
      return fs.readFile(path, "utf8", (err, content) => {
        if (err) throw err;
        console.log(new Date(), "[state]: State loaded.");
        
        if(content && content.length > 0) {
            state = JSON.parse(content);
        }

        return true;
      });
    }
}

exports.init = () => {
    if (!loadState()) {
        state.metadata = {
            lastUpdated: new Date()
        };
        state.players = players;
        state.celebs = celebs;
        state.bonuses = bonuses;
        state.privilegedUsers = privilegedUsers;
    
        for(let player of Object.keys(state.players)) {
            state.players[player].picks.forEach(pick => {
                state.celebs[pick].players.push(player);        
            });
            state.players[player].changed?.forEach(change => {
                state.celebs[change].players.push(player);        
            });
        }
    
        state.playerKeys = Object.keys(players);
    }
}

exports.stringifyState = () => {
    console.log(new Date(), state);
    return JSON.stringify(state);
}

exports.getState = () => {
    return {
        metadata: {
            ...state.metadata
        },
        players: {
            ...state.players
        },
        celebs: {
            ...state.celebs
        },
        playerKeys: [
            ...state.playerKeys
        ],
        bonuses: {
            ...state.bonuses
        },
        privilegedUsers: {
            ...state.privilegedUsers
        }
    };
}

exports.updateCeleb = (id, celeb) => {
    state.celebs[id] = {
        ...celeb
    };
}

exports.updatePlayer = (id, player) => {
    state.players[id] = {
        ...player
    };
}

exports.addPlayer = (id, player) => {
    state.players = {
        ...state.players,
        [id]: player
    }

    state.playerKeys = [
        ...state.playerKeys,
        id
    ]

    this.saveState();
}

exports.saveState = () => {
    state.metadata.lastUpdated = new Date();
    fs.writeFile(path, JSON.stringify(state), {flag: "w"}, (err) => { 
        if (err) throw err;
    });
}

exports.addCeleb = (id, celeb) => {
    state.celebs = {
        ...state.celebs,
        [id]: celeb
    }

    this.saveState();
}

exports.loadState = () => loadState();