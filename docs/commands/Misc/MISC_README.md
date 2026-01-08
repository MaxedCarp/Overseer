# Miscellaneous Commands Documentation

This directory contains utility and informational commands.

## Commands Overview

| Command | Permission | Description |
|---------|------------|-------------|
| `/help` | None | Interactive paginated help menu |
| `/ping` | None | Simple latency test |
| `/serverinfo` | None | Display server statistics |
| `/count` | Manage Channels | Count media in database |
| `/createembed` | Manage Messages | Create custom embeds |
| `/fishmode` | Manage Server | Toggle fish mode Easter eggs |
| `/seticon` | Administrator | Set server icon from URL |
| `/timeconversion` | None | Convert time strings to units |
| `/updateval` | Carp-only | Update server icons in database |

---

## /help
**File:** `help.js`
**Permission:** None (Public)

**Purpose:** Display interactive paginated help documentation

**Behavior:**
1. Shows Page 1 (Channels commands)
2. Provides navigation buttons
3. Displays command syntax and descriptions

**Pages:**
1. **Channels** - Channel management commands
2. **Roles** - Role management commands
3. **Moderation** - Moderation tools
4. **Administration** - Server configuration
5. **Miscellaneous** - Utility commands

**Navigation:**
- Uses button interactions (`help:{pageNumber}`)
- Forward/backward buttons
- Ephemeral (only visible to command user)

**Integration:**
- Uses `forms.js` module for content
- Handled by button interactions in `app.js`

---

## /ping
**File:** `ping.js`
**Permission:** None (Public)

**Purpose:** Simple responsiveness test

**Response:** `"Pong!"`

**Use Cases:**
- Check if bot is online
- Test basic functionality
- Quick response time check

**Note:** Different from detailed latency checks (just confirms bot responds)

---

## /serverinfo
**File:** `serverinfo.js`
**Permission:** None (Public)

**Purpose:** Display comprehensive server information

**Displayed Information:**
- **Owner:** Server owner mention
- **Server ID:** Guild ID
- **Server Icon:** Icon URL
- **Member Count:** Non-bot members
- **Bot Count:** Bot accounts
- **Total:** Total member count
- **Emojis:** Custom emoji count
- **Stickers:** Custom sticker count
- **Soundboards:** Soundboard sounds count

**Embed:**
- Title: Server name
- Description: Server description
- Thumbnail: Server icon
- Color: `0xfa8b2a` (Orange)
- Footer: Server name and icon

**Example Output:**
```
Server Name: My Awesome Server
Description: A great place to hang out!

Owner: @ServerOwner
Server ID: 1234567890
Member Count: 150 | Bot Count: 5 | Total: 155
Emojis: 50 | Stickers: 10 | Soundboards: 3
```

---

## /count <subcommand>
**File:** `count.js`
**Permission:** Manage Channels

**Purpose:** Count media types in the channel's message database

**Subcommands:**
1. `/count attachments` - All attachments
2. `/count images` - Images only (png, jpeg, webp)
3. `/count gifs` - GIFs only
4. `/count videos` - Videos (mp4, mkv)
5. `/count audio` - Audio files (mpeg, mp3, m4a)

**Process:**
1. Queries `msgcol` database
2. Filters by channel ID
3. Filters by file type
4. Returns count (up to 1,000,000 limit)

**Uses `purgeset.js` Utilities:**
- `getImages()` - Image count
- `getAttachments()` - Attachment count
- `getGIFs()` - GIF count
- `getVideos()` - Video count
- `getAudio()` - Audio count

**Example:**
```
/count images
→ "There are 543 images in this channel's database!"
```

**Note:** Only counts messages in database (14-day retention)

---

## /createembed <options>
**File:** `createembed.js`
**Permission:** Manage Messages

**Purpose:** Create and send custom embeds in the current channel

**Parameters:**
- `title` (String, Required): Embed title
- `titleurl` (String): Make title a hyperlink
- `description` (String): Embed description
- `thumbnail` (String): Thumbnail image URL
- `author` (String): Author name
- `authorimg` (String): Author icon URL
- `image` (String): Large image URL
- `fields` (String): Field names (comma separated: `//,`)
- `fielddesc` (String): Field descriptions (comma separated: `//,`)
- `fieldinline` (String): Inline flags (comma separated: `t` or `f`)
- `color` (Integer): Embed color (decimal)

**Field Formatting:**
- **Separator:** `//,` (not regular comma)
- **Newlines:** `\n` converted to actual newlines
- **Inline:** `t` = true, `f` = false

**Example:**
```
/createembed
  title: Announcement
  description: Important update\nPlease read carefully
  fields: Field 1//, Field 2
  fielddesc: Description 1//, Description 2
  fieldinline: t, f
  color: 16753700
```

**Behavior:**
1. Validates bot has SendMessages permission
2. Builds embed from parameters
3. Sends to current channel
4. Sets footer to guild name/icon
5. Confirms to command user (ephemeral)

**Color Conversion:**
- Hex `#ff9900` → Decimal `16753700`
- Use online converter or calculator

**Limitations:**
- Discord embed character limits apply
- Images must be valid URLs
- Fields limited by Discord (max 25 fields)

---

## /fishmode
**File:** `fishmode.js`
**Permission:** Manage Server

**Purpose:** Toggle fish mode Easter egg features

**Behavior:**
1. Fetches current fish mode status
2. Toggles boolean value
3. Updates database
4. Confirms new status

**Database Update:**
```javascript
await global.srvcol.updateOne(
    {srv: guildId},
    {$set: {fishmode: !currentValue}}
);
```

**Fish Mode Features (when enabled):**
1. **Fish Name Reactions** - Reacts 🐟 to fish names
2. **"Ghoti" Blocking** - Deletes messages/nicknames with "ghoti"
3. **Special Reactions** - Server-specific Easter eggs
4. **Auto-Reply** - "🐟FISH!" to "you know what that means"

**Implemented in:** `messageevents.js` and `guildevents.js`

**Example:**
```
/fishmode
→ "Fish mode is now enabled"

/fishmode
→ "Fish mode is now disabled"
```

---

## /seticon <url>
**File:** `test.js`
**Permission:** Administrator

**Purpose:** Change server icon from URL

**Parameters:**
- `url` (String): Image URL for new icon

**Behavior:**
1. Validates URL is accessible
2. Sets server icon
3. Confirms action

**Requirements:**
- Valid image URL
- Supported formats (png, jpg, gif)
- Must be under Discord's size limit
- Bot must have Manage Server permission

**Example:**
```
/seticon url: https://example.com/icon.png
→ "Done!"
```

**Error Handling:**
- Invalid URL: Discord API error
- Permission issues: Bot permission error
- Unsupported format: Discord API error

---

## /timeconversion <unit> <time>
**File:** `timeconversion.js`
**Permission:** None (Public)

**Purpose:** Convert time strings to specified units

**Parameters:**
- `unit` (Choice, Required): Target time unit
- `time` (String, Required): Time string to convert

**Supported Units:**
- Years
- Months
- Weeks
- Days
- Hours
- Minutes
- Seconds
- Milliseconds

**Uses:** `essentials.parsetime()` function

**Example:**
```
/timeconversion unit: hours time: 2 days 30 minutes
→ "2 days 30 minutes = 48 hour(s)!"

/timeconversion unit: seconds time: 1h 30m
→ "1h 30m = 5400 second(s)!"
```

**Input Format:**
- Flexible: "1h30m", "1 hour 30 minutes", "90 minutes"
- Multiple units: "2d 5h 30m 15s"
- Decimals: "1.5h", "2.25 days"

**Note:** Result is floored (no decimals in output)

---

## /updateval
**File:** `updateval.js`
**Permission:** Carp-only (Hardcoded)

**Purpose:** Update all server icons in database (maintenance command)

**Access Control:**
```javascript
if (interaction.user.id !== "275305152842301440") {
    return;  // Silent fail
}
```

**Behavior:**
1. Iterates through all guilds bot is in
2. Updates icon URL in database for each server
3. No reply to user

**Database Update:**
```javascript
await global.srvcol.updateOne(
    {srv: guild.id},
    {$set: {icon: guild.iconURL()}}
);
```

**Use Cases:**
- Database maintenance
- Icon URL format changes
- Bulk updates after migration

**Note:**
- No permission requirement (hardcoded check)
- No user feedback
- Runs asynchronously

---

## Common Patterns

### Permission Validation
```javascript
const hasperms = (interaction.guild.members.me).permissionsIn(channel).has(Permission);
if (!hasperms) {
    await interaction.reply({content: "Error message", ephemeral: true});
    return;
}
```

### Database Toggle Pattern
```javascript
const current = (await global.srvcol.findOne({srv: guildId})).field;
await global.srvcol.updateOne(
    {srv: guildId},
    {$set: {field: !current}}
);
await interaction.reply({content: `Field is now ${!current ? "enabled" : "disabled"}`});
```

### Ephemeral Responses
All commands use ephemeral replies:
```javascript
await interaction.reply({content: "Message", ephemeral: true});
```

---

## Integration Notes

### Help System
- Page content defined in `forms.js`
- Navigation handled in `app.js` button interactions
- Automatically includes all commands

### Fish Mode
- Global toggle affects multiple event handlers
- Database field: `fishmode` (boolean)
- Easter egg features for fun/community engagement

### Time Conversion
- Uses locale-based parsing (`parselocale.js`)
- Supports multiple time formats
- Accurate for calendar calculations (365.25 days/year)

### Embed Creator
- User-friendly custom embed creation
- No code knowledge required
- Flexible field system

---

## Notes

- Most commands are public (no special permissions)
- All replies ephemeral (except embeds sent to channel)
- Time conversion uses milliseconds internally
- Fish mode is server-specific toggle
- Server info updates in real-time (not cached)
- Count commands limited to database retention (14 days)
- Owner-only commands have hardcoded user ID checks
- Color values in createembed must be decimal not hex
