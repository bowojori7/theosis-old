const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  SlashCommandBuilder,
} = require("discord.js");
const {
  getAcolytes,
  addGame,
  initGame,
  getGame,
  getAllGames,
  getGameRound,
  setGameRound,
} = require("../../game");
const axios = require("axios");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("attack")
    .setDescription("Make your moves, go for the win.")
    .addStringOption((option) =>
      option
        .setName("move")
        .setDescription("Your well-thought out move")
        .setRequired(true)
    ),
  async execute(interaction) {
    const userName = interaction.user.username;
    const userId = interaction.user.id;
    const compid = interaction.id;
    const readyAcolytes = getAcolytes();
    const usermove = interaction.options.getString("move");
    let gameID;
    const games = getAllGames();

    /////Check if user already registered
    if (readyAcolytes.some((readyAcolyte) => readyAcolyte.id === userId)) {
      /////get current acolyte
      const foundAcolyte = readyAcolytes.find(
        (readyAcolyte) => readyAcolyte.id === userId
      );

      ////get game id
      for (const id in games) {
        if (games[id].id.includes(userId)) {
          gameID = games[id].id.toString();
        }
      }
      //get game
      const activeGame = games[gameID];
      //getRound Function
      const getRound = async (gamedetails) => {
        let res = await axios.post(
          "https://aetherarbiter.bowojori7.repl.co/round",
          gamedetails
        );
        console.log(res.data);
        interaction.followUp(res.data.message);
        interaction.followUp("You may continue the battle");
        activeGame["player1"].hp = res.data["hp"]["1"];
        activeGame["player2"].hp = res.data["hp"]["2"];
        ///check if any players hp has reached 0 then call finale
        if (activeGame["player1"].hp === 0 || activeGame["player2"].hp === 0) {
          let finaleDetails = JSON.parse(JSON.stringify(gamedetails));
          finaleDetails.Acolytes[0].HP = activeGame["player1"].hp;
          finaleDetails.Acolytes[1].HP = activeGame["player2"].hp;
          console.log(finaleDetails);
          let res = await axios.post(
            "https://aetherarbiter.bowojori7.repl.co/finale",
            finaleDetails
          );
          console.log(res.data);
          interaction.followUp(res.data);
        } else {
          console.log(res.data);
        }
      };
      //get game current round
      const currentRound = getGameRound(gameID);

      //check if game exists
      if (gameID) {
        //check which player it is that made the move then update game object accordingly
        if (activeGame["player1"].id === userId) {
          activeGame["player1"].Actions[currentRound - 1].Action = usermove;
        } else if (activeGame["player2"].id === userId) {
          activeGame["player2"].Actions[currentRound - 1].Action = usermove;
        }

        // Check if both players have made non-empty actions in the current round
        let player1HasAction = false;
        let player2HasAction = false;

        // Check player1's actions
        if (
          activeGame.player1.Actions.length > 0 &&
          activeGame.player1.Actions[activeGame.round - 1].Action !== ""
        ) {
          player1HasAction = true;
        }

        // Check player2's actions
        if (
          activeGame.player2.Actions.length > 0 &&
          activeGame.player2.Actions[activeGame.round - 1].Action !== ""
        ) {
          player2HasAction = true;
        }

        if (player1HasAction && player2HasAction) {
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
                HP: activeGame["player1"].hp,
                Actions: activeGame["player1"].Actions.slice(0, currentRound),
              },
              {
                Name: activeGame["player2"].name,
                Powers: [
                  {
                    Name: activeGame["player2"].power,
                    PowerLevel: 1,
                  },
                ],
                HP: activeGame["player2"].hp,
                Actions: activeGame["player2"].Actions.slice(0, currentRound),
              },
            ],
            Environment:
              "clear day, moderate temparature, no wind, dry terrain",
            CurrentRound: activeGame.round,
          };

          console.log("Both players have made non-empty actions in this round");
          await interaction.reply({
            content: `<${userName}>'s move : ${usermove}\nThe Arbiter will judge the moves now`,
          });
          getRound(gameDetails);

          activeGame.player1.Actions.push({
            Round: activeGame.round + 1,
            Action: "",
          });
          activeGame.player2.Actions.push({
            Round: activeGame.round + 1,
            Action: "",
          });
          setGameRound(gameID, "round", activeGame.round + 1);
        } else {
          console.log(
            "One or both players have not made non-empty actions in this round"
          );
          await interaction.reply({
            content: `<${userName}>'s move : ${usermove}`,
          });
        }
      } else {
        await interaction.reply({
          content: `You haven't accepted or made any challenges.\nWhy are you flailing about ?`,
        });
      }
    } else {
      await interaction.reply({
        content: `You do not have the blood of theos flowing through you yet unnamed one.\n Go to the genesis before you try step into the arena.`,
      });
    }
  },
};
