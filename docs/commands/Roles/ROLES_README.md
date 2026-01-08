# Roles Commands Documentation

This directory contains commands for role management, persistence, and automation.

## Commands Overview

| Command | Permission | Description |
|---------|------------|-------------|
| `/addroletoallusers` | Manage Roles | Bulk assign role to all members |
| `/joinroles` | Manage Roles | Manage automatic join roles |
| `/secretkeys` | Manage Roles | Manage secret key role assignment |
| `/togglepersistence` | Manage Roles | Toggle role persistence system |

---

## /addroletoallusers <role>
**File:** `addroletoallusers.js`
**Permission:** Manage Roles

**Purpose:** Add a role to all non-bot members in the server

**Parameters:**
- `role` (Role, Required): Role to assign

**Validation:**
- Bot must have Manage Roles permission
- Role must be below bot's highest role (hierarchy)
- Role must be assignable

**Process:**
1. Validates bot permissions
2. Fetches all cached members
3. Filters out bots
4. Adds role to each non-bot member
5. Confirms completion

**Behavior:**
```javascript
members.forEach(async (member) => {
    if (!member?.user?.bot)
        await member.roles.add(role);
});
```

**Response:**
```
"Done!"
```

**Use Cases:**
- Server-wide role updates
- Event roles (e.g., "Attended Event 2024")
- Mass verification
- Community milestones

**Example:**
```
/addroletoallusers role: @Verified
→ Adds @Verified to all non-bot members
```

**Warning:**
- **Cannot be undone** except manually or with another command
- May take time on large servers (rate limits)
- Affects ALL non-bot members

**Limitations:**
- Only assigns to cached members (may miss some in very large servers)
- Discord rate limits may slow bulk operations
- Cannot assign roles above bot's role

---

## /joinroles <subcommand>
**File:** `joinroles.js`
**Permission:** Manage Roles

**Purpose:** Manage roles automatically assigned when users join

### Subcommands

#### /joinroles add <role>
**Purpose:** Add a role to the join roles list

**Parameters:**
- `role` (Role, Required): Role to auto-assign

**Process:**
1. Fetches server configuration
2. Checks if role already in list
3. Adds role ID to `joinroles` array
4. Updates database
5. Confirms addition

**Database Update:**
```javascript
data.joinroles.push(roleId);
await global.srvcol.updateOne(
    {srv: guildId},
    {$set: {joinroles: data.joinroles}}
);
```

**Example:**
```
/joinroles add role: @Member
→ "Successfully added role @Member to be added on join!"
```

**Duplicate Prevention:**
```javascript
if (data.joinroles.indexOf(role.id) === -1) {
    // Only add if not already present
}
```

---

#### /joinroles remove <index>
**Purpose:** Remove a role from join roles list

**Parameters:**
- `index` (Integer, Required): Array index of role to remove

**Process:**
1. Fetches server configuration
2. Validates index is within array bounds
3. Filters out role at specified index
4. Updates database
5. Confirms removal

**Index Validation:**
```javascript
if (index >= data.joinroles.length) {
    // Error: Index too big
}
```

**Example:**
```
/joinroles remove index: 0
→ "Successfully removed join role at index 0!"

/joinroles remove index: 99
→ "Index too big!"
```

**Note:** Use `/joinroles list` to see indices

---

#### /joinroles list
**Purpose:** Display all current join roles

**Process:**
1. Fetches server configuration
2. Creates embed with role list
3. Shows index and role mention for each

**Display Format:**
```
(0). Role: @Member
(1). Role: @Verified
(2). Role: @Community
```

**Embed:**
- Title: "Join Role List"
- Color: `0x69FA04` (Green)
- Author: Command user
- Footer: Server info

**Empty List:**
```
"There are no join roles on this server!"
```

**Example:**
```
/joinroles list
→ Shows all join roles with their indices
```

---

### Join Roles Integration

**Assigned When:**
- User joins server (MemberJoin event)
- Processed in `guildevents.js`

**Assignment Order:**
1. Role persistence roles (if enabled)
2. Join roles
3. Combined (persistence + join roles if both active)

**Process in guildevents.js:**
```javascript
const obj = await global.srvcol.findOne({srv: guildId});
for (const roleId of obj.joinroles) {
    const role = guild.roles.cache.find(r => r.id === roleId);
    if (role) {
        await member.roles.add(role);
    }
}
```

**Limitations:**
- Roles must exist in server
- Roles must be below bot's highest role
- Bot must have Manage Roles permission
- Deleted roles silently skipped

---

## /secretkeys <subcommand>
**File:** `secretkeys.js`
**Permission:** Manage Roles

**Purpose:** Manage automatic role assignment based on message keywords

### Subcommands

#### /secretkeys add <key> <role> <agerequirement>
**Purpose:** Create a secret key for role assignment

**Parameters:**
- `key` (String, Required): Keyword/phrase to detect
- `role` (Role, Required): Role to grant
- `agerequirement` (Integer, Required): Minimum seconds in server

**Process:**
1. Converts key to lowercase
2. Creates database record
3. Confirms addition

**Database Record:**
```javascript
{
    srv: guildId,
    key: keyword.toLowerCase(),
    roleID: roleId,
    agereq: ageRequirement  // in seconds
}
```

**Example:**
```
/secretkeys add key: secret password role: @Insider agerequirement: 86400
→ "Successfully added role @Insider with the keyword(s) 'secret password'! Required age: 86400 seconds."
```

**Age Requirement:**
- Prevents new accounts from immediately getting roles
- Calculated as: `joinTimestamp + ageReq < currentTime`
- Specified in seconds

**Common Age Requirements:**
- 1 hour: 3600
- 1 day: 86400
- 1 week: 604800
- 1 month: 2592000

---

#### /secretkeys delete <key>
**Purpose:** Remove a secret key

**Parameters:**
- `key` (String, Required): Keyword to remove

**Process:**
1. Converts key to lowercase
2. Checks if key exists
3. Deletes from database
4. Confirms deletion

**Example:**
```
/secretkeys delete key: secret password
→ "Key 'secret password' deleted successfully!"

/secretkeys delete key: nonexistent
→ "Key 'nonexistent' does not exist!"
```

---

#### /secretkeys list
**Purpose:** Display all secret keys

**Display Format:**
```
(0) Key: secret password. Role: @Insider. Minimum Age: 86400 seconds.
(1) Key: cool phrase. Role: @Cool. Minimum Age: 3600 seconds.
```

**Embed:**
- Title: "Secret Key List"
- Color: `0x69FA04` (Green)
- Author: Command user
- Footer: Server info

**Example:**
```
/secretkeys list
→ Shows all secret keys with indices, roles, and age requirements
```

---

### Secret Keys Integration

**Triggered When:**
- User sends a message (MessageCreate event)
- Processed in `messageevents.js`

**Detection Process:**
1. Message content converted to lowercase
2. MongoDB text search against `secretkeyscol`
3. Results sorted by relevance score
4. Checks if exact key appears in message
5. Validates conditions:
   - Role exists
   - User doesn't already have role
   - Bot can edit role (hierarchy)
   - User meets age requirement
6. Grants role if all conditions met

**Age Requirement Check:**
```javascript
if ((joinTimestamp + ageReq) < Date.now()) {
    member.roles.add(role);
}
```

**Text Search:**
- Uses MongoDB text search with scoring
- Finds best match if multiple keys present
- Case-insensitive
- Supports fuzzy matching

**Example:**
```
User types: "I know the secret password!"
→ Bot detects "secret password"
→ Checks age requirement
→ Grants @Insider role
```

**Limitations:**
- Requires exact key phrase in message
- Case-insensitive matching
- User must meet age requirement
- Role must be editable by bot

---

## /togglepersistence
**File:** `togglepersistence.js`
**Permission:** Manage Roles

**Purpose:** Toggle role persistence system (restore roles when users rejoin)

**Behavior When Enabling:**
1. Toggles `rolepersistence` to `true`
2. Saves all current members' roles to database
3. Stores nickname and role IDs for each member

**Behavior When Disabling:**
1. Toggles `rolepersistence` to `false`
2. Deletes all persistence records for the server

**Database Updates:**

**Enable (Saves Roles):**
```javascript
for (member of members) {
    const record = {
        srv: guildId,
        userid: memberId,
        nickname: memberNickname,
        roles: member._roles  // Array of role IDs
    };

    if (!existingRecord) {
        await global.persistcol.insertOne(record);
    } else {
        await global.persistcol.updateOne(
            {srv: guildId, userid: memberId},
            {$set: {nickname, roles}}
        );
    }
}
```

**Disable (Deletes Records):**
```javascript
await global.persistcol.deleteMany({srv: guildId});
```

**Response:**
```
"Role Persistence is now enabled"
or
"Role Persistence is now disabled"
```

**Example:**
```
/togglepersistence
→ "Role Persistence is now enabled"
→ Saves all member roles

/togglepersistence
→ "Role Persistence is now disabled"
→ Deletes all saved roles
```

---

### Role Persistence Integration

**Restored When:**
- User joins server (MemberJoin event)
- Processed in `guildevents.js`

**Restoration Process:**
1. Checks if `rolepersistence` is enabled
2. Queries `persistcol` for user's saved roles
3. Filters out roles that:
   - No longer exist
   - Bot cannot assign
   - Are @everyone
4. Assigns all valid saved roles
5. Sets saved nickname (if any)

**Delay:**
- Persistence save happens 7.5 seconds after join
- Prevents race conditions with join events

**Priority:**
- Persisted roles assigned first
- Then join roles added
- Nickname applied after roles

**Saved Data:**
```javascript
{
    srv: guildId,
    userid: userId,
    nickname: "Saved Nickname",
    roles: ["roleId1", "roleId2", "roleId3"]
}
```

**Use Cases:**
- Prevent role loss on accidental leave
- Maintain member status across rejoins
- Preserve moderator/staff roles
- Keep verification status

**Limitations:**
- Only saves roles when persistence is enabled
- Deleted roles cannot be restored
- Bot cannot assign roles above its highest role
- Large servers may experience delays during bulk save

---

## Common Role Management Patterns

### Hierarchy Validation
Roles must be below bot's highest role:
```javascript
if (role.position >= botHighestRole.position) {
    // Cannot assign
}
```

### Bot Permission Check
```javascript
const hasPerms = guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles);
if (!hasPerms) {
    // Error
}
```

### Database Array Management
```javascript
// Add to array
data.array.push(item);

// Remove from array
data.array = data.array.filter(i => i !== itemToRemove);

// Update database
await global.srvcol.updateOne({srv: guildId}, {$set: {array: data.array}});
```

---

## Database Schema

### Server Configuration (srvcol)
```javascript
{
    srv: String,
    joinroles: [String],        // Array of role IDs
    rolepersistence: Boolean    // Persistence toggle
}
```

### Secret Keys (secretkeyscol)
```javascript
{
    srv: String,
    key: String,               // Keyword (lowercase)
    roleID: String,            // Role to assign
    agereq: Number             // Age requirement in seconds
}
```

### Role Persistence (persistcol)
```javascript
{
    srv: String,
    userid: String,
    nickname: String,
    roles: [String]            // Array of role IDs
}
```

---

## Integration Points

### MemberJoin Event (guildevents.js)
1. **Role Persistence:** Restores saved roles (if enabled)
2. **Join Roles:** Assigns configured join roles
3. **Combined:** Both systems work together

**Priority Order:**
1. Persistence roles
2. Join roles
3. Nickname from persistence

### MessageCreate Event (messageevents.js)
- **Secret Keys:** Detects keywords and assigns roles
- **Age Check:** Validates user has been in server long enough
- **Text Search:** MongoDB fuzzy matching for flexibility

### MemberUpdate Event (guildevents.js)
- **Persistence Save:** Saves roles 7.5s after join (if enabled)
- **Update Record:** Updates existing persistence record with current roles

---

## Best Practices

### Join Roles
- Assign basic/default roles only
- Keep list small (3-5 roles maximum)
- Don't include high-permission roles
- Test with alt account

### Secret Keys
- Use non-obvious phrases
- Set appropriate age requirements
- Don't use for admin/mod roles
- Monitor for abuse

### Role Persistence
- Enable for communities where roles matter
- Be aware of storage impact on large servers
- Disable during mass role changes
- Test before enabling server-wide

### Bulk Role Assignment
- Use `/addroletoallusers` sparingly
- Cannot be easily undone
- May hit rate limits
- Verify role first with small test

---

## Notes

- All commands use ephemeral replies
- Join roles assigned to new members automatically
- Secret keys use case-insensitive matching
- Role persistence saves roles 7.5 seconds after join
- Age requirements prevent immediate role farming
- Database indexed for text search on secret keys
- Bulk role assignment affects all non-bot members
- Persistence toggle saves/deletes all records
- Role hierarchy enforced by Discord
- Deleted roles automatically skipped
