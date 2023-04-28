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
        const response = await axios.post(
          "https://aetherarbiter.bowojori7.repl.co/round",
          gamedetails,
          { responseType: 'stream' } // Set responseType to 'stream'
        );

        let messageBuffer = ''; // Buffer to accumulate chunks
        let fullMessageContent = ''; // Full message content
        let channelDeleted = false;

        // Send an initial reply to create a message that can be edited
        // await interaction.deferReply();
        const message = await interaction.followUp("Consulting the Arbiter...");

        // Function to update the message with buffered content
        const updateMessage = async () => {
          if (messageBuffer) {
            // fullMessageContent = messageBuffer;
            // await message.edit(fullMessageContent);
            // Use the same regular expression to extract the content inside the "message" property
            const messageRegex = /"message": "(.*)/;
            const match = messageBuffer.match(messageRegex);
            if (match && match[1]) {
              fullMessageContent = match[1];
              fullMessageRegex = /"message":\s*"([^"]*)"/;
              const fullMatch = messageBuffer.match(fullMessageRegex);
              if (fullMatch && fullMatch[1]) { 
                fullMessageContent = fullMatch[1];
                if (!channelDeleted) {
                  try {
                    await message.edit(fullMessageContent);
                  } catch (error) {
                    console.error('Caught the channel deleting error :))');
                  }
                }
              } else{
                if (!channelDeleted) {
                  try {
                    await message.edit(fullMessageContent);
                  } catch (error) {
                    console.error('Caught the channel deleting error :))');
                  }
                }
              }
            }
          }
          // Schedule the next update after a delay (e.g., 2000 ms)
          setTimeout(updateMessage, 500);
        };
      
        // Start the update loop
        updateMessage();
      
        // Listen to the 'data' event on the response stream
        response.data.on('data', (chunk) => {
          // Convert the chunk to a string and accumulate it in the buffer
          messageBuffer += chunk.toString();
        });


        // Listen to the 'end' event to handle the end of the stream
        response.data.on('end', async () => {
          // If there is any remaining content in the buffer, send it to the channel
          if (messageBuffer) {
            const messageRegex = /"message":\s*"([^"]*)"/;
            const match = messageBuffer.match(messageRegex);
            if (match && match[1]) {
              fullMessageContent = match[1];
              if (!channelDeleted) {
                try {
                  await message.edit(fullMessageContent);
                } catch (error) {
                  console.error('Caught the channel deleting error :))');
                }
              }
            }
          }
          console.log("Full message content on end: " + fullMessageContent)

          let jsonRound;
          try {
            jsonRound = JSON.parse(messageBuffer);
            activeGame["player1"].hp = jsonRound.hp["1"];
            activeGame["player2"].hp = jsonRound.hp["2"];
            
            if (activeGame["player1"].hp > 0 || activeGame["player2"].hp > 0) {
              interaction.followUp("You may continue the battle");
            }
          } catch (error) {
            console.error('Error while parsing JSON:', error);
            return;
          }

          


          // Endgame Sequence
          // check if any players hp has reached 0 then call finale
          if (activeGame["player1"].hp === 0 || activeGame["player2"].hp === 0) {
            let finaleDetails = JSON.parse(JSON.stringify(gamedetails));
            finaleDetails.Acolytes[0].HP = activeGame["player1"].hp;
            finaleDetails.Acolytes[1].HP = activeGame["player2"].hp;
            console.log("Finale Details: "+finaleDetails);
            const res = await axios.post(
              "https://aetherarbiter.bowojori7.repl.co/finale",
              finaleDetails,
              { responseType: 'stream' } // Set responseType to 'stream'
            );

            let messageBuffer = ''; // Buffer to accumulate chunks
            let fullMessageContent = ''; // Full message content
    
            // Send an initial reply to create a message that can be edited
            // await interaction.deferReply();
            const message = await interaction.followUp("Announcing Battle Finale!");
    
            // Function to update the message with buffered content
            const updateMessage = async () => {
              if (messageBuffer) {
                // fullMessageContent = messageBuffer;
                // await message.edit(fullMessageContent);
                // Use the same regular expression to extract the content inside the "message" property
                const messageRegex = /"message": "(.*)/;
                const match = messageBuffer.match(messageRegex);
                if (match && match[1]) {
                  fullMessageContent = match[1];
                  fullMessageRegex = /"message":\s*"([^"]*)"/;
                  const fullMatch = messageBuffer.match(fullMessageRegex);
                  if (fullMatch && fullMatch[1]) { 
                    fullMessageContent = fullMatch[1];
                    if (!channelDeleted) {
                      try {
                        await message.edit(fullMessageContent);
                      } catch (error) {
                        console.error('Caught the channel deleting error :))');
                      }
                    }
                  } else{
                    if (!channelDeleted) {
                      try {
                        await message.edit(fullMessageContent);
                      } catch (error) {
                        console.error('Caught the channel deleting error :))');
                      }
                    }
                  }
                }
              }
              // Schedule the next update after a delay (e.g., 2000 ms)
              setTimeout(updateMessage, 500);
            };
          
            // Start the update loop
            updateMessage();
          
            // Listen to the 'data' event on the response stream
            res.data.on('data', (chunk) => {
              // Convert the chunk to a string and accumulate it in the buffer
              messageBuffer += chunk.toString();
            });
    
    
            // Listen to the 'end' event to handle the end of the stream
            res.data.on('end', async () => {
              // If there is any remaining content in the buffer, send it to the channel
              if (messageBuffer) {
                const messageRegex = /"message":\s*"([^"]*)"/;
                const match = messageBuffer.match(messageRegex);
                if (match && match[1]) {
                  fullMessageContent = match[1];
                  if (!channelDeleted) {
                    try {
                      await message.edit(fullMessageContent);
                    } catch (error) {
                      console.error('Caught the channel deleting error :))');
                    }
                  }
                }
              }
              console.log("Full message content on end: " + fullMessageContent)

              // The endgame after sending the final message from the Arbiter
              // do an interaction followup that contains:
              // XP gains - Call the scribe, update acolytes XP
              // Send an interaction followup saying the XP gains
              await interaction.followUp(`${activeGame["player1"].name} has gained 1 XP and ${activeGame["player2"].name} has gained 1 XP`);
              
              // Call share Image 
              // Send the response of this to interaction.followup (Image URL) 

              function sleep(milliseconds) {
                return new Promise((resolve) => setTimeout(resolve, milliseconds));
              }
  
              // Delete the channel
              try{
                await sleep(5000);
                await interaction.channel.delete();
                channelDeleted = true;
              } catch (error) {
                console.error('Caught the channel deleting error :))');
              }
            });

            res.data.on('error', (error) => {
              console.error('Error while streaming:', error);
            });

          }
        });

        // Listen to the 'error' event to handle any errors that occur during streaming
        response.data.on('error', (error) => {
          console.error('Error while streaming:', error);
        });
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
            content: `${userName}'s move : ${usermove}\nThe Arbiter will judge the moves now`,
          });
          try{
            getRound(gameDetails);
          } catch(error) {
          console.error("Caught the channel deleting error :))");
          }
          

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
            "One player has made a non-empty action in this round"
          );
          await interaction.reply({
            content: `${userName}'s move : ${usermove}`,
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
