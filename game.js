const { capitalize } = require("./utils");
const activeGames = {};
const readyAcolytes = [];

const POWERS = {
  "Weather manipulation": {
    description: "Come rain, shine or snow, you are in control",
  },
  "Gravity manipulation": {
    description:
      "Newton may have discovered it, but you've perfected control of it",
  },
  "Weapon Creation": {
    description: "Lil Uzi? Nah, you rock with all weapons",
  },
  "Self-Regeneration Manipulation": {
    description: "Not the type of healing from an ex. Physical injuries only",
  },
  Teleportation: {
    description: "You can teleport 10km distances as quickly as a mach-5",
  },
};

const getPowers = () => {
  return Object.keys(POWERS);
};

// Function to fetch shuffled options for select menu

const getShuffledPowers = () => {
  const allPowers = getPowers();
  const options = [];

  for (let c of allPowers) {
    // Formatted for select menus
    // https://discord.com/developers/docs/interactions/message-components#select-menu-object-select-option-structure
    options.push({
      label: capitalize(c),
      value: c.toLowerCase(),
      description: POWERS[c]["description"],
    });
  }

  return options;
};

const addAcolyte = (acolyteObj) => {
  readyAcolytes.push(acolyteObj);
};

const getAcolytes = () => {
  return readyAcolytes;
};

const initGame = (id, userId) => {
  activeGames[id] = {
    id: userId,
  };
};
const updateGameId = (id, newId) => {
  activeGames[newId] = activeGames[id];
  delete activeGames[id];
};
const addGame = (id, key, value) => {
  activeGames[id][key] = value;
};
const setGameRound = (id, key, value) => {
  activeGames[id][key] = value;
};
const getGameRound = (id) => {
  return activeGames[id]["round"];
};
const addPlayerAction = (id, key, prop, value) => {
  activeGames[id][key][prop] = value;
};
const getGame = (id) => {
  return activeGames[id];
};
const getAllGames = () => {
  return activeGames;
};
module.exports = {
  getShuffledPowers,
  addAcolyte,
  getAcolytes,
  addGame,
  getGame,
  initGame,
  getAllGames,
  setGameRound,
  updateGameId,
  addPlayerAction,
  getGameRound,
};
