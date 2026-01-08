# messageevents.js - Message Event Handlers

## Overview
**File:** `Event_Modules/messageevents.js`
**Purpose:** Handles all message-related events including create, update, delete, bulk delete, and reactions

## Dependencies
```javascript
const { PermissionFlagsBits, AttachmentBuilder } = require('discord.js');
const EmbedCreator = require('./embedcreator.js');
const essentials = require('./essentials.js');
const keywordFilter = require("../commands/Command_Modules/keywordFilter");
```

## Class: messageEvents

All methods are static and return Promises.

---

## MessageCreate(message)
**Purpose:** Handles new messages - logging, filtering, fish mode, secret keys
**Parameters:** `message` - Message object

### Workflow Overview
1. **Bot Filter**: Ignores bot messages
2. **DM Logging**: Logs DM messages to console
3. **Guild Check**: Returns if not in a guild
4. **Auto-Delete List**: Deletes messages from blacklisted users
5. **Message Logging**: Saves message to database with 14-day expiry
6. **Focus Tracking**: Sends message copy to focus channel
7. **Keyword Filter**: Checks and deletes filtered content
8. **Fish Mode**: Reacts with 🐟 emoji, blocks "ghoti"
9. **Bot Mention**: Responds when mentioned
10. **Secret Keys**: Grants roles based on message content

### Auto-Delete List
**Purpose:** Automatically delete messages from specific users
**Database Field:** `obj.autodelist` (array of user IDs)
**Behavior:**
- Immediately deletes message
- Logs deletion to delete channel
- Shows content and attachments

### Message Database Storage
**Collection:** `msgcol`
**Expiry:** 14 days (1,209,600,000ms)
**Document Structure:**
```javascript
{
    messageID: String,
    messageContent: String,
    messageAttachments: [{
        fileName: String,
        attachurl: String,
        fileType: String
    }],
    messageAuthor: {
        userID: String,
        userName: String,
        globalName: String,
        avatar: String,
        avatarURL: String
    },
    messageChannelID: String,
    messageServerID: String,
    focus: String,              // Focus message ID (if user monitored)
    expire: Date               // Auto-delete after 14 days
}
```

### Focus Integration
**If User is Monitored:**
- Sends message copy to focus channel
- Includes stickers (as URLs)
- Includes attachments (as files)
- Stores focus message ID in database
- Links to original message

**Format:**
```
**USER:** {message content}
{sticker URLs if any}

-# [[Click to View Message](link)] **Message ID:** {id}, **Time:** {timestamp}
```

### Keyword Filter & AutoMod
**Process:**
1. Checks message against filter patterns
2. If matched AND user not admin/moderator:
   - Deletes message
   - Sends DM to user with matched pattern
   - Creates AutoMod note in database
   - Logs to moderation log channel
   - **Optional Timeout**: If punishment starts with `timeout:`

**Punishment Format:**
```
"timeout:1h30m"  → Times out user for 1.5 hours
```

**Maximum Timeout:**
- Discord limit: 28 days
- Automatically caps at 28 days if longer specified

**AutoMod Note Structure:**
```javascript
{
    srv: String,
    userID: String,
    username: String,
    noteAuthor: {...},  // Same as message author
    type: "automod",
    text: String,       // Includes timeout info if applicable
    serial: Number,     // Incrementing serial
    time: Number        // Unix timestamp
}
```

**DM Message:**
```
Your message in channel: {channel} has been flagged for the following keyword / pattern: {pattern}.

Your message:

{content}.
```

**Moderation Log Embed:**
- Title: "User Message Autodeleted: <#channelID>"
- Description: User, keyword/pattern, timeout (if any), message content
- Color: `0xff9900` (Orange)

### Fish Mode
**Enabled Check:** `obj.fishmode === true`

**Features:**

#### 1. Limbo/Limbible Reaction (Specific Server)
**Server ID:** `1190516697174659182`
**Trigger:** Message contains "limbo", "limbible", or mentions user `528963161622052915`
**Action:** Reacts with 🎩 emoji

#### 2. Fish Name Detection
**Source:** `global.fishcol` collection
**Process:**
- Splits message into words
- Checks each word against fish database
- Also matches 🐟 emoji or "sci-fi freak"
- Reacts with 🐟 if found

**Fish List:** See `essentials.fishList()` - includes salmon, tuna, carp, etc.

#### 3. "You know what that means"
**Trigger:** Message contains "you know what that means"
**Action:** Replies with "🐟FISH!"

#### 4. "Ghoti" Blocking
**Detection:**
```javascript
message.content.toLowerCase()
    .replaceAll(" ", "")
    .replaceAll("*", "o")
    .replaceAll("0", "o")
    .replaceAll("1", "i")
    .replaceAll("º", "o")
    .includes("ghoti")
```

**Action:**
1. Replies "Sorry, not a real word..."
2. Waits 5 seconds
3. Deletes both reply and original message

### Bot Mention Response
**Trigger:** Message contains `<@1205253895258120304>`
**Response:** "Yes, how may I assist?"

### Secret Keys Role Assignment
**Purpose:** Automatically grant roles when users type secret phrases

**Database Collection:** `secretkeyscol`
**Search Method:** MongoDB text search with scoring

**Process:**
1. Performs text search on message content
2. Sorts by relevance score (best match first)
3. Checks if exact key appears in message
4. Verifies role exists and is editable
5. **Age Requirement**: User must meet minimum age (join time + age requirement)
6. Grants role if all conditions met

**Database Query:**
```javascript
{
    srv: guild.id,
    $text: { $search: messageContent }
}
```

**Conditions:**
- User doesn't already have the role
- Role is editable by bot
- User has been in server long enough: `joinTimestamp + ageReq < now`

---

## MessageDelete(message)
**Purpose:** Log deleted messages
**Parameters:** `message` - Deleted Message object

### Workflow
1. **Guild Check**: Returns if not in a guild
2. **Bot Filter**: Ignores bot messages
3. **Auto-Delete List**: Special handling for monitored users
4. **Database Lookup**: Retrieves original message data
5. **Delete Log**: Sends embed to delete log channel
6. **Focus Notification**: Notifies if user is monitored
7. **Database Cleanup**: Removes message from database

### Auto-Delete List Handling
**If User on Auto-Delete List:**
- Creates embed from live message object (not database)
- Shows content or image
- Sends to delete log channel

### Standard Delete Handling
**If Message in Database:**
- Retrieves stored message data
- Creates embed with content/image
- Sends to delete log channel
- **Focus Integration**: Replies to original focus message if exists

### Embed Types

#### Text Message Delete
- Title: "Message Deleted in: <#channelID>"
- Description: Message content
- Color: `0xFA042A` (Red)
- Author: User info with avatar

#### Image Delete
- Title: "Image Deleted in: <#channelID>"
- Description: Message content (if any)
- Image: Deleted image URL
- Color: `0xFA042A` (Red)

**Image Detection:**
- Content type must be: `image/png`, `image/jpeg`, or `image/webp`

### Focus Notification Format
```
**MESSAGE FROM USER DELETED!**
-# [[Click to View Ref](link)] **Message ID:** {id}, **Time:** {timestamp}
```

**Focus Reply Behavior:**
- If original focus message ID exists, replies to it
- Otherwise sends new message to focus channel

---

## MessageBulkDelete(messages)
**Purpose:** Handle bulk message deletions (purge commands)
**Parameters:** `messages` - Collection of deleted messages

### Workflow
1. **Filter Bots**: Removes bot messages from collection
2. **Sampling**: Gets guild info from first valid message
3. **Database Cleanup**: Deletes all message records
4. **Log Embed**: Sends bulk delete notification

### Database Cleanup
**Query:**
```javascript
deleteMany({ messageID: { $in: messageIds } })
```

### Bulk Delete Embed
- Title: "Message**s BULK** Deleted in: <#channelID>" (or "Message Deleted" if only 1)
- Description: "{count} Message{s} Deleted"
- Color: `0xFA042A` (Red)
- Author: "Overseer" bot

### Helper Method: #getSampleMessage(msgs)
**Purpose:** Extract guild information from message collection
**Returns:**
```javascript
{
    guild: Guild object,
    guildid: String,
    guild2: Database server object,
    guildicon: String (URL),
    guildname: String,
    chan: String (channel ID)
}
```

**Process:**
- Iterates messages in reverse
- Finds first message in database
- Extracts guild information
- Returns early after finding first valid message

---

## MessageUpdate(omessage, nmessage)
**Purpose:** Track message edits
**Parameters:**
- `omessage` - Original message
- `nmessage` - Edited message

### Workflow
1. **Guild Check**: Returns if not in a guild
2. **Bot Filter**: Ignores bot messages
3. **Database Check**: Returns if message not in database
4. **Content Check**: Returns if content unchanged
5. **Fish Mode Check**: Blocks "ghoti" in edited messages
6. **Update Log**: Sends edit embed
7. **Database Update**: Updates stored message content
8. **Focus Notification**: Notifies if user is monitored

### Edit Embed
**Fields:**
- "Old Message:": Original content
- "New Message:": Edited content
- Title: "**Message Edited:** [Click to View](link)"
- Color: `0xf7ef02` (Yellow)

### Fish Mode "Ghoti" Check
**Same as MessageCreate:**
- Detects "ghoti" in edited message
- Replies "Sorry, not a real word..."
- Deletes both messages after 5 seconds

### Database Update
**Updates:**
- `messageContent`: New content
- `messageAttachments`: New attachments array

### Focus Notification Format
```
**USER EDITED A MESSAGE!**
-# [[Click to View Ref](link)] **Message ID:** {id}, **Time:** {timestamp}
```

**Reply Behavior:**
- Tries to reply to original focus message
- Falls back to new message if original not found

---

## ReactionAdd(reaction, user)
**Purpose:** Track reaction additions (focus system only)
**Parameters:**
- `reaction` - MessageReaction object
- `user` - User who reacted

### Workflow
1. **Focus Check**: Only processes if user is being monitored
2. **Notification**: Sends reaction details to focus channel

### Notification Format
```
**USER ADDED A REACTION: {emoji}!**
-# [[Click to View Message](link)] **Message ID:** {id}, **Time:** {timestamp}
```

**Emoji Handling:**
- **Standard Emoji**: Shows emoji directly in message
- **Custom Emoji**: Attaches emoji image URL as file

**Message Structure:**
```javascript
{
    content: String,
    allowedMentions: { parse: [] },
    files: [emoji.url]  // Only if custom emoji
}
```

---

## ReactionRemove(reaction, user)
**Purpose:** Track reaction removals (focus system only)
**Parameters:**
- `reaction` - MessageReaction object
- `user` - User who removed reaction

### Workflow
1. **Focus Check**: Only processes if user is being monitored
2. **Notification**: Sends reaction removal details to focus channel

### Notification Format
```
**[{timestamp}] USER REMOVED A REACTION: {emoji}!**
-# [[Click to View Message](link)] **Message ID:** {id}, **Time:** {timestamp}
```

**Same emoji handling as ReactionAdd**

---

## Key Features

### Message Persistence
- All messages stored for 14 days
- Enables accurate edit/delete logging
- Includes attachments metadata
- Auto-expires via database TTL

### Auto-Delete List
- Instant deletion for flagged users
- Separate logging for these deletions
- Based on user ID matching

### Focus System Integration
- Mirrors messages to focus channel
- Links original and focus messages
- Replies to focus messages for updates
- Tracks edits, deletes, reactions

### Keyword Filtering
- Pattern-based content moderation
- DM notifications to users
- AutoMod note creation
- Optional timeout punishments
- Moderation log integration

### Fish Mode
- Multiple detection methods
- Fun reactions and replies
- "Ghoti" word blocking
- Server-specific Easter eggs

### Secret Key Roles
- Text search based matching
- Age requirement checking
- Automatic role granting
- Prevents duplicate grants

---

## Database Collections Used

### msgcol (Messages)
- Stores all non-bot messages
- 14-day automatic expiration
- Used for edit/delete logging

### srvcol (Server Config)
- Channel configuration
- Fish mode toggle
- Auto-delete list
- Message embed settings

### focuscol (Focus Monitoring)
- User monitoring settings
- Focus channel mapping

### fishcol (Fish Names)
- Fish name list
- Used for fish mode reactions

### notecol (Moderation Notes)
- AutoMod violations
- Serial number tracking
- Timestamp logging

### secretkeyscol (Secret Keys)
- Role assignment phrases
- Age requirements
- Text search indexed

---

## Permission Checks

All channel sends verify permissions:
```javascript
if (
    ((guild.members.me).permissionsIn(channelId).has(PermissionFlagsBits.SendMessages) &&
     (guild.members.me).permissionsIn(channelId).has(PermissionFlagsBits.ViewChannel)) ||
    (guild.members.me).permissionsIn(channelId).has(PermissionFlagsBits.Administrator)
) {
    // Send message
}
```

**Additional Permission Checks:**
- `AddReactions`: For fish mode emoji reactions
- `ManageRoles`: For secret key role assignment

---

## Notes

- All events filter out bot messages
- DM messages logged to console only
- Message expiry prevents database bloat
- Focus system provides comprehensive user monitoring
- Fish mode includes multiple fun features
- AutoMod supports configurable punishments
- Secret keys use MongoDB text search for fuzzy matching
- Bulk deletes handled efficiently with batch operations
- Image detection based on MIME type
- Custom emoji handling for reactions
- All timestamps in UTC format
