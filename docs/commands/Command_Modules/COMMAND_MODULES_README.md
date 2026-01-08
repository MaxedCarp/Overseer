# Command Modules Documentation

This directory contains utility modules and helper commands used throughout the bot.

## Modules Overview

| File | Type | Purpose |
|------|------|---------|
| `dataset.js` | Utility Class | Secret key management |
| `keywordFilter.js` | Utility Class | AutoMod keyword/pattern filtering |
| `ping2.js` | Command | Simple ping test command |
| `purgeset.js` | Utility Class | Message purge operations |
| `forms.js` | Utility Module | Help command form generation |

---

## dataset.js

**Purpose:** Manage secret key configuration for automatic role assignment

### Class: dataset

#### addSecretKey(sid, keywords, role, agereq)
**Returns:** `Promise<Boolean>`
**Purpose:** Add a new secret key to server configuration

**Parameters:**
- `sid` (String): Server/Guild ID
- `keywords` (String): Trigger phrase
- `role` (String): Role ID to grant
- `agereq` (Number): Minimum account age requirement in seconds

**Process:**
1. Fetches server data from `srvcol`
2. Adds new secret key object to `secretkeys` array
3. Updates database
4. Returns true

**Secret Key Object:**
```javascript
{
    key: String,      // Trigger phrase
    roleID: String,   // Role to grant
    agereq: Number    // Age requirement in seconds
}
```

**Example:**
```javascript
await dataset.addSecretKey(
    "123456789",
    "secret password",
    "987654321",
    86400  // 1 day
);
```

---

#### delSecretKey(sid, index)
**Returns:** `Promise<Boolean>`
**Purpose:** Remove a secret key from server configuration

**Parameters:**
- `sid` (String): Server/Guild ID
- `index` (Number): Array index of secret key to remove

**Process:**
1. Fetches server data from `srvcol`
2. Removes secret key at specified index using `splice()`
3. Updates database
4. Returns true

**Example:**
```javascript
await dataset.delSecretKey("123456789", 0);  // Remove first secret key
```

---

## keywordFilter.js

**Purpose:** AutoMod content filtering using keywords and regex patterns

### Class: KeywordFilter

#### checkAndDelete(message)
**Returns:** `Promise<Object>`
**Purpose:** Check message against filter database and return match status

**Parameters:**
- `message` (Message): Discord message to check

**Return Object:**
```javascript
{
    deleted: Boolean,         // Whether message should be deleted
    matchedPattern: String,   // The pattern that matched (escaped)
    punishment: String        // Punishment string (e.g., "timeout:1h")
}
```

**Filter Database Structure:**
```javascript
{
    srv: String,              // Guild ID
    keyword: RegExp/String,   // Filter pattern
    caseInsensitive: Boolean, // Case sensitivity (default: true)
    punishment: String        // Optional punishment (e.g., "timeout:30m")
}
```

**Supported Pattern Formats:**

1. **RegExp Object:**
   ```javascript
   { keyword: /pattern/gi }
   ```

2. **MongoDB BSON Regex:**
   ```javascript
   {
       keyword: {
           $regularExpression: {
               pattern: "pattern",
               options: "gi"
           }
       }
   }
   ```

3. **Plain String:**
   ```javascript
   { keyword: "badword" }
   // Automatically case-insensitive unless specified
   ```

4. **Object with Pattern:**
   ```javascript
   {
       keyword: {
           pattern: "regex",
           options: "gi"
       }
   }
   ```

**Features:**
- Case-insensitive by default
- Regex pattern support
- MongoDB BSON regex handling
- Escapes asterisks in returned patterns
- Error handling for invalid patterns
- Optional punishment field

**Process:**
1. Validates message and content exist
2. Fetches all filters for the guild
3. Iterates through each filter
4. Normalizes keyword format to RegExp
5. Tests message content against pattern
6. Returns match details if found

**Error Handling:**
- Invalid regex patterns logged and skipped
- Missing global.filtercol handled gracefully
- Unsupported keyword formats logged

**Example Usage:**
```javascript
const result = await keywordFilter.checkAndDelete(message);
if (result.deleted) {
    await message.delete();
    console.log(`Matched pattern: ${result.matchedPattern}`);
    if (result.punishment) {
        // Apply punishment
    }
}
```

---

## ping2.js

**Purpose:** Simple ping/latency test command

### Command: /ping2

**Permission:** None (available to all users)
**Response:** "Pong!" (ephemeral)

**Use Case:**
- Test bot responsiveness
- Verify bot is online
- Quick interaction test

**Note:** Different from `/ping` command (in Misc folder) which shows detailed latency

---

## purgeset.js

**Purpose:** Advanced message deletion/purge operations with filtering

### Class: purgeset

All methods query `global.msgcol` (message database) and use Discord's `bulkDelete`.

---

#### getImages(channel, lim, sor)
**Returns:** `Promise<Array>`
**Purpose:** Get image messages from database

**Parameters:**
- `channel` (String): Channel ID
- `lim` (Number): Limit
- `sor` (Number): Sort order (1 or -1)

**Image Types:**
- image/png
- image/jpeg
- image/webp

**Query:**
```javascript
{
    messageChannelID: channel,
    $or: [
        {"messageAttachments.fileType": "image/png"},
        {"messageAttachments.fileType": "image/jpeg"},
        {"messageAttachments.fileType": "image/webp"}
    ]
}
```

---

#### getAttachments(channel, lim, sor)
**Returns:** `Promise<Array>`
**Purpose:** Get messages with any attachments (excluding CSS)

**Excludes:**
- text/css; charset=utf-8
- Empty attachment arrays

**Query:**
```javascript
{
    messageChannelID: channel,
    messageAttachments: {$not: {$eq: []}},
    "messageAttachments.fileType": {$not: {$eq: "text/css; charset=utf-8"}}
}
```

---

#### getVideos(channel, lim, sor)
**Returns:** `Promise<Array>`
**Purpose:** Get video messages

**Video Types:**
- video/mp4
- video/mkv

---

#### getGIFs(channel, lim, sor)
**Returns:** `Promise<Array>`
**Purpose:** Get GIF messages

**File Type:** image/gif

---

#### getAudio(channel, lim, sor)
**Returns:** `Promise<Array>`
**Purpose:** Get audio messages

**Audio Types:**
- audio/mpeg
- audio/mp3
- audio/m4a

---

#### any(interaction, lim)
**Returns:** `Promise<Boolean>`
**Purpose:** Delete any messages (no filtering)

**Process:**
1. Queries most recent `lim` messages from channel
2. Fetches actual Discord messages
3. Bulk deletes
4. Cleans up stale database records
5. Replies with count

**Database Cleanup:**
- Deletes database records for messages that no longer exist

---

#### user(interaction, user, lim, locale)
**Returns:** `Promise<Number>` or `undefined`
**Purpose:** Delete messages from specific user

**Parameters:**
- `interaction`: Discord interaction
- `user`: User object
- `lim`: Message limit
- `locale` (Boolean): If true, searches entire server; if false, current channel only

**Process:**
1. Builds query based on locale flag
2. Fetches messages from database
3. Groups messages by channel
4. Bulk deletes per channel
5. Returns message count if not locale mode

**Multi-Channel Support:**
- When `locale=true`, purges across all channels
- Groups messages by channel ID for efficient bulk delete

**Database Cleanup:**
- Removes records for deleted or inaccessible messages

---

#### attach(interaction, lim, type, user)
**Returns:** `Promise<void>`
**Purpose:** Delete messages with specific attachment types

**Parameters:**
- `interaction`: Discord interaction
- `lim`: Message limit
- `type`: Attachment type filter ("any", "image", "video", "audio", "other")
- `user`: Optional user ID filter

**Type Filters:**
- `"any"`: All attachments
- `"image"`: Image MIME types (regex: `/image/i`)
- `"video"`: Video MIME types (regex: `/video/i`)
- `"audio"`: Audio MIME types (regex: `/audio/i`)
- `"other"`: Application MIME types or null

**Query Building:**
```javascript
const query = {
    messageChannelID: channelId,
    "messageAuthor.userID": userId,  // Optional
    "messageAttachments.fileType": RegExp/Filter
}
```

**Process:**
1. Builds query with optional user filter
2. Applies type-specific attachment filter
3. Fetches matching messages
4. Bulk deletes
5. Replies with count

---

## forms.js

**Purpose:** Generate help command embeds with navigation

### Exports

#### GetForm(number, guildName, guildIcon)
**Returns:** `Promise<EmbedBuilder>`
**Purpose:** Get help page embed by number

**Pages:**
1. **Page 1 - Channels**: Channel management commands
2. **Page 2 - Roles**: Role management commands
3. **Page 3 - Moderation**: Moderation commands (ban, purge, etc.)
4. **Page 4 - Administration**: Server configuration commands
5. **Page 5 - Miscellaneous**: Utility commands

**Embed Structure:**
- Title: "Command List - Page X: Category"
- Description: Parameter format guide
- Fields: Command list with descriptions
- Footer: Guild name/icon
- Thumbnail: Overseer logo

---

#### GetComps(number)
**Returns:** `Promise<ActionRowBuilder>`
**Purpose:** Get navigation buttons for help pages

**Buttons:**
- Page 1: [2 →]
- Pages 2-4: [← prev] [next →]
- Page 5: [← 4]

**Button Format:**
- Custom ID: `help:{pageNumber}`
- Style: Primary (blue)
- Emoji: ◀️ (left), ▶️ (right)

---

## Common Patterns

### Promise-Based
All utility classes use Promise-based async operations:
```javascript
static method() {
    return new Promise((resolve) => {
        (async () => {
            // operations
            resolve(result);
        })();
    });
}
```

### Database Integration
All modules integrate with global MongoDB collections:
- `global.srvcol`: Server configuration
- `global.msgcol`: Message storage
- `global.filtercol`: Keyword filters
- `global.secretkeyscol`: Secret keys (used by messageevents.js)

### Error Handling
- Database errors logged to console
- Failed message fetches trigger database cleanup
- Invalid patterns/configs logged and skipped

---

## Integration Notes

### Secret Keys
- Used by `messageevents.js` MessageCreate
- Text search with MongoDB scoring
- Automatic role assignment on match

### Keyword Filter
- Used by `messageevents.js` MessageCreate
- Deletes matching messages
- Creates AutoMod notes
- Applies optional punishments

### Purge Operations
- Used by `/purge` command (Moderation folder)
- Efficient bulk deletion
- Database cleanup
- Multi-channel support

### Help Forms
- Used by `/help` command (Misc folder)
- Used by button interactions in app.js
- Dynamic page navigation
- Consistent formatting

---

## Database Schema

### Secret Keys (in srvcol)
```javascript
{
    secretkeys: [{
        key: String,
        roleID: String,
        agereq: Number
    }]
}
```

### Keyword Filters (filtercol)
```javascript
{
    srv: String,
    keyword: RegExp/String/Object,
    caseInsensitive: Boolean,
    punishment: String
}
```

---

## Notes

- All purge operations use Discord's `bulkDelete` (limited to messages < 14 days old)
- Database cleanup happens automatically during purge operations
- Filter patterns support multiple regex formats for flexibility
- Secret keys use text search for fuzzy matching
- Help navigation uses button interactions
- Attachment filtering supports regex for flexible type matching
