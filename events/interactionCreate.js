const {
  getShuffledPowers,
  addAcolyte,
  addGame,
  getGame,
  getAcolytes,
  initGame,
  setGameRound,
  addPlayerAction,
  updateGameId,
  getAllGames,
} = require("../game");
const {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  Events,
  GuildChannelManager,
  PermissionOverwrites,
  PermissionOverwriteManager,
  ChannelType,
  PermissionsBitField,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

const axios = require("axios");

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (interaction.isChatInputCommand()) {
      await handleChatInputCommand(interaction);
    } else if (interaction.isButton()) {
      await handleButtonInteraction(interaction);
    } else if (interaction.isStringSelectMenu()) {
      await handleStringSelectMenuInteraction(interaction);
    }
  },
};

async function handleChatInputCommand(interaction) {
  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`Error executing ${interaction.commandName}`);
    console.error(error);
  }
}

async function handleButtonInteraction(interaction) {
  if (interaction.customId === "accept") {
    await handleAcceptButtonInteraction(interaction);
  } else if (interaction.customId.startsWith("battle_accept_")) {
    await handleBattleAcceptButtonInteraction(interaction);
  }
}

async function handleAcceptButtonInteraction(interaction) {
  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId("powerMenu")
    .setPlaceholder("Choose a power")
    .addOptions(getShuffledPowers());

  const row = new ActionRowBuilder().addComponents(selectMenu);

  await interaction.reply({
    content: "Select a power:",
    components: [row],
    ephemeral: true,
  });
  await interaction.message.delete();
}

async function handleBattleAcceptButtonInteraction(interaction) {
  const userName = interaction.user.username;
  const userId = interaction.user.id;
  const readyAcolytes = getAcolytes();
  const componentId = interaction.customId;
  const gameId = componentId.replace("battle_accept_", "");

  if (isUserAcolyte(readyAcolytes, userId)) {
    const foundAcolyte = getAcolyteById(readyAcolytes, userId);
    updateGameWithPlayer(gameId, foundAcolyte);
    const activeGame = getGame(gameId);
    updateGameIdWithPlayers(gameId, activeGame, userId);

    const gameDetails = createGameDetails(activeGame);
    await handleArenaCreation(interaction, activeGame, gameDetails);
  } else {
    await interaction.reply({
      content: `You do not have the blood of theos flowing through you yet unnamed one.\n Go to the genesis before you try step into the arena.`,
    });
  }
}

function isUserAcolyte(readyAcolytes, userId) {
  return readyAcolytes.some((readyAcolyte) => readyAcolyte.id === userId);
}

function getAcolyteById(readyAcolytes, userId) {
  return readyAcolytes.find((readyAcolyte) => readyAcolyte.id === userId);
}

function updateGameWithPlayer(gameId, foundAcolyte) {
  addGame(gameId, "player2", foundAcolyte);
  setGameRound(gameId, "round", 1);
  let actionValue = [
    {
      Round: 1,
      Action: "",
    },
  ];
  addPlayerAction(gameId, "player2", "Actions", actionValue);
}

function updateGameIdWithPlayers(gameId, activeGame, userId) {
  const player1id = activeGame.id.toString();
  const newID = userId.toString() + player1id;
  activeGame.id = newID;
  updateGameId(gameId, newID);
}

function createGameDetails(activeGame) {
  let gameDetails = {
    Acolytes: [
      {
        Name: activeGame["player1"].name,
        Powers: [
          {
            Name: activeGame["player1"].power,
            PowerLevel: 1,
          },
        ],
        HP: 3,
        Actions: [
          {
            Round: 1,
            Action: "I do stuff with my powers",
          },
        ],
      },
      {
        Name: activeGame["player2"].name,
        Powers: [
          {
            Name: activeGame["player2"].power,
            PowerLevel: 1,
          },
        ],
        HP: 3,
        Actions: [
          {
            Round: 1,
            Action: "I do stuff with my power",
          },
        ],
      },
    ],
    Environment:
      "clear day, moderate temparature, no wind, dry terrain",
    CurrentRound: 0,
  };
  
  return gameDetails;
}

async function handleArenaCreation(interaction, activeGame, gameDetails) {
  // Check if any of the participants is in another battle. If not, create the battle. If yes, tell them they're already in a battle with an await interaction reply.
  const p1AlreadyInArena = interaction.guild.channels.cache.find(
    (c) => c.name.includes(activeGame["player1"].name)
  );
  const p2AlreadyInArena = interaction.guild.channels.cache.find(
    (c) => c.name.includes(activeGame["player2"].name)
  );

  if (p1AlreadyInArena) {
    await interaction.reply({
      content: `Oh ho! The Sanctum of Duels allows only one battle at a time ${activeGame["player1"].name}.`
    });
  }
  else if (p2AlreadyInArena) {
    await interaction.reply({
      content: `Oh ho! The Sanctum of Duels allows only one battle at a time ${activeGame["player2"].name}.`
    });
  }
  else {
    ///Create new Channel
    const arena = await interaction.guild.channels.create({
      name: `${activeGame.player1.name} VS ${activeGame.player2.name}`,
      type: ChannelType.GuildText,
      permissionOverwrites: [
        {
          id: interaction.guild.id,
          deny: [PermissionsBitField.Flags.SendMessages],
        },
        {
          id: activeGame.player1.id,
          allow: [PermissionsBitField.Flags.SendMessages],
        },
        {
          id: activeGame.player2.id,
          allow: [PermissionsBitField.Flags.SendMessages],
        },
      ],
    });
    // create an invite link for the channel
    // TODO: find a way to create a custom link.
    // const invite = await arena.createInvite({ unique: true });
    const invite = await interaction.guild.channels.cache
      .find((channel) => channel.name === arena.name)
      .createInvite({
        temporary: false,
        maxAge: 86400, // expiration time in seconds (24 hrs in this example)
        maxUses: 0, // no limit to the number of people who can use this invite
        unique: true,
        reason: "Join this exciting battle!",
      });
    const inviteLink = invite.url;
    const button = new ButtonBuilder()
      .setLabel("Step into the Sanctum of Duels")
      .setStyle(ButtonStyle.Link)
      .setURL(inviteLink);

    // await interaction.reply({
    //   content: `An exciting battle is happening now, Join and view at ${invite}`,
    // });
    await interaction.reply({
      content: `The Ecclesia commends the mighty valor of ${activeGame["player1"].name} and ${activeGame["player2"].name}`,
      components: [new ActionRowBuilder().addComponents(button)]
    });

    const getIntro = async (gamedetails) => {
      let res = await axios.post(
        "https://aetherarbiter.bowojori7.repl.co/intro",
        gamedetails
      );

      arena.send(res.data);
    };
    getIntro(gameDetails);
  }
}

async function handleStringSelectMenuInteraction(interaction) {
  if (interaction.customId === "powerMenu") {
    const userName = interaction.user.username;
    const userId = interaction.user.id;
    const selectedPower = interaction.values[0];
    let newAcolyte = {
      id: userId,
      name: userName,
      hp: 1,
      pp: 1,
      power: selectedPower,
    };
    addAcolyte(newAcolyte);
    interaction.reply({
      content: `Welcome new Acolyte ${userName}, who has been blessed with the gift of ${selectedPower}!`,
    });
  }
}

