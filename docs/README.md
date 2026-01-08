# Overseer Discord Bot - Complete Documentation

## Overview

Overseer is a comprehensive Discord moderation and management bot built with Discord.js. It provides extensive logging, moderation tools, user monitoring, and customization features.

---

## 📁 Project Structure

```
Overseer/
├── app.js                          # Main bot entry point
├── deploy-commands.js              # Command deployment script
├── flush-commands.js               # Command cleanup script
├── config.json                     # Configuration (not in repo)
├── Event_Modules/                  # Event handlers and utilities
│   ├── embedcreator.js            # Embed/button creation
│   ├── essentials.js              # Utility functions
│   ├── fsfuncs.js                 # File system operations
│   ├── guildevents.js             # Guild event handlers
│   ├── messageevents.js           # Message event handlers
│   └── locales/
│       └── parselocale.js         # Time parsing locale
├── commands/                       # Slash commands
│   ├── Channels/                  # Channel management (7 files)
│   ├── Command_Modules/           # Utility modules (5 files)
│   ├── Messages/                  # Message commands (3 files)
│   ├── Misc/                      # Miscellaneous (9 files)
│   ├── Moderation/                # Moderation tools (8 files)
│   └── Roles/                     # Role management (4 files)
└── docs/                          # This documentation
```

---

## 🚀 Quick Start

### Prerequisites
```json
{
    "token": "your-discord-bot-token",
    "clientId": "your-bot-client-id",
    "contact": "your-user-id-for-errors",
    "dbusr": "mongodb-username",
    "dbpwd": "mongodb-password",
    "addr": "mongodb-address",
    "activedb": "database-name",
    "msgcol": "messages",
    "srvcol": "servers",
    "fishcol": "fish",
    "notecol": "notes",
    "persistcol": "persistence",
    "bancol": "bans",
    "secretkeyscol": "secretkeys",
    "channelscol": "channels",
    "focuscol": "focus",
    "filtercol": "filters",
    "botlistmetoken": "optional-botlist-token",
    "botlistmeURL": "optional-botlist-url"
}
```

### Installation
```bash
npm install
node deploy-commands.js
node app.js
```

---

## 📚 Documentation Index

### Core System
- **[app.js](./app.md)** - Main application, event routing, timers
- **[Deployment](./DEPLOYMENT.md)** - Command deployment and management

### Event Modules
- **[embedcreator.js](./Event_Modules/embedcreator.md)** - Embed and button utilities
- **[essentials.js](./Event_Modules/essentials.md)** - Core utility functions
- **[fsfuncs.js](./Event_Modules/fsfuncs.md)** - File system helpers
- **[guildevents.js](./Event_Modules/guildevents.md)** - Member, voice, presence events
- **[messageevents.js](./Event_Modules/messageevents.md)** - Message, reaction events
- **[parselocale.js](./Event_Modules/parselocale.md)** - Time parsing configuration

### Command Categories
- **[Channels](./commands/Channels/CHANNELS_README.md)** - Channel management and user monitoring
- **[Command Modules](./commands/Command_Modules/COMMAND_MODULES_README.md)** - Utility classes and helpers
- **[Messages](./commands/Messages/MESSAGES_README.md)** - Join/leave message configuration
- **[Misc](./commands/Misc/MISC_README.md)** - Utility commands (help, ping, serverinfo, etc.)
- **[Moderation](./commands/Moderation/MODERATION_README.md)** - Ban, timeout, purge, notes
- **[Roles](./commands/Roles/ROLES_README.md)** - Role assignment and persistence

---

## 🎯 Key Features

### Logging & Monitoring
- **Message Logging:** All messages stored for 14 days
- **Edit/Delete Tracking:** Full message history
- **User Monitoring (Focus):** Dedicated channels for user activity
- **Voice State Tracking:** Join/leave/mute/deafen events
- **Presence Updates:** Online/offline/away status changes

### Moderation
- **AutoMod:** Keyword/regex filtering with punishments
- **Timeouts:** Configurable timeout durations
- **Bans:** Permanent and temporary bans
- **Notes:** User note system with serial tracking
- **Purge:** Advanced message deletion with filters

### User Management
- **Role Persistence:** Restore roles when users rejoin
- **Join Roles:** Automatic role assignment on join
- **Secret Keys:** Role assignment via message triggers
- **Focus System:** Comprehensive user monitoring

### Channel Management
- **Log Channels:** Configurable per event type
- **Temporary Access:** Auto-removing voice permissions
- **Permanent Access:** Persistent voice permissions
- **Host Migration:** Bulk voice channel moves

### Customization
- **Join/Leave Messages:** Custom welcome/goodbye messages
- **Default Nicknames:** Auto-nickname new members
- **Fish Mode:** Fun Easter egg features
- **Auto-Delete List:** Auto-delete from specific users

---

## 🔧 Configuration

### Server Setup (Per-Guild)

Configured via `/setlogchannel` and other admin commands:

```javascript
{
    srv: "guild-id",
    name: "Server Name",
    icon: "icon-url",

    // Log Channels
    delete: "channel-id",         // Message deletions
    update: "channel-id",         // Message edits
    join: "channel-id",           // Join messages
    leave: "channel-id",          // Leave messages
    bans: "channel-id",           // Ban notifications
    command: "channel-id",        // Command usage
    joinstat: "channel-id",       // Join statistics
    leavestat: "channel-id",      // Leave statistics
    banstat: "channel-id",        // Ban statistics
    userupdate: "channel-id",     // Role/nickname changes
    moderationlog: "channel-id",  // AutoMod actions

    // Settings
    rolepersistence: false,       // Restore roles on rejoin
    ismsgembed: false,            // Send messages as embeds
    fishmode: false,              // Enable fish mode
    defaultnick: "",              // Default nickname

    // Messages
    joinmsg: "Welcome {@user}!!!",
    leavemsg: "Goodbye!\n{@user} left the server. :(",
    banmsg: "{@user} has been banned from {servername}!",

    // Arrays
    autodelist: [],               // Auto-delete user IDs
    joinroles: [],                // Auto-assign role IDs
    secretkeys: []                // Secret key configs
}
```

### Message Placeholders
- `{@user}` - Mention the user
- `{servername}` - Server name
- `{username}` - User's username
- `{user}` - User's global/display name

---

## 💾 Database Collections

### MongoDB Collections

| Collection | Purpose | Documents |
|------------|---------|-----------|
| `msgcol` | Message storage | 14-day expiry |
| `srvcol` | Server configuration | One per guild |
| `fishcol` | Fish names | Static data |
| `notecol` | User notes | Moderation records |
| `persistcol` | Role persistence | User roles/nicknames |
| `bancol` | Temporary bans | Auto-expire tracking |
| `secretkeyscol` | Secret keys | Role assignments |
| `channelscol` | Channel access | Temporary/permanent |
| `focuscol` | Focus monitoring | Active monitors |
| `filtercol` | Keyword filters | AutoMod patterns |

---

## 🎮 Command Categories

### Channels (7 Commands)
- `/focus` - Monitor user activity
- `/unfocus` - Stop monitoring
- `/hostmigration` - Move VC members
- `/onetimeaccess` - Temporary VC access
- `/permaccess` - Permanent VC access
- `/setlogchannel` - Configure logging
- `/unsetlogchannel` - Disable logging

### Moderation (8 Commands)
- `/ban` - Ban user permanently
- `/tempban` - Temporary ban
- `/timeout` - Timeout user
- `/note` - Add user note
- `/userstats` - View user notes
- `/purge` - Delete messages
- Context: Mod Menu, Note List, User Stats

### Roles (4 Commands)
- `/addroletoallusers` - Bulk role assignment
- `/joinroles` - Configure auto-roles
- `/secretkeys` - Manage secret keys
- `/togglepersistence` - Enable/disable role persistence

### Messages (3 Commands)
- `/setjoinmessage` - Configure join message
- `/setleavemessage` - Configure leave message
- `/supersecretmsgcommand` - Special message features

### Misc (9 Commands)
- `/help` - Interactive help pages
- `/ping` - Latency test
- `/serverinfo` - Server information
- `/count` - Count messages
- `/createembed` - Custom embeds
- `/fishmode` - Toggle fish mode
- `/test` - Testing command
- `/timeconversion` - Time utilities
- `/updateval` - Update values

---

## ⚡ Event System

### Guild Events
- **GuildCreate:** Initialize server config
- **GuildDelete:** Cleanup on leave
- **GuildUpdate:** Track name/icon changes
- **MemberJoin:** Welcome, roles, persistence
- **MemberLeave:** Goodbye, cleanup
- **MemberUpdate:** Track role/nickname changes
- **UserUpdate:** Track username/avatar changes
- **GuildBanAdd:** Log bans
- **VoiceStateUpdate:** Voice tracking, access cleanup
- **PresenceUpdate:** Online/offline monitoring

### Message Events
- **MessageCreate:** Logging, filtering, fish mode, secret keys
- **MessageUpdate:** Edit tracking
- **MessageDelete:** Deletion logging
- **MessageBulkDelete:** Purge logging
- **MessageReactionAdd/Remove:** Reaction tracking

---

## 🔐 Permission System

### Command Permissions
- **Administrator:** Focus, unfocus
- **Manage Server:** Access commands
- **Manage Channels:** Log channel config
- **Manage Roles:** Role commands
- **Kick Members:** Moderation
- **Ban Members:** Ban commands
- **Move Members:** Host migration
- **Moderate Members:** Timeout

### Bot Permissions Required
- View Channels
- Send Messages
- Embed Links
- Attach Files
- Add Reactions
- Manage Channels
- Manage Roles
- Kick/Ban Members
- Moderate Members
- Manage Nicknames
- Read Message History
- Connect (Voice)
- Speak (Voice)
- Move Members

---

## 🧪 Special Features

### Focus System
**Purpose:** Monitor ALL activity of a specific user

**Creates dedicated channel logging:**
- Messages (with content)
- Edits and deletions
- Voice channel activity
- Mute/deafen states
- Username/nickname/avatar changes
- Online/offline status
- Server join/leave
- Reactions

### Fish Mode
**Easter egg features:**
- Reacts with 🐟 to fish names
- Blocks "ghoti" in messages/nicknames
- Special reactions for specific users
- Reply to "you know what that means"

### AutoMod System
**Keyword/regex filtering:**
- Pattern matching (regex support)
- Case-insensitive by default
- Optional timeout punishments
- DM notifications to users
- Moderation log integration
- Serial numbered notes

### Secret Keys
**Automatic role assignment:**
- Text search matching
- Age requirement checking
- MongoDB text search indexed
- Fuzzy matching support

### Temporary Access
**Auto-removing permissions:**
- Cleanup on channel empty
- Cleanup on user leave
- Periodic checks every 2 minutes
- Permanent access option with `perm` flag

---

## 🔄 Timer Events

### startPresence (7s rotation)
1. "Overseeing..."
2. "In X servers!"
3. "Uptime: X days Y hours..."

### banTimer (60s)
- Checks for expired temporary bans
- Auto-unbans users
- Deletes ban records

### keepAlive (5s)
- Updates availability in global database
- Reports uptime and last seen

### updateList (24h)
- Updates bot list statistics
- Server count reporting

### channelsCheckStart (2min)
- Cleans up temporary channel access
- Removes permissions from empty channels
- Preserves permanent access

---

## 📊 Statistics & Tracking

### Message Storage
- 14-day automatic expiration
- Includes content, attachments, author
- Links to focus messages
- Enables accurate edit/delete logging

### Note System
- Serial numbered notes
- Type categorization (ban, timeout, note, automod)
- Author tracking
- Timestamp logging
- Paginated viewing

### Code Statistics
Bot reports total lines of code on startup:
- Scans all .js files
- Includes commands and modules
- Excludes node_modules

---

## 🐛 Error Handling

### Global Error Handler
```javascript
process.on('uncaughtException', async (err) => {
    await essentials.log(err.stack, err.code);
});
```

### Event Error Pattern
All event handlers wrapped in try-catch:
1. Log error to database
2. Send stack trace to contact user DM
3. Reply to interaction if applicable

### Ignored Errors
- `GuildMembersTimeout` - Silently ignored

---

## 📝 Development

### Adding New Commands

1. **Create command file:**
   ```javascript
   // commands/Category/commandname.js
   const { SlashCommandBuilder } = require('discord.js');

   module.exports = {
       data: new SlashCommandBuilder()
           .setName('commandname')
           .setDescription('Description')
           .addOptions(...),

       async execute(interaction) {
           // Logic here
       }
   };
   ```

2. **Deploy commands:**
   ```bash
   node deploy-commands.js
   ```

3. **Restart bot:**
   ```bash
   node app.js
   ```

### Testing
- Use guild commands for instant propagation
- Check console for loading warnings
- Verify permissions
- Test error handling

---

## 🔗 Integration Points

### External Services
- MongoDB for data storage
- Discord API for interactions
- botlist.me for statistics (optional)
- HTTP webhooks for stream notifications (ports 3110, 3111)

### Hardcoded Values
- Bot ID: `1205253895258120304`
- Contact user varies by config
- Special channel: `1422378190122385529` (Carp-only)
- Stream channel: `1345093720822775839`
- Stream user: `528963161622052915` (Sci)
- Stream guild: `1190516697174659182`

---

## 📖 Further Reading

- **[Discord.js Guide](https://discordjs.guide/)** - Discord.js documentation
- **[Discord API](https://discord.com/developers/docs)** - Official API docs
- **[MongoDB Manual](https://docs.mongodb.com/)** - Database documentation

---

## 📄 License & Credits

**Bot:** Overseer
**Framework:** Discord.js v14
**Database:** MongoDB
**Author:** Based on config contact user

---

## 🆘 Support

For errors and issues:
- Check logs in console
- Review error DMs sent to contact user
- Verify MongoDB connection
- Check Discord bot token validity
- Ensure all permissions granted
- Review config.json settings

---

**Last Updated:** January 2026
**Discord.js Version:** 14.x
**Node.js Version:** 16+ required
