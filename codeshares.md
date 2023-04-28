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