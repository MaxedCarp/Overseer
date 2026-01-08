# guildevents.js - Guild Event Handlers

## Overview
**File:** `Event_Modules/guildevents.js`
**Purpose:** Handles all Discord guild-related events including member join/leave, bans, updates, voice states, and presence changes

## Dependencies
```javascript
const { EmbedBuilder, PermissionFlagsBits, AttachmentBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const EmbedCreator = require('./embedcreator.js');
const essentials = require('./essentials.js');
```

## Class: guildEvents

All methods are static and return Promises.

---

## Member Events

### MemberJoin(member)
**Purpose:** Handles when a user joins a server
**Parameters:** `member` - GuildMember object

**Workflow:**
1. **Ban Check**: If user has pending ban in database, ban immediately and delete record
2. **User Type Check**: Skips bots and system users for join messages
3. **Join Message**: Sends customizable welcome message (if not banned)
4. **Default Nickname**: Sets default nickname if configured
5. **Role Persistence**: Restores previous roles if enabled
6. **Join Roles**: Assigns automatic join roles
7. **Focus Notification**: Sends alert if user is being monitored
8. **Statistics Log**: Posts detailed join embed to log channel

**Role Assignment Priority:**
1. Persisted roles (if role persistence enabled)
2. Join roles
3. Combined (both persisted + join roles)

**Database Collections Used:**
- `srvcol`: Server configuration
- `persistcol`: Role persistence data
- `bancol`: Ban records
- `focuscol`: Focus/monitoring records

**Join Message Placeholders:**
- `{@user}`: Mentions the user
- `{servername}`: Server name
- `{username}`: User's username
- `{user}`: User's global/display name

**Embed Colors:**
- Join: `0x69FA04` (Green)

---

### MemberLeave(member)
**Purpose:** Handles when a user leaves a server
**Parameters:** `member` - GuildMember object

**Workflow:**
1. **Ban Check**: If user has pending ban, ban them and delete record
2. **Leave Message**: Sends customizable goodbye message (if not bot/system/banned)
3. **Focus Notification**: Sends alert if user is being monitored
4. **Statistics Log**: Posts detailed leave embed with join date

**Leave Message Placeholders:**
- Same as join message: `{@user}`, `{servername}`, `{username}`, `{user}`

**Statistics Fields:**
- ID, Bot status, Username, Global Name
- Discriminator, Avatar
- **Join Date**: When they originally joined
- **Created On**: Account creation date

**Embed Colors:**
- Leave: `0xFA042A` (Red)

---

### MemberUpdate(oldMember, newMember)
**Purpose:** Tracks member role and nickname changes
**Parameters:**
- `oldMember` - GuildMember before update
- `newMember` - GuildMember after update

**Tracked Changes:**
1. **Nickname Changes**
   - Shows old vs new nickname
   - **Fish Mode Check**: Blocks "ghoti" in nicknames
   - Sends DM: "Sorry, not a real word!"
   - Resets nickname to global name
2. **Role Changes**
   - Added roles
   - Removed roles
   - Both displayed separately

**Role Persistence:**
- Saves roles/nickname to database after 7.5 seconds of joining
- Skips immediate joins to avoid race conditions
- Updates existing record or creates new one

**Focus Integration:**
- Sends nickname change notifications to focus channel
- Includes timestamp

**Fish Mode "ghoti" Detection:**
```javascript
newMember.nickname.toLowerCase()
    .replaceAll(" ", "")
    .replaceAll("*", "o")
    .includes("ghoti")
```

**Embed Colors:**
- Update: `0xff9900` (Orange)

---

### MemberBan(ban)
**Purpose:** Handles user ban events
**Parameters:** `ban` - GuildBan object

**Workflow:**
1. **Ban Message**: Sends customizable ban notification
2. **Focus Notification**: Alerts if user is being monitored
3. **Statistics Log**: Posts detailed ban embed

**Ban Message Placeholders:**
- `{@user}`, `{servername}`, `{username}`, `{user}`

**Statistics Fields:**
- ID, Bot status, Username, Global Name
- Discriminator, Avatar
- Created On timestamp

**Embed Colors:**
- Ban: `0xFA042A` (Red)

---

## User Events

### UserUpdate(oldUser, newUser)
**Purpose:** Tracks global user profile changes across all servers
**Parameters:**
- `oldUser` - User before update
- `newUser` - User after update

**Tracked Changes:**
1. **Username Change**
   - Updates focus channel name to `focus-{newUsername}`
   - Logs old vs new username
2. **Global Name Change**
   - Logs old vs new display name
3. **Avatar Change**
   - Shows old and new avatar URLs
   - Attaches new avatar to focus notification
   - Sets thumbnail to new avatar
4. **System Status Change**
   - Tracks system account status (rare)
5. **Bot Status Change**
   - Tracks bot status changes (rare)

**Multi-Server Handling:**
- Iterates through all guilds bot is in
- Only processes if user is a member of that guild
- Sends update to each server's log channel

**Embed Colors:**
- Update: `0xff9900` (Orange)

---

## Guild Events

### GuildUpdate(oGuild, nGuild)
**Purpose:** Tracks server name/icon changes
**Parameters:**
- `oGuild` - Guild before update
- `nGuild` - Guild after update

**Tracked Changes:**
- Server name
- Server icon URL

**Database Action:**
Updates server record with new name and icon

---

### GuildCreate(guild)
**Purpose:** Initializes bot configuration when joining a new server
**Parameters:** `guild` - Guild object

**Default Configuration:**
```javascript
{
    srv: guild.id,
    name: guild.name,
    icon: guild.iconURL(),
    delete: "none",           // Message delete log channel
    update: "none",           // Message update log channel
    join: "none",             // Join message channel
    leave: "none",            // Leave message channel
    bans: "none",             // Ban message channel
    command: "none",          // Command log channel
    joinstat: "none",         // Join statistics channel
    leavestat: "none",        // Leave statistics channel
    banstat: "none",          // Ban statistics channel
    userupdate: "none",       // User update log channel
    rolepersiustence: false,  // Role persistence toggle
    joinmsg: "Welcome {@user}!!!",
    leavemsg: "Goodbye!\n{@user} left the server. :(",
    banmsg: "{@user} has been banned from {servername}!",
    ismsgembed: false,        // Send messages as embeds
    defaultnick: "",          // Default nickname for new members
    autodelist: [],           // Auto-delete message users
    joinroles: [],            // Automatic join roles
    editlog: [],              // Edit log (unused in current code)
    banlist: [],              // Ban list (unused in current code)
    secretkeys: [],           // Secret keys for role assignment
    fishmode: false           // Fish mode toggle
}
```

**Behavior:**
- Only creates config if server doesn't already exist in database
- Allows bot to rejoin servers without losing config

---

### GuildDelete(guild)
**Purpose:** Cleanup when bot leaves/is removed from server
**Parameters:** `guild` - Guild object

**Cleanup Actions:**
1. Deletes server configuration from `srvcol`
2. Deletes all role persistence data for that server from `persistcol`

---

## Voice State Events

### VoiceState(oldState, newState)
**Purpose:** Comprehensive voice channel event tracking
**Parameters:**
- `oldState` - VoiceState before change
- `newState` - VoiceState after change

**Event Types Detected:**

#### 1. Leave Voice Channel
**Condition:** `oldChan && !newChan`
**Actions:**
- Clean up one-time access permissions if channel empty
- Send focus notification with remaining participants
- Notify other focused participants

**Permission Cleanup:**
- Removes temporary channel access (`!overwrite.perm`)
- Deletes database record
- Only cleans if channel is empty OR user left with temp permission

#### 2. Join Voice Channel
**Condition:** `!oldChan && newChan`
**Actions:**
- Send focus notification with other participants
- Notify other focused participants
- **Special Channel Protection** (`1422378190122385529`):
  - Disconnects non-Carp users without permission
  - Sends DM: "Please message Carp before trying to join this channel!"
- **Stream Notification** (Channel `1345093720822775839`, User `528963161622052915`):
  - Offers to notify others about stream
  - Shows button modal if hasn't streamed today

#### 3. Move Between Channels
**Condition:** `oldChan && newChan && oldChan !== newChan`
**Actions:**
- Send focus notification with old and new participants
- Clean up temporary permissions in old channel (if empty)
- Check special channel protection for new channel
- Lists participants in both channels

#### 4. Self Deafen Toggle
**Tracks:** User deafening/undeafening themselves
**Focus Notification:** "USER HAS SELF DEAFENED!" or "USER HAS SELF UN-DEAFENED!"

#### 5. Self Mute Toggle
**Tracks:** User muting/unmuting themselves
**Condition:** Only tracks if NOT self-deafened
**Focus Notification:** "USER HAS SELF MUTED!" or "USER HAS SELF UN-MUTED!"

#### 6. Server Mute Toggle
**Tracks:** Moderator muting/unmuting user
**Focus Notification:** "USER WAS SERVER MUTED!" or "USER WAS SERVER UN-MUTED!"

#### 7. Server Deafen Toggle
**Tracks:** Moderator deafening/undeafening user
**Focus Notification:** "USER WAS SERVER DEAFENED!" or "USER WAS SERVER UN-DEAFENED!"

**Hardcoded Values:**
- Protected channel: `1422378190122385529` (only Carp `275305152842301440` allowed)
- Stream channel: `1345093720822775839`
- Stream user (Sci): `528963161622052915`
- Stream guild: `1190516697174659182`

**Permission Cleanup Logic:**
```javascript
if (!overwrite.perm) {  // If not permanent
    // Remove permission overwrite
    // Delete from channelscol
}
```

---

## Presence Events

### PresenceUpdate(oldPresence, newPresence)
**Purpose:** Track online/offline/away status changes
**Parameters:**
- `oldPresence` - Presence before update
- `newPresence` - Presence after update

**Tracked Statuses:**
- `offline`: User went offline
- `online`: User came online
- `idle`: User is away/idle
- `dnd`: Do not disturb

**Status Change Messages:**
- Offline: "USER HAS GONE OFFLINE!"
- Online (from offline): "USER HAS COME ONLINE!"
- Idle: "USER IS NOW AWAY!"
- Not idle anymore: "USER IS NO LONGER AWAY!"

**Conditions:**
- Only tracks non-bot users
- Only tracks users being focused
- Only tracks meaningful status changes
- Ignores DND ↔ Online transitions (returns early)

**Focus Integration:**
- Sends notification to focus channel
- Includes UTC timestamp

---

## Focus System

**Purpose:** Monitor specific users across all activities

**Integrated Events:**
- Member join/leave
- Message create/edit/delete
- Voice state changes
- Username/nickname/avatar changes
- Online/offline status

**Notification Format:**
```
**EVENT DESCRIPTION!**
[Additional context]
-# Time: <UTC timestamp>
```

**Database:**
- Collection: `focuscol`
- Fields: `userid`, `srv`, `ch` (channel to send notifications)

**Check Function:**
```javascript
await essentials.checkFocus(userId, serverId)
```

---

## Fish Mode

**Nickname Check:**
- Blocks "ghoti" in nicknames
- Replaces `*` with `o` before checking
- Resets to global name if detected
- Sends temporary DM notification

---

## Database Schema

### srvcol (Server Configuration)
```javascript
{
    srv: String,              // Guild ID
    name: String,             // Guild name
    icon: String,             // Icon URL
    delete: String,           // Channel ID or "none"
    update: String,           // Channel ID or "none"
    join: String,             // Channel ID or "none"
    leave: String,            // Channel ID or "none"
    bans: String,             // Channel ID or "none"
    command: String,          // Channel ID or "none"
    joinstat: String,         // Channel ID or "none"
    leavestat: String,        // Channel ID or "none"
    banstat: String,          // Channel ID or "none"
    userupdate: String,       // Channel ID or "none"
    moderationlog: String,    // Channel ID or "none"
    rolepersistence: Boolean,
    joinmsg: String,
    leavemsg: String,
    banmsg: String,
    ismsgembed: Boolean,
    defaultnick: String,
    autodelist: Array,
    joinroles: Array,
    fishmode: Boolean,
    stream: Number            // Timestamp
}
```

### persistcol (Role Persistence)
```javascript
{
    srv: String,          // Guild ID
    userid: String,       // User ID
    nickname: String,     // Nickname
    roles: Array          // Array of role IDs
}
```

### channelscol (Channel Access)
```javascript
{
    srv: String,          // Guild ID
    channelID: String,    // Channel ID
    userID: String,       // User ID
    perm: Boolean         // Permanent access flag (optional)
}
```

### focuscol (Focus Monitoring)
```javascript
{
    userid: String,       // User ID being monitored
    srv: String,          // Guild ID
    ch: String            // Channel ID for notifications
}
```

---

## Permission Checks

All log channel sends check permissions:
```javascript
if (
    ((guild.members.me).permissionsIn(channelId).has(PermissionFlagsBits.SendMessages) &&
     (guild.members.me).permissionsIn(channelId).has(PermissionFlagsBits.ViewChannel)) ||
    (guild.members.me).permissionsIn(channelId).has(PermissionFlagsBits.Administrator)
) {
    // Send message
}
```

---

## Notes

- All events return Promises
- Extensive focus system integration
- Role persistence delay: 7.5 seconds after join
- Special protections for specific channels/users
- Fish mode "ghoti" detection and blocking
- Temporary channel access cleanup on empty
- Stream notification integration
- Multi-server user update broadcasting
- Comprehensive voice state tracking
- Bot message filtering (skips bot actions)
