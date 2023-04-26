const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  SlashCommandBuilder,
} = require("discord.js");
const { getAcolytes } = require("../../game");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("genesis")
    .setDescription("Enter the theosis."),

  async execute(interaction) {
    const userName = interaction.user.username;
    const userId = interaction.user.id;
    const readyAcolytes = getAcolytes();

    /////Check if user already registered
    if (readyAcolytes.some((readyAcolyte) => readyAcolyte.id === userId)) {
      const foundAcolyte = readyAcolytes.find(
        (readyAcolyte) => readyAcolyte.id === userId
      );
      await interaction.reply({
        content: `Greetings ${userName},
        \nIt seems you've been past here before, the acolyte with the ${foundAcolyte.power}, yes ?
        \nGo into the Arena and battle for glory.`,
      });
    }
    /////Allow them to if they aren't
    else {
      const accept = new ButtonBuilder()
        .setCustomId("accept")
        .setLabel("Accept")
        .setStyle(ButtonStyle.Primary);

      const row = new ActionRowBuilder().addComponents(accept);
      // interaction.user is the object representing the User who ran the command
      // interaction.member is the GuildMember object, which represents the user in the specific guild
      await interaction.reply({
        content: `Greetings Acolyte, we'll call you ${userName}.
        \n${userName}, The Ecclesia has allowed you to pick your starting power - choose wisely.
        \nBut first, do you dare to enter the Theoverse ?`,
        components: [row],
      });
    }
  },
};
