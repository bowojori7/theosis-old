# Code Shares

const axios = require('axios');
const stream = require('stream');
const { promisify } = require('util');
const pipeline = promisify(stream.pipeline);

async function streamApiResponse(interaction, url) {
  try {
    // Fetch the API data as a stream
    const response = await axios.get(url, { responseType: 'stream' });

    // Check if the response is successful
    if (response.status !== 200) {
      await interaction.reply(`Error fetching data: ${response.statusText}`);
      return;
    }

    // Stream the API response to the Discord channel
    let accumulatedData = '';
    const initialMessage = await interaction.reply('Streaming API response...', { fetchReply: true });

    // Create a writable stream to handle the data
    const writableStream = new stream.Writable({
      async write(chunk, encoding, callback) {
        try {
          // Accumulate the streamed data
          accumulatedData += chunk.toString();

          // Update the message in the Discord channel with the accumulated data
          await interaction.editReply(accumulatedData);
          callback();
        } catch (error) {
          callback(error);
        }
      },
    });

    // Pipe the response stream to the writable stream
    await pipeline(response.data, writableStream);

    // Edit the initial message to indicate that streaming is complete
    await interaction.editReply(`${accumulatedData}\n\nStreaming API response... Done!`);
  } catch (error) {
    console.error('Error streaming API response:', error);
  }
}

// Use the function in your command's execute function or appropriate event handler
// Replace 'your-api-url' with the actual API URL
streamApiResponse(interaction, 'your-api-url');

### Important
You can use this modified version of the streamApiResponse function in your command's execute function or the appropriate event handler. Replace 'your-api-url' with the actual API URL that streams the response.
In this version, the writable stream accumulates the chunks of data and updates the initial message with the new content. Keep in mind that if the accumulated data exceeds the 2000 character limit, you'll need to handle splitting the data into multiple messages or truncate the content.



## Slow Arbiter
      // uncomment if you want slow arbiter version      
      // const getRound = async (gamedetails) => {
      //   let res = await axios.post(
      //     "https://aetherarbiter.bowojori7.repl.co/round",
      //     gamedetails
      //   );
      //   console.log(res.data);
      //   interaction.followUp(res.data.message);
      //   activeGame["player1"].hp = res.data["hp"]["1"];
      //   activeGame["player2"].hp = res.data["hp"]["2"];
      //   if (activeGame["player1"].hp > 0 || activeGame["player2"].hp > 0) {
      //     interaction.followUp("You may continue the battle");
      //   }

      //   ///check if any players hp has reached 0 then call finale
      //   if (activeGame["player1"].hp === 0 || activeGame["player2"].hp === 0) {
      //     let finaleDetails = JSON.parse(JSON.stringify(gamedetails));
      //     finaleDetails.Acolytes[0].HP = activeGame["player1"].hp;
      //     finaleDetails.Acolytes[1].HP = activeGame["player2"].hp;
      //     console.log(finaleDetails);
      //     let res = await axios.post(
      //       "https://aetherarbiter.bowojori7.repl.co/finale",
      //       finaleDetails
      //     );
      //     console.log(res.data);
      //     interaction.followUp(res.data);
      //   } else {
      //     console.log(res.data);
      //   }
      // };