const { capitalize } = require("./utils");
const activeGames = {};
const readyAcolytes = [];
const getResult = (p1, p2) => {
  let gameResult;
  if (RPSChoices[p1.objectName] && RPSChoices[p1.objectName][p2.objectName]) {
    // o1 wins
    gameResult = {
      win: p1,
      lose: p2,
      verb: RPSChoices[p1.objectName][p2.objectName],
    };
  } else if (
    RPSChoices[p2.objectName] &&
    RPSChoices[p2.objectName][p1.objectName]
  ) {
    // o2 wins
    gameResult = {
      win: p2,
      lose: p1,
      verb: RPSChoices[p2.objectName][p1.objectName],
    };
  } else {
    // tie -- win/lose don't
    gameResult = { win: p1, lose: p2, verb: "tie" };
  }

  return formatResult(gameResult);
};

const formatResult = (result) => {
  const { win, lose, verb } = result;
  return verb === "tie"
    ? `<@${win.id}> and <@${lose.id}> draw with **${win.objectName}**`
    : `<@${win.id}>'s **${win.objectName}** ${verb} <@${lose.id}>'s **${lose.objectName}**`;
};

// this is just to figure out winner + verb
const RPSChoices = {
  rock: {
    description: "sedimentary, igneous, or perhaps even metamorphic",
    virus: "outwaits",
    computer: "smashes",
    scissors: "crushes",
  },
  cowboy: {
    description: "yeehaw~",
    scissors: "puts away",
    wumpus: "lassos",
    rock: "steel-toe kicks",
  },
  scissors: {
    description: "careful ! sharp ! edges !!",
    paper: "cuts",
    computer: "cuts cord of",
    virus: "cuts DNA of",
  },
  virus: {
    description: "genetic mutation, malware, or something inbetween",
    cowboy: "infects",
    computer: "corrupts",
    wumpus: "infects",
  },
  computer: {
    description: "beep boop beep bzzrrhggggg",
    cowboy: "overwhelms",
    paper: "uninstalls firmware for",
    wumpus: "deletes assets for",
  },
  wumpus: {
    description: "the purple Discord fella",
    paper: "draws picture on",
    rock: "paints cute face on",
    scissors: "admires own reflection in",
  },
  paper: {
    description: "versatile and iconic",
    virus: "ignores",
    cowboy: "gives papercut to",
    rock: "covers",
  },
};
const POWERS = {
  "Weather manipulation": {
    description: "come rain, shine or snow, you are in control",
  },
  "Gravity manipulation": {
    description:
      "Newton may have discovered it, but you've perfected control of it",
  },
  "Weapon Creation": {
    description: "Lil Uzi ? Nah, you rock with all weapons",
  },
  "Self-Regeneration Manipulation": {
    description: "Not the type of healing from an ex. physical injuries only",
  },
  Teleportation: {
    description: "you can teleport 10km distances as quickly as a mach-5",
  },
};
const getRPSChoices = () => {
  return Object.keys(RPSChoices);
};
const getPowers = () => {
  return Object.keys(POWERS);
};

// Function to fetch shuffled options for select menu
const getShuffledOptions = () => {
  const allChoices = getRPSChoices();
  const options = [];

  for (let c of allChoices) {
    // Formatted for select menus
    // https://discord.com/developers/docs/interactions/message-components#select-menu-object-select-option-structure
    options.push({
      label: capitalize(c),
      value: c.toLowerCase(),
      description: RPSChoices[c]["description"],
    });
  }

  return options.sort(() => Math.random() - 0.5);
};
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
