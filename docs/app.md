# app.js - Overseer Discord Bot Main Application

## Overview
**File:** `app.js`
**Purpose:** Main entry point for the Overseer Discord bot. Handles bot initialization, command loading, event management, and timer-based tasks.

## Dependencies

### Discord.js
```javascript
const { Client, Collection, Events, GatewayIntentBits, Partials, ActivityType, EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonStyle, ChannelType, PermissionsBitField, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
```

### Database
- **MongoDB**: For persistent data storage
- **Collections**: Messages, servers, fish, notes, persistence, bans, secret keys, channels, focus, filters

### Internal Modules
- `Event_Modules/embedcreator.js`: Creates Discord embeds
- `Event_Modules/essentials.js`: Utility functions
- `Event_Modules/fsfuncs.js`: File system operations
- `Event_Modules/guildevents.js`: Guild event handlers
- `Event_Modules/messageevents.js`: Message event handlers
- `commands/Command_Modules/forms.js`: Help form generation

### Other
- `http`: HTTP server for live stream notifications
- `events`: Event emitter for custom events
- `cli-color`: Terminal color output

## Configuration
Loads from `config.json`:
- `token`: Discord bot token
- `contact`: Contact user ID for error notifications
- `dbusr`, `dbpwd`, `addr`: MongoDB credentials
- `activedb`: Active database name
- Collection names: `msgcol`, `srvcol`, `fishcol`, `notecol`, `persistcol`, `bancol`, `secretkeyscol`, `channelscol`, `focuscol`, `filtercol`
- `botlistmetoken`, `botlistmeURL`: Bot list integration

## Client Initialization

### Gateway Intents
```javascript
intents: [
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildBans,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildVoiceStates
]
```

### Partials
```javascript
partials: [Partials.Channel, Partials.Message, Partials.Reaction]
```

## Bot Ready Event (Lines 60-83)

Triggered once when the bot successfully connects to Discord.

### Actions
1. **Console Output**: Displays total lines of code and bot username
2. **Global Initialization**:
   - `global.client`: Discord client instance
   - `global.connections`: Connection tracking object
   - `global.mongo`: MongoDB connection
   - `global.db`: Active database
   - Database collections assigned to global scope
3. **Set Initial Presence**: "Bot started up!"
4. **Emit Events**: `banTimer`, `keepAlive`, `updateList`, `startPresence` (after 5s), `channelsCheckStart`

### Database Collections (Lines 66-75)
```javascript
global.msgcol      // Messages collection
global.srvcol      // Servers collection
global.fishcol     // Fish mode collection
global.notecol     // Notes collection
global.persistcol  // Role persistence collection
global.bancol      // Bans collection
global.secretkeyscol  // Secret keys collection
global.channelscol    // Channel access collection
global.focuscol       // Focus mode collection
global.filtercol      // Keyword filter collection
```

## Command Loading System (Lines 90-109)

### Process
1. Scans `./commands` directory for subdirectories
2. Excludes folders containing "Modules"
3. Loads all `.js` files from each subdirectory
4. Validates commands have `data` and `execute` properties
5. Adds to `client.commands` Collection

### Command Structure
```javascript
{
    data: SlashCommandBuilder,  // Command definition
    execute: Function          // Execution function
}
```

## Timer Events

### startPresence Event (Lines 111-141)
**Frequency**: Every 7 seconds (rotating)
**Purpose**: Update bot status with rotation

**Rotation Cycle**:
1. "Overseeing..." (7s)
2. "In X servers!" (7s)
3. "Uptime: X days X hours X minutes X seconds" (7s, then repeat)

### banTimer Event (Lines 142-165)
**Frequency**: Every 60 seconds
**Purpose**: Check for expired temporary bans and automatically unban users

**Process**:
1. Query all temp bans with `expire < current_time`
2. Unban each user
3. Delete ban record from database

**Database Query**:
```javascript
{
    "srv": guild.id,
    "type": "temp",
    expire: {$lt: parseInt(new Date().getTime() / 1000)}
}
```

### keepAlive Event (Lines 167-181)
**Frequency**: Every 5 seconds
**Purpose**: Update availability status in global database

**Updates**:
- `lastreported`: Current Unix timestamp
- `uptime`: Client uptime in milliseconds

### updateList Event (Lines 182-204)
**Frequency**: Every 24 hours (86400000ms)
**Purpose**: Update bot statistics on botlist.me
**Condition**: Only runs if bot ID is `1205253895258120304`

**Payload**:
```json
{
    "server_count": <guild_count>,
    "shard_count": 1
}
```

### channelsCheckStart Event (Lines 206-240)
**Frequency**: Every 2 minutes (120000ms)
**Purpose**: Clean up temporary channel access permissions for empty channels

**Process**:
1. Iterate through all guilds and channels
2. Find channels with access records in database
3. If channel is empty (`members.size < 1`)
4. Check for permission overwrites
5. Delete non-permanent (`!overwrite.perm`) user permissions
6. Remove database record

**Database Query**:
```javascript
{
    "srv": guild.id,
    "channelID": channel.id
}
```

**Cleanup Condition**: `!overwrite.perm` (temporary access only)

## Interaction Handling (Lines 242-500)

### Chat Input Commands (Lines 243-292)

**Validation**:
- Blocks DM usage (channel.type === 1)
- Verifies command exists

**Execution Flow**:
1. Execute command
2. Log errors to contact user via DM
3. Parse command arguments
4. Create command log embed
5. Send to configured command log channel

**Error Handling**:
- Logs errors to database via `essentials.log()`
- Sends error stack trace to contact user
- Replies to user with error message (ephemeral)

**Command Logging**:
- Creates embed with command name, arguments, user info
- Posts to server's configured command log channel
- Checks bot permissions before sending

### User Context Menu Commands (Lines 293-338)

Similar to chat input commands but triggered from user context menu.

**Differences**:
- Shows target user in log embed
- Detects bot users (username !== username.toLowerCase())
- Same error handling and logging

### Button Interactions (Lines 339-448)

#### Ban Button (`ban:userID`)
- Displays confirmation button
- Ephemeral response

#### Confirm Ban Button (`confirmban:userID`)
- Creates note in database with type "ban"
- Bans the user
- Increments serial number

#### Notes Button (`notes:userID:serial:index:isPrev`)
- Displays paginated user notes
- Shows 5 notes per page
- Supports forward/backward navigation
- Disabled previous button on first page

**Button Format**: `notes:userID:serial:index:isPrev`

#### Help Button (`help:pageNumber`)
- Updates help embed to specified page
- Uses forms module to generate content

#### Stream Notify Button (`scinotify`)
- Opens modal for stream notification
- Asks which users to ping (Carp, Stabs, Atlas)
- Asks for stream time

#### Cancel Button (`cancel`)
- Deletes the message

### Modal Submit Interactions (Lines 449-499)

#### Stream Notify Modal (`streamNotify`)
**Fields**:
- `pingCarp`: y/n
- `pingStabs`: y/n
- `pingAtlas`: y/n
- `howLong`: Time until stream (e.g., "1h30m")

**Process**:
1. Validates each field (must be "y" or "n")
2. Parses time using `essentials.parsetime()`
3. Sends DM to selected users with timestamp
4. Updates server stream timestamp in database
5. Deletes the modal message

**Hardcoded User IDs**:
- Carp: `275305152842301440`
- Stabs: `401210999518265358`
- Atlas: `800070620079456286`

## Guild Event Handlers (Lines 502-592)

All events wrapped in try-catch with error logging to contact user.

| Event | Handler Function |
|-------|-----------------|
| `GuildCreate` | `guildEvents.GuildCreate()` |
| `GuildDelete` | `guildEvents.GuildDelete()` |
| `GuildUpdate` | `guildEvents.GuildUpdate()` |
| `GuildMemberAdd` | `guildEvents.MemberJoin()` |
| `GuildMemberRemove` | `guildEvents.MemberLeave()` |
| `GuildMemberUpdate` | `guildEvents.MemberUpdate()` |
| `UserUpdate` | `guildEvents.UserUpdate()` |
| `GuildBanAdd` | `guildEvents.MemberBan()` |
| `VoiceStateUpdate` | `guildEvents.VoiceState()` |
| `PresenceUpdate` | `guildEvents.PresenceUpdate()` |

## Message Event Handlers (Lines 594-648)

All events wrapped in try-catch with error logging to contact user.

| Event | Handler Function |
|-------|-----------------|
| `MessageCreate` | `messageEvents.MessageCreate()` |
| `MessageUpdate` | `messageEvents.MessageUpdate()` |
| `MessageDelete` | `messageEvents.MessageDelete()` |
| `MessageBulkDelete` | `messageEvents.MessageBulkDelete()` |
| `MessageReactionAdd` | `messageEvents.ReactionAdd()` |
| `MessageReactionRemove` | `messageEvents.ReactionRemove()` |

## Utility Functions

### sleep(seconds) - Line 651
```javascript
function sleep(seconds) {
    return new Promise(r => setTimeout(r, seconds * 1000))
}
```
**Purpose**: Async sleep function
**Parameters**: `seconds` (number)
**Returns**: Promise that resolves after specified time

### getArgs(obj) - Lines 655-684
**Purpose**: Parse command interaction arguments into readable format
**Parameters**: `obj` - Interaction option object
**Returns**: `{name: string, val: string}`

**Supported Types**:
- Type 3: String
- Type 4: Integer
- Type 5: Boolean
- Type 6: User
- Type 7: Channel (formatted as `<#channelID>`)
- Type 8: Role (name and ID)
- Type 9: Mentionable
- Type 10: Number
- Type 11: Attachment (content type, name, URL)

### printLines() - Lines 686-735
**Purpose**: Count total lines of code in the project
**Returns**: Number of lines

**Scanned Locations**:
1. Base directory `.js` files
2. `commands/` folder (all subdirectories)
3. `Event_Modules/` folder (recursive)

**Excludes**: `node_modules/`

### countTime() - Lines 772-781
**Purpose**: Convert bot uptime to human-readable format
**Returns**: `{days, hours, minutes, seconds}`

**Calculation**:
```javascript
totalSeconds = client.uptime / 1000
days = totalSeconds / 86400
hours = (totalSeconds % 86400) / 3600
minutes = (totalSeconds % 3600) / 60
seconds = totalSeconds % 60
```

## HTTP Servers

### Live Server (Port 3110) - Lines 737-753
**Purpose**: Handle "stream started" webhook
**Action**: Remove Connect permission from @everyone role in guild `1190516697174659182`

### Not Live Server (Port 3111) - Lines 754-770
**Purpose**: Handle "stream ended" webhook
**Action**: Restore Connect permission to @everyone role in guild `1190516697174659182`

**Implementation**:
- Uses `isLive` flag to prevent duplicate executions
- Modifies role permissions using `PermissionsBitField`
- Responds with "OK" to webhook

## Error Handling

### Uncaught Exceptions (Lines 86-88)
```javascript
process.on('uncaughtException', async (err) => {
    await essentials.log(err.stack, err.code);
});
```

### Try-Catch Pattern
All event handlers use consistent error handling:
1. Log error to database via `essentials.log()`
2. Send error stack trace to contact user DM
3. Reply to interaction if applicable

## Global Variables

| Variable | Type | Purpose |
|----------|------|---------|
| `global.client` | Discord Client | Bot instance |
| `global.connections` | Object | Connection tracking |
| `global.mongo` | MongoClient | MongoDB connection |
| `global.db` | Database | Active database |
| `global.msgcol` | Collection | Messages |
| `global.srvcol` | Collection | Servers |
| `global.fishcol` | Collection | Fish mode |
| `global.notecol` | Collection | User notes |
| `global.persistcol` | Collection | Role persistence |
| `global.bancol` | Collection | Bans |
| `global.secretkeyscol` | Collection | Secret keys |
| `global.channelscol` | Collection | Channel access |
| `global.focuscol` | Collection | Focus mode |
| `global.filtercol` | Collection | Keyword filters |

## Key Features

1. **Automatic Command Loading**: Scans command folders and loads dynamically
2. **Command Logging**: Tracks all command usage with embeds
3. **Temporary Bans**: Auto-unbans users when timer expires
4. **Channel Access Management**: Cleans up temporary permissions
5. **Bot List Integration**: Updates statistics daily
6. **Stream Integration**: Webhook-based stream notifications
7. **Comprehensive Error Handling**: All errors logged and reported
8. **Presence Rotation**: Dynamic status updates
9. **Uptime Tracking**: Reports to global availability database

## Notes

- Hardcoded guild ID `1190516697174659182` for stream functionality
- Hardcoded bot ID `1205253895258120304` for bot list updates
- Uses MongoDB for all persistent data
- Command log channel configurable per server (`obj.command`)
- Error notifications sent to configured contact user via DM
