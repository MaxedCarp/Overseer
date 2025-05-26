const { REST, Routes } = require('discord.js');
const { clientId, token } = require('./config.json');
const rest = new REST().setToken(token);

(async () => {
	try {
		console.log(`Started flushing application (/) commands.`);

		const data = await rest.put(
			Routes.applicationCommands(clientId),
			{ body: [] },
		);

		console.log(`Successfully flushed application (/) commands.`);
	} catch (error) {
		console.error(error);
	}
})();