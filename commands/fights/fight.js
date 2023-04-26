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
  addPlayerAction,
  getGame,
} = require("../../game");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("fight")
    .setDescription("Go for glory."),
  async execute(interaction) {
    const userName = interaction.user.username;
    const userId = interaction.user.id;
    const id = interaction.id;
    const readyAcolytes = getAcolytes();

    /////Check if user already registered
    if (readyAcolytes.some((readyAcolyte) => readyAcolyte.id === userId)) {
      const foundAcolyte = readyAcolytes.find(
        (readyAcolyte) => readyAcolyte.id === userId
      );
      initGame(id, userId);
      const accept = new ButtonBuilder()
        .setCustomId(`battle_accept_${id}`)
        .setLabel("Accept Challenge")
        .setStyle(ButtonStyle.Primary);
      addGame(id, "player1", foundAcolyte);
      let actionValue = [
        {
          Round: 1,
          Action: "",
        },
      ];
      addPlayerAction(id, "player1", "Actions", actionValue);
      const row = new ActionRowBuilder().addComponents(accept);
      await interaction.reply({
        content: `<${userName}> bestowed with the gift of ${foundAcolyte.power} asks if anybody dares to face them in the arena`,
        components: [row],
      });
    } else {
      await interaction.reply({
        content: `You do not have the blood of theos flowing through you yet unnamed one.\n Go to the genesis before you try step into the arena.`,
      });
    }
  },
};
