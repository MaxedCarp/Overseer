# Deployment Scripts Documentation

## Overview

Overseer uses two deployment scripts to manage Discord slash commands registration.

---

## deploy-commands.js

**Purpose:** Register/update all slash commands with Discord

### Process

1. **Command Discovery:**
   - Scans `./commands` directory for subdirectories
   - Excludes folders containing "Modules"
   - Loads all `.js` files from each subdirectory

2. **Command Validation:**
   - Checks each file for required `data` and `execute` properties
   - Converts command data to JSON format
   - Warns about invalid commands

3. **Discord Registration:**
   - Uses Discord REST API
   - Registers globally to all servers
   - Replaces all existing commands

### Configuration Required

From `config.json`:
```javascript
{
    "clientId": "your-bot-client-id",
    "token": "your-bot-token"
}
```

### Usage

```bash
node deploy-commands.js
```

### Output

```
Started refreshing X application (/) commands.
Successfully reloaded X application (/) commands.
```

### API Endpoint

```javascript
Routes.applicationCommands(clientId)
// PUT https://discord.com/api/v10/applications/{clientId}/commands
```

### Notes

- **Global Commands:** Deploys to all servers (can take up to 1 hour to propagate)
- **Overwrites:** Replaces ALL existing commands
- **Validation:** Skips files missing required properties
- **Modules Excluded:** Command_Modules folder not deployed

---

## flush-commands.js

**Purpose:** Delete all registered slash commands from Discord

### Process

1. **Command Flush:**
   - Connects to Discord REST API
   - Sends empty array to commands endpoint
   - Removes all registered commands

### Configuration Required

Same as deploy-commands.js:
```javascript
{
    "clientId": "your-bot-client-id",
    "token": "your-bot-token"
}
```

### Usage

```bash
node flush-commands.js
```

### Output

```
Started flushing application (/) commands.
Successfully flushed application (/) commands.
```

### API Endpoint

```javascript
Routes.applicationCommands(clientId)
// PUT https://discord.com/api/v10/applications/{clientId}/commands
// Body: []
```

### Use Cases

- Cleanup during development
- Remove deprecated commands
- Prepare for major command restructure
- Debug command registration issues

### Warning

⚠️ **This deletes ALL commands** - Bot will have no slash commands until redeployed

---

## Deployment Workflow

### Initial Setup

```bash
# 1. Deploy commands
node deploy-commands.js

# 2. Start bot
node app.js
```

### After Adding New Commands

```bash
# 1. Redeploy commands
node deploy-commands.js

# Wait ~1 hour for global propagation or restart bot

# 2. Restart bot (if needed)
```

### Removing All Commands

```bash
# 1. Flush commands
node flush-commands.js

# 2. Optional: Redeploy with new set
node deploy-commands.js
```

---

## Command Structure

All commands must follow this structure:

```javascript
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('commandname')
        .setDescription('Description')
        .addOptions(...),

    async execute(interaction) {
        // Command logic
    }
};
```

### Required Properties

1. **data:** SlashCommandBuilder instance
2. **execute:** Async function that handles interaction

---

## Folder Structure

```
commands/
├── Channels/          ← Deployed
├── Messages/          ← Deployed
├── Misc/              ← Deployed
├── Moderation/        ← Deployed
├── Roles/             ← Deployed
└── Command_Modules/   ← NOT deployed (utility modules)
```

---

## Discord REST API Details

### Global Commands
- Endpoint: `/applications/{clientId}/commands`
- Method: PUT
- Propagation: Up to 1 hour
- Scope: All servers bot is in

### Guild Commands (Not Used)
- Endpoint: `/applications/{clientId}/guilds/{guildId}/commands`
- Method: PUT
- Propagation: Instant
- Scope: Single server only

**Note:** Overseer uses global commands only

---

## Error Handling

### Common Errors

**Invalid Token:**
```
Error: 401 Unauthorized
```
→ Check token in config.json

**Invalid Client ID:**
```
Error: 404 Not Found
```
→ Check clientId in config.json

**Missing Permissions:**
```
Error: 403 Forbidden
```
→ Ensure bot has application.commands scope

**Rate Limited:**
```
Error: 429 Too Many Requests
```
→ Wait and retry (rare with deployment scripts)

### File Validation Warnings

```
[WARNING] The command at {filePath} is missing a required "data" or "execute" property.
```
→ Fix command file structure

---

## Best Practices

### Development

1. **Test Locally First:**
   - Use guild commands for instant testing
   - Switch to global when ready for production

2. **Version Control:**
   - Commit before deploying
   - Track command changes

3. **Deployment Timing:**
   - Deploy during low-usage periods
   - Account for 1-hour propagation

### Production

1. **Minimize Deploys:**
   - Batch command updates
   - Global propagation takes time

2. **Backup Commands:**
   - Export current commands before flush
   - Keep previous versions

3. **Monitor:**
   - Check Discord Developer Portal
   - Verify commands appear correctly

---

## Advanced Usage

### Deploy to Specific Guild (Development)

Modify deploy-commands.js:
```javascript
const data = await rest.put(
    Routes.applicationGuildCommands(clientId, guildId),
    { body: commands },
);
```

**Advantages:**
- Instant propagation
- Test without affecting production
- Guild-specific commands

### Export Current Commands

```javascript
const rest = new REST().setToken(token);
const commands = await rest.get(
    Routes.applicationCommands(clientId)
);
fs.writeFileSync('commands-backup.json', JSON.stringify(commands, null, 2));
```

### Partial Update (Advanced)

```javascript
// Update single command
await rest.patch(
    Routes.applicationCommand(clientId, commandId),
    { body: commandData }
);
```

---

## Troubleshooting

### Commands Not Showing

1. **Check Propagation:** Wait full hour for global commands
2. **Restart Discord:** Clear client cache
3. **Check Scopes:** Ensure bot invited with applications.commands
4. **Verify Deployment:** Check Discord Developer Portal → Applications → Your Bot → Commands

### Commands Showing Old Data

1. **Redeploy:** Run deploy-commands.js again
2. **Clear Cache:** Restart Discord client
3. **Check Code:** Verify latest code is deployed

### Duplicate Commands

1. **Flush All:** Run flush-commands.js
2. **Clean Deploy:** Run deploy-commands.js
3. **Wait:** Allow propagation time

---

## Integration with Bot

### Automatic Loading

Bot automatically loads commands on startup (app.js:90-109):

```javascript
client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    if (!folder.includes('Modules')) {
        // Load .js files
    }
}
```

### Command Execution

Bot handles commands via InteractionCreate event (app.js:242-292):

```javascript
client.on(Events.InteractionCreate, async interaction => {
    if (interaction.isChatInputCommand()) {
        const command = interaction.client.commands.get(interaction.commandName);
        await command.execute(interaction);
    }
});
```

---

## Summary

| Script | Purpose | Effect | Propagation |
|--------|---------|--------|-------------|
| `deploy-commands.js` | Register commands | Adds/updates all commands | ~1 hour |
| `flush-commands.js` | Remove commands | Deletes all commands | Instant |

**Key Points:**
- Deploy after adding/modifying commands
- Flush for clean slate
- Global commands take time to propagate
- Bot automatically loads command files
- Command_Modules folder excluded from deployment
