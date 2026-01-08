# Channels Commands Documentation

This directory contains command files for channel management operations.

## Commands Overview

| Command | Permission | Description |
|---------|------------|-------------|
| `/focus` | Administrator | Monitor all actions of a specific user |
| `/unfocus` | Administrator | Stop monitoring a user |
| `/hostmigration` | Move Members | Move all users from current VC to another VC |
| `/onetimeaccess` | Manage Server | Grant temporary voice channel access |
| `/permaccess` | Manage Server | Grant permanent voice channel access |
| `/setlogchannel` | Manage Channels | Configure log channels |
| `/unsetlogchannel` | Manage Channels | Disable log channels |

## Detailed Command Documentation

### /focus <user> <category>
**File:** `focus.js`
**Permission:** Administrator

**Purpose:** Create a dedicated channel to monitor all of a user's actions

**Parameters:**
- `user` (User, Required): User to monitor
- `category` (Channel Category, Required): Parent category for the focus channel

**Behavior:**
1. Checks if user is already being focused
2. Creates new text channel: `focus-{username}`
3. Sets channel topic with user ID
4. Adds record to `focuscol` database
5. Returns focus channel link

**Focus Channel Logs:**
- All messages sent by the user
- Message edits and deletions
- Voice channel joins/leaves/moves
- Voice state changes (mute, deafen)
- Username/nickname/avatar changes
- Online/offline/away status changes
- Server join/leave events
- Reaction additions/removals

**Database Record:**
```javascript
{
    srv: String,       // Guild ID
    userid: String,    // User being monitored
    ch: String         // Focus channel ID
}
```

**Error Handling:**
- Already focused: Returns existing focus channel link

**Example:**
```
/focus user:@JohnDoe category:#monitoring-category
→ Creates "#focus-johndoe" in the monitoring category
```

---

### /unfocus <user>
**File:** `unfocus.js`
**Permission:** Administrator

**Purpose:** Stop monitoring a user and cleanup focus records

**Parameters:**
- `user` (User, Required): User to stop monitoring

**Behavior:**
1. Checks if user is currently being focused
2. Deletes record from `focuscol` database
3. Leaves channel intact as archive

**Note:**
- Channel is NOT automatically deleted
- Acts as an archive of monitored activity
- Admin must manually delete channel if needed

**Error Handling:**
- Not focused: Informs user that target is not being monitored

---

### /hostmigration <channel>
**File:** `hostmigration.js`
**Permission:** Move Members

**Purpose:** Move all members from your current voice channel to another voice channel

**Parameters:**
- `channel` (Voice Channel, Required): Destination voice channel

**Behavior:**
1. Validates bot has access to target channel
2. Validates command user is in a voice channel
3. Moves all members from current VC to target VC

**Validation Checks:**
- Bot must have ViewChannel permission for target
- User must be in a voice channel
- Target must be a voice channel type

**Use Cases:**
- Moving group to different voice channel
- Migrating conversation to new location
- Host transferring call participants

**Debug:**
- Logs permission overwrites to console (line 29)

---

### /onetimeaccess <user> (<channel>)
**File:** `onetimeaccess.js`
**Permission:** Manage Server

**Purpose:** Grant temporary voice channel access that auto-removes when channel empties

**Parameters:**
- `user` (User, Required): User to grant access to
- `channel` (Voice Channel, Optional): Target channel (defaults to current VC)

**Behavior:**
1. Determines target channel (specified or current)
2. Validates user is in VC or channel was specified
3. Checks special channel restrictions
4. Verifies bot has ViewChannel permission
5. Creates permission overwrite: ViewChannel, Connect, Speak
6. Adds database record (WITHOUT `perm` flag)
7. Returns confirmation

**Special Restrictions:**
- Channel `1422378190122385529`: Only user `275305152842301440` (Carp) can grant access

**Auto-Removal Triggers:**
1. **Channel Empty**: Periodic check every 2 minutes (app.js)
2. **User Leaves**: When granted user leaves channel
3. **Channel Move**: When granted user moves to different channel

**Cleanup Logic:**
- Only removes if `!overwrite.perm` (no perm flag)
- Deletes permission overwrite
- Deletes database record

**Database Record:**
```javascript
{
    srv: String,       // Guild ID
    channelID: String, // Voice channel ID
    userID: String     // User granted access
    // NO perm field = temporary
}
```

---

### /permaccess <user> (<channel>)
**File:** `permaccess.js`
**Permission:** Manage Server

**Purpose:** Grant permanent voice channel access that never auto-removes

**Parameters:**
- `user` (User, Required): User to grant access to
- `channel` (Voice Channel, Optional): Target channel (defaults to current VC)

**Behavior:**
Identical to `/onetimeaccess` except:
- Database record includes `perm: true`
- **Never** automatically removed by cleanup systems
- User keeps access permanently until manually revoked

**Database Record:**
```javascript
{
    srv: String,       // Guild ID
    channelID: String, // Voice channel ID
    userID: String,    // User granted access
    perm: true         // Permanent flag
}
```

**Cleanup Protection:**
- `!overwrite.perm` check in cleanup code skips permanent access
- Survives channel empty events
- Persists across bot restarts

**Use Cases:**
- Trusted users with ongoing access needs
- Moderators needing access to restricted channels
- Permanent collaborators

---

### /setlogchannel <type>
**File:** `setlogchannel.js`
**Permission:** Manage Channels

**Purpose:** Configure where specific log types are sent

**Parameters:**
- `type` (String Choice, Required): Log type to configure

**Log Types:**
| Choice Name | Database Key | Logs |
|-------------|--------------|------|
| Edited Messages | `update` | Message edits |
| Deleted Messages | `delete` | Message deletions |
| Overseer Commands | `command` | Command usage |
| User Join Messages | `join` | Join messages |
| User Leave Messages | `leave` | Leave messages |
| User Join Details | `joinstat` | Join statistics |
| User Leave Details | `leavestat` | Leave statistics |
| User Bans | `bans` | Ban messages |
| User Ban Details | `banstat` | Ban statistics |
| User Updates | `userupdate` | Role/nickname changes |
| Moderation Log | `moderationlog` | AutoMod actions |

**Behavior:**
1. Sets chosen log type to current channel
2. Updates server configuration in database
3. Confirms change to user

**Database Update:**
```javascript
{ $set: { [type]: channelID } }
```

**Example:**
```
In #mod-log channel:
/setlogchannel type:Deleted Messages
→ All deleted messages now logged to #mod-log
```

---

### /unsetlogchannel <type>
**File:** `unsetlogchannel.js`
**Permission:** Manage Channels

**Purpose:** Disable logging for a specific log type

**Parameters:**
- `type` (String Choice, Required): Log type to disable

**Log Types:** Same as `/setlogchannel`

**Behavior:**
1. Sets chosen log type to "none"
2. Updates server configuration in database
3. Confirms change to user

**Database Update:**
```javascript
{ $set: { [type]: "none" } }
```

**Effect:**
- Bot stops sending that log type
- No errors shown to users
- Can be re-enabled with `/setlogchannel`

---

## Common Patterns

### Permission Checking
Most commands validate bot permissions before execution:
```javascript
if (!((guild.members.me).permissionsIn(channel).has(Permission) ||
      (guild.members.me).permissions.has(PermissionFlagsBits.Administrator)))
{
    // Error message
    return;
}
```

### Database Integration
Commands use global MongoDB collections:
- `global.focuscol`: Focus monitoring
- `global.channelscol`: Channel access records
- `global.srvcol`: Server configuration

### Error Messages
All commands use ephemeral replies for errors:
```javascript
await interaction.reply({
    content: "Error message",
    ephemeral: true
});
```

---

## Notes

- All channels commands are ephemeral (only visible to command user)
- Permission checks prevent unauthorized access
- Database integration ensures persistence across restarts
- Focus system integrates with all event handlers
- Access system supports both temporary and permanent grants
- Log channel system is highly configurable per server
