# Moderation Commands Documentation

This directory contains all moderation and user management commands.

## Commands Overview

| Command | Type | Permission | Description |
|---------|------|------------|-------------|
| `/ban` | Slash | Ban Members | Permanently ban a user |
| `/tempban` | Slash | Ban Members | Temporarily ban a user |
| `/timeout` | Slash | Ban Members | Timeout/mute a user |
| `/note` | Slash | Manage Roles | Manage user notes |
| `/purge` | Slash | Manage Messages | Bulk delete messages |
| `/userstats` | Slash | Ban Members | View user information |
| `Open Mod Menu` | Context | Ban Members | Quick moderation menu |
| `View User's Note List` | Context | Ban Members | View all user notes |
| `View Detailed User Stats` | Context | Ban Members | Detailed user info |

---

## /ban <user> <delete> <ephemeral> [reason]
**File:** `ban.js`
**Permission:** Ban Members

**Purpose:** Permanently ban a user from the server

**Parameters:**
- `user` (User, Required): User to ban
- `delete` (Boolean, Required): Whether to delete user's messages (last 100)
- `ephemeral` (Boolean, Required): Whether ban notification is public
- `reason` (String): Ban reason

**Validation Checks:**
1. **Self-Ban Prevention:** Cannot ban yourself
2. **Owner Protection:** Cannot ban user `275305152842301440` (Carp)
3. **Bot Permission:** Bot must have Ban Members or Administrator
4. **Bannable Check:** User must be bannable (role hierarchy)
5. **Bot Protection:** Cannot ban other bots

**Process:**
1. Validates all checks
2. Bans user from Discord
3. Creates note in database (type: "ban")
4. Optionally purges user's messages (if delete=true)
5. Logs to moderation log channel
6. Confirms to command user

**Special Protections:**
```javascript
// Cannot ban creator
if (member.user.id === "275305152842301440") {
    // Denies with sassy message
}
```

**Note Creation:**
```javascript
{
    srv: guildId,
    userID: userId,
    username: username,
    noteAuthor: {userID, userName, globalName, avatar, avatarURL},
    type: "ban",
    text: reason || "No reason provided.",
    serial: incrementedSerial,
    time: unixTimestamp
}
```

**Message Deletion:**
- Uses `purgeset.user()` with limit 100
- Searches entire server (locale=true)
- Removes from database and Discord

**Example:**
```
/ban user: @BadUser delete: true ephemeral: false reason: Spam
→ Bans user, deletes messages, public notification
→ Note #123 created
```

---

## /tempban <user> <time> [reason]
**File:** `tempban.js`
**Permission:** Ban Members

**Purpose:** Temporarily ban a user with automatic unban

**Parameters:**
- `user` (User, Required): User to ban
- `time` (String, Required): Duration (e.g., "1h", "30m", "2d")
- `reason` (String): Ban reason

**Same Validation as `/ban`:**
- Bot/self/owner checks
- Permissions
- Bannable status

**Process:**
1. Validates user
2. Bans from Discord
3. Parses time string to seconds
4. Creates temporary ban record
5. Creates note (type: "tempban")
6. Logs to moderation log

**Ban Record Structure:**
```javascript
{
    srv: guildId,
    userId: userId,
    user: {id, username, globalName},
    expire: currentTimestamp + duration,
    type: "temp"
}
```

**Auto-Unban System:**
- Timer runs every 60 seconds (app.js:142-165)
- Queries bans where `expire < currentTime`
- Unbans user automatically
- Deletes ban record from database

**Time Parsing:**
- Uses `essentials.parsetime()`
- Supports flexible formats: "1h30m", "2 days", "90 minutes"
- Converted to seconds for display

**Example:**
```
/tempban user: @User time: 24 hours reason: Violation of rules
→ Bans user for 86400 seconds
→ Auto-unbans after 24 hours
→ Note #124 created (type: tempban)
```

**Note:** Ban persists across bot restarts (stored in database)

---

## /timeout <user> <time> [reason]
**File:** `timeout.js`
**Permission:** Ban Members (actually uses Moderate Members)

**Purpose:** Timeout/mute a user (Discord native timeout)

**Parameters:**
- `user` (User, Required): User to timeout
- `time` (String, Required): Duration
- `reason` (String): Timeout reason

**Discord Timeout Limit:** Maximum 28 days

**Validation:**
- Bot must have Moderate Members or Administrator permission
- User must be bannable
- Cannot timeout bots

**Process:**
1. Validates user
2. Parses time duration
3. **Caps at 28 days if longer** (Discord limitation)
4. Applies Discord timeout
5. Creates note (type: "timeout")
6. Logs to moderation log

**Timeout Capping:**
```javascript
if (parsedTime <= 28days) {
    member.timeout(parsedTime);
} else {
    member.timeout(28days);  // Maximum allowed
}
```

**Note Includes Duration:**
```javascript
text: `- Length: ${time}.\n${reason || "No reason provided."}.`
```

**Example:**
```
/timeout user: @User time: 2h reason: Inappropriate behavior
→ Times out user for 7200 seconds
→ Note #125 created

/timeout user: @User time: 60 days reason: Long break
→ Times out user for 28 days (capped)
→ Note states: "60 days" but applies 28 days
```

**Difference from Ban:**
- User stays in server
- Can see messages but can't send/speak
- Discord native feature
- Visual indicator in member list

---

## /note <subcommand>
**File:** `note.js`
**Permission:** Manage Roles

**Purpose:** Create, view, and delete user notes

### Subcommands

#### /note add <user> <note>
**Purpose:** Add a note to a user's record

**Parameters:**
- `user` (User, Required): Target user
- `note` (String, Required): Note content

**Process:**
1. Gets highest serial number
2. Increments by 1
3. Creates note with type "note"
4. Stores in database

**Note Structure:**
```javascript
{
    srv: guildId,
    userID: userId,
    username: username,
    noteAuthor: {userID, userName, globalName, avatar, avatarURL},
    type: "note",
    text: note,  // Supports \n for newlines
    serial: nextSerial,
    time: unixTimestamp
}
```

**Example:**
```
/note add user: @User note: Warned for mild spam
→ "Successfully added note to user: User"
→ Note #126 created
```

---

#### /note delete <id>
**Purpose:** Delete a note by serial ID

**Parameters:**
- `id` (Integer, Required): Serial number of note

**Process:**
1. Checks if note exists with that serial
2. Deletes from database
3. Confirms deletion

**Example:**
```
/note delete id: 126
→ "Note #126 deleted successfully."

/note delete id: 999
→ "Either note #999 does not exist or you have no permission to delete it."
```

**Note:** Only deletes notes in current server (by srv field)

---

#### /note list <user>
**Purpose:** View all notes for a user (paginated)

**Parameters:**
- `user` (User, Required): Target user

**Display:**
- Shows 5 notes per page
- Sorted by serial number (ascending)
- Navigation buttons (Previous/Next)
- Ephemeral embed

**Note Format:**
```
||NOTE ID:123||
- Note Type: ban
- Issued by: @Moderator
Reason text here.
-------------------
<t:1234567890:f>
```

**Pagination:**
- Previous button disabled on first page
- Next button loads next 5 notes
- Button ID: `notes:{userID}:{lastSerial}:{index}:{isPrev}`

**Example:**
```
/note list user: @User
→ Shows notes #1-5 with [Previous] [Next] buttons
Click Next → Shows notes #6-10
```

**No Notes Response:**
```
"The target user has no notes."
```

---

## /purge <subcommand>
**File:** `purge.js`
**Permission:** Manage Messages

**Purpose:** Bulk delete messages with various filters

### Subcommands

#### /purge any [limit]
**Purpose:** Delete recent messages without filtering

**Parameters:**
- `limit` (Integer): Messages to fetch (default: 100, max: 100)

**Process:**
1. Fetches last N messages from database
2. Bulk deletes from Discord
3. Cleans up database records
4. Reports count

**Example:**
```
/purge any limit: 50
→ "Successfully deleted 50 messages!"
```

---

#### /purge user <user> [limit]
**Purpose:** Delete messages from specific user

**Parameters:**
- `user` (User, Required): User to delete from
- `limit` (Integer): Messages to fetch (default: 100)

**Process:**
1. Queries database for user's messages
2. Fetches from Discord
3. Bulk deletes
4. Reports count

**Scope:** Current channel only

**Example:**
```
/purge user user: @Spammer limit: 100
→ "Successfully deleted 73 messages!"
```

---

#### /purge attachments <type> [limit] [user]
**Purpose:** Delete messages containing specific attachment types

**Parameters:**
- `type` (Choice, Required): Attachment filter
- `limit` (Integer): Messages to fetch (default: 100)
- `user` (User): Optional user filter

**Type Options:**
- **Any:** All attachments
- **Images:** image/* MIME types
- **Videos:** video/* MIME types
- **Audio:** audio/* MIME types
- **Text:** text/* MIME types
- **Other:** application/* or null types

**Process:**
1. Builds query with type filter
2. Optionally adds user filter
3. Fetches matching messages
4. Bulk deletes
5. Reports count

**Example:**
```
/purge attachments type: Images limit: 50
→ "Successfully deleted 23 messages!"

/purge attachments type: Any user: @User limit: 100
→ Deletes all attachments from specific user
```

---

## /userstats <user>
**File:** `userstats.js`
**Permission:** Ban Members

**Purpose:** Display detailed user information

**Parameters:**
- `user` (User, Required): User to view

**Displayed Information:**
- ID
- Bot status
- System status
- Username
- Global name
- Discriminator
- Avatar URL
- Join date (relative time)
- Account creation date (relative time)

**Embed:**
- Color: `0xfa8b2a` (Orange)
- Thumbnail: User avatar
- Footer: Server name and icon

**Example Output:**
```
User Detail Sheet!
@JohnDoe

ID: 1234567890
Bot: false
System: false
Username: johndoe
Global Name: John Doe
Join Date: January 1, 2024 (2 months ago)
Created On: March 15, 2020 (4 years ago)
```

---

## Context Menu Commands

### Open Mod Menu
**File:** `contextmodmenu.js`
**Permission:** Ban Members

**Purpose:** Quick access moderation menu

**Trigger:** Right-click user → Apps → Open Mod Menu

**Displayed Stats:**
- Notes count (type: "note")
- Total punishments (all types except "note")
- Bans count (type: "ban" or "tempban")

**Buttons:**
- **View Notes:** Opens note list (always shown)
- **Ban User:** Quick ban button (only if bannable)

**Ban Button Conditions:**
- Bot has Ban Members or Administrator
- User is bannable
- User is not a bot

**Example Display:**
```
Mod Menu - John Doe (johndoe)

Notes: 3
Total Punishments: 1
Bans: 0

[View Notes] [Ban User]
```

---

### View User's Note List
**File:** `contextnotelist.js`
**Permission:** Ban Members

**Purpose:** Quickly view all user notes

**Trigger:** Right-click user → Apps → View User's Note List

**Same as:** `/note list <user>` but via context menu

**Display:**
- All notes (paginated)
- Same format as `/note list`
- Navigation buttons

---

### View Detailed User Stats
**File:** `contextuserstats.js`
**Permission:** Ban Members

**Purpose:** Quickly view user details

**Trigger:** Right-click user → Apps → View Detailed User Stats

**Same as:** `/userstats <user>` but via context menu

**Display:**
- Same information as `/userstats`
- Convenient right-click access

---

## Note System

### Note Types
- `"note"` - Manual moderator note
- `"ban"` - Permanent ban record
- `"tempban"` - Temporary ban record
- `"timeout"` - Timeout/mute record
- `"automod"` - AutoMod violation (from keywordFilter)

### Serial Numbers
- Globally incrementing across all note types
- Unique identifier for each note
- Used for deletion and pagination
- Query: `findOne({serial: {$gt: -1}})` gets highest

### Note Structure
```javascript
{
    srv: String,              // Guild ID
    userID: String,           // Target user
    username: String,         // Username at time of note
    noteAuthor: {             // Moderator who created note
        userID: String,
        userName: String,
        globalName: String,
        avatar: String,
        avatarURL: String
    },
    type: String,             // Note type
    text: String,             // Note content
    serial: Number,           // Unique serial
    time: Number              // Unix timestamp
}
```

---

## Moderation Log Integration

All commands log to moderation log channel (if configured):

**Log Embed:**
- Title: "Moderation Command executed in: <#channelID>"
- Description: Command details, target user, parameters
- Color: `0xff9900` (Orange)
- Author: Moderator info
- Footer: Server info

**Logged Commands:**
- `/ban`
- `/tempban`
- `/timeout`
- `/purge`

**Requires:**
- Moderation log channel configured via `/setlogchannel type: Moderation Log`
- Bot has SendMessages and ViewChannel permissions in log channel

---

## Permission Requirements Summary

| Permission | Commands |
|------------|----------|
| Ban Members | ban, tempban, timeout, userstats, context menus |
| Manage Messages | purge, createembed |
| Manage Roles | note |

**Bot Required Permissions:**
- Ban Members (for bans)
- Moderate Members (for timeouts)
- Manage Messages (for purges)
- Send Messages (for logs)
- View Channel (for logs)

---

## Common Patterns

### Bannable Check
```javascript
if (!member?.bannable) {
    await interaction.reply({
        content: "Error: User not bannable",
        ephemeral: true
    });
    return;
}
```

### Bot Prevention
```javascript
if (member.user.bot) {
    await interaction.reply({
        content: "Cannot moderate bots",
        ephemeral: true
    });
    return;
}
```

### Note Creation Pattern
```javascript
const dt = await global.notecol.findOne({serial: {$gt: -1}});
const note = {
    srv: guildId,
    userID: userId,
    username: username,
    noteAuthor: {...},
    type: "type",
    text: "content",
    serial: dt.serial + 1,
    time: Math.floor(Date.now() / 1000)
};
await global.notecol.insertOne(note);
```

---

## Notes

- All commands use ephemeral replies (except embeds sent to channels)
- Purge limited to messages < 14 days old (Discord limitation)
- Temp bans persist across bot restarts
- Serial numbers never reset (global counter)
- Context menus provide quick access to common actions
- Moderation log requires channel configuration
- Owner (Carp) cannot be banned via commands
- Timeout maximum is 28 days (Discord limitation)
- Note pagination shows 5 notes per page
- Purge uses database queries (14-day retention limit)
