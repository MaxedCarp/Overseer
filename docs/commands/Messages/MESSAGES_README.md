# Messages Commands Documentation

This directory contains commands for configuring join/leave messages and special messaging features.

## Commands Overview

| Command | Permission | Description |
|---------|------------|-------------|
| `/setjoinmsg` | Manage Channels | Configure welcome message when users join |
| `/setleavemsg` | Manage Channels | Configure goodbye message when users leave |
| `/supersecretmsgcommand` | Carp-only | Send DM to any user (owner only) |

---

## /setjoinmsg <message>
**File:** `setjoinmessage.js`
**Permission:** Manage Channels

**Purpose:** Set the message sent when a new user joins the server

**Parameters:**
- `message` (String, Required): Welcome message template

**Message Placeholders:**
- `{@user}` - Mentions the user
- `{servername}` - Server name
- `{username}` - User's username
- `{user}` - User's global/display name

**Behavior:**
1. Updates `joinmsg` field in server configuration
2. Message displayed when user joins (if join channel configured)
3. Replaces placeholders with actual values

**Database Update:**
```javascript
await global.srvcol.updateOne(
    {srv: guildId},
    {$set: {joinmsg: message}}
);
```

**Example:**
```
/setjoinmsg message: Welcome {@user} to {servername}!
→ Saves: "Welcome {@user} to {servername}!"
→ Displays: "Welcome @JohnDoe to My Server!" (when user joins)
```

**Default Value:**
```
"Welcome {@user}!!!"
```

**Integration:**
- Used by `guildevents.js` MemberJoin event
- Requires join channel configured via `/setlogchannel`
- Can be embed or plain text based on `ismsgembed` setting

---

## /setleavemsg <message>
**File:** `setleavemessage.js`
**Permission:** Manage Channels

**Purpose:** Set the message sent when a user leaves the server

**Parameters:**
- `message` (String, Required): Goodbye message template

**Message Placeholders:**
Same as `/setjoinmsg`:
- `{@user}` - Mentions the user
- `{servername}` - Server name
- `{username}` - User's username
- `{user}` - User's global/display name

**Behavior:**
1. Updates `leavemsg` field in server configuration
2. Message displayed when user leaves (if leave channel configured)
3. Replaces placeholders with actual values

**Database Update:**
```javascript
await global.srvcol.updateOne(
    {srv: guildId},
    {$set: {leavemsg: message}}
);
```

**Example:**
```
/setleavemsg message: Goodbye!\n{@user} left the server. :(
→ Saves: "Goodbye!\n{@user} left the server. :("
→ Displays: "Goodbye!\n@JohnDoe left the server. :(" (when user leaves)
```

**Default Value:**
```
"Goodbye!\n{@user} left the server. :("
```

**Integration:**
- Used by `guildevents.js` MemberLeave event
- Requires leave channel configured via `/setlogchannel`
- Can be embed or plain text based on `ismsgembed` setting

**Note:** `\n` in command creates newline in message

---

## /supersecretmsgcommand <message> <user>
**File:** `supersecretmsgcommand.js`
**Permission:** Hardcoded (Carp only)

**Purpose:** Send DM to any user as the bot (owner-only feature)

**Parameters:**
- `message` (String, Required): Message to send
- `user` (User, Required): User to send DM to

**Access Control:**
```javascript
if (interaction.user.id !== "275305152842301440") {
    // Deny access
}
```

**Only Allowed User:** `275305152842301440` (Carp)

**Behavior:**
1. Checks if command user is Carp
2. Creates DM channel with target user
3. Sends message as bot
4. Confirms to command user

**Error Response:**
```
"I apologize, but you do not have any rights (to use this command)!"
```

**Success Response:**
```
Message successfully set to "{user.globalName}"!
```

**Use Cases:**
- Owner direct communication
- Bot announcements to specific users
- Emergency notifications
- Testing DM functionality

**Security:**
- Hardcoded user ID check
- Cannot be bypassed
- Ephemeral responses
- No logging of sent messages

**Example:**
```
/supersecretmsgcommand message: Important announcement user: @User
→ Bot DMs user: "Important announcement"
→ Command user sees: "Message successfully sent to User!"
```

---

## Message System Integration

### Join/Leave Message Flow

**Join Message:**
1. User joins server
2. `guildevents.js` MemberJoin triggered
3. Fetches `joinmsg` from database
4. Replaces placeholders
5. Sends to configured join channel

**Leave Message:**
1. User leaves server
2. `guildevents.js` MemberLeave triggered
3. Fetches `leavemsg` from database
4. Replaces placeholders
5. Sends to configured leave channel

### Configuration Requirements

**For Join Messages:**
```javascript
{
    join: "channel-id",        // Join channel
    joinmsg: "message",        // Message template
    ismsgembed: false          // Optional: embed format
}
```

**For Leave Messages:**
```javascript
{
    leave: "channel-id",       // Leave channel
    leavemsg: "message",       // Message template
    ismsgembed: false          // Optional: embed format
}
```

### Placeholder Processing

Handled by event handlers (not command files):

```javascript
// In guildevents.js
message = message.replace("{@user}", `<@${user.id}>`);
message = message.replace("{servername}", guild.name);
message = message.replace("{username}", user.username);
message = message.replace("{user}", user.globalName || user.username);
```

### Embed vs Plain Text

Controlled by `ismsgembed` in server config:
- `true`: Sends as embed
- `false`: Sends as plain text (default)

Not configured via Messages commands (requires manual database update or separate command)

---

## Database Schema

### Server Configuration (srvcol)
```javascript
{
    srv: String,
    joinmsg: String,           // Join message template
    leavemsg: String,          // Leave message template
    join: String,              // Join channel ID
    leave: String,             // Leave channel ID
    ismsgembed: Boolean        // Embed format toggle
}
```

---

## Best Practices

### Message Design
- Keep messages friendly and welcoming
- Use placeholders for personalization
- Test with `\n` for multi-line messages
- Consider server culture/tone

### Placeholder Usage
- `{@user}` for mentions (pings user)
- `{user}` for display name (no ping)
- `{servername}` for branding
- `{username}` for exact username

### Channel Configuration
1. Set messages first with these commands
2. Configure channels with `/setlogchannel`
3. Test by joining/leaving with alt account

### Common Templates

**Professional:**
```
Welcome {@user} to {servername}! Please read the rules and enjoy your stay.
```

**Casual:**
```
Hey {@user}! Welcome to the party! 🎉
```

**Informative:**
```
{@user} joined {servername}!
Make sure to check out #rules and #info!
```

**Goodbye:**
```
{@user} has left {servername}. We'll miss you!
```

---

## Notes

- All commands use ephemeral replies
- Messages stored in database (persist across restarts)
- Placeholders case-sensitive
- `/supersecretmsgcommand` is owner-only feature
- Join/leave messages require channel configuration
- Newlines created with `\n` in command
- No character limit enforced by commands (Discord's 2000 char limit applies)
