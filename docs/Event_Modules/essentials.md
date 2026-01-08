# essentials.js - Utility Functions Module

## Overview
**File:** `Event_Modules/essentials.js`
**Purpose:** Collection of essential utility functions used throughout the bot

## Dependencies
```javascript
const { contact } = require("../config.json");
const parselocale = require("./locales/parselocale.js");
```

## Class: essentials

### Static Methods

#### sleep(seconds)
**Returns:** `Promise<void>`
**Purpose:** Async sleep function

**Parameters:**
- `seconds` (Number): Time to sleep in seconds

**Usage:**
```javascript
await essentials.sleep(5); // Sleep for 5 seconds
```

**Implementation:**
```javascript
return new Promise(r => setTimeout(r, seconds * 1000));
```

---

#### fishList()
**Returns:** `Array<String>`
**Purpose:** Returns list of fish names for fish mode feature

**Fish Names:** (40 total)
- Common: salmon, tuna, cod, bass, trout, carp
- Exotic: mahi-mahi, marlin, barracuda
- Small: guppy, anchovy, sardine
- Special: betta, tang, shark, eel, shrimp
- Generic: "fish"

**Usage:**
```javascript
const fishes = essentials.fishList();
// ["salmon", "tang", "shark", ...]
```

**Notes:**
- Used by fish mode feature to identify fish-related messages
- Includes "carp" (likely reference to user "Carp")
- Total of 40 fish types

---

#### parsetime(str, format)
**Returns:** `Promise<Number>`
**Purpose:** Parse human-readable time strings into milliseconds or specified format

**Parameters:**
- `str` (String): Time string (e.g., "1h30m", "5 days", "2 hours 30 minutes")
- `format` (String): Output format ('ms', 's', 'm', 'h', 'd', 'y') - Default: 'ms'

**Supported Units:**
- **Years**: year, yr, y
- **Months**: month, mo, mth
- **Weeks**: week, wk, w
- **Days**: day, d
- **Hours**: hour, hr, h
- **Minutes**: minute, min, m
- **Seconds**: second, sec, s
- **Milliseconds**: millisecond, millisec, ms
- **Microseconds**: microsecond, microsec, us, µs
- **Nanoseconds**: nanosecond, nanosec, ns

**Examples:**
```javascript
await essentials.parsetime("1h30m", "s");        // 5400 (seconds)
await essentials.parsetime("5 days", "ms");      // 432000000 (milliseconds)
await essentials.parsetime("2 hours 30 min");    // 9000000 (ms, default)
await essentials.parsetime("1y 2mo 3d", "d");    // ~425 days
```

**Features:**
- **Flexible Input**: Handles various formats and units
- **Multiple Units**: Can combine units (e.g., "1h 30m 15s")
- **Singular/Plural**: Accepts both "hour" and "hours"
- **Abbreviated**: Supports short forms (h, m, s, etc.)
- **Negative Values**: Supports negative time with "-" prefix
- **Decimal Support**: Handles decimal numbers (1.5h)
- **Scientific Notation**: Supports scientific notation (1e3ms)

**Parsing Process:**
1. Removes thousand separators and group characters
2. Normalizes decimal points
3. Matches duration patterns using regex: `/(number)(units?)/`
4. Converts each unit to milliseconds internally
5. Sums all components
6. Converts to requested output format

**Regex Pattern:**
```javascript
/((?:\d{1,16}(?:\.\d{1,16})?|\.\d{1,16})(?:[eE][-+]?\d{1,4})?)\s?([\p{L}]{0,14})/gu
```

**Time Conversions:**
- 1 second = 1000ms
- 1 minute = 60,000ms
- 1 hour = 3,600,000ms
- 1 day = 86,400,000ms
- 1 year = 31,557,600,000ms (365.25 days)
- 1 month = 2,629,800,000ms (year / 12)
- 1 week = 604,800,000ms

---

#### checkFocus(user, server)
**Returns:** `Promise<Boolean>`
**Purpose:** Check if a user is being focused (monitored) in a server

**Parameters:**
- `user` (String): User ID
- `server` (String): Server/Guild ID

**Usage:**
```javascript
if (await essentials.checkFocus(userId, guildId)) {
    // Send focus notification
}
```

**Database Query:**
```javascript
await global.focuscol.findOne({"userid": user, "srv": server})
```

**Returns:**
- `true`: User is being focused
- `false`: User is not being focused

**Used For:**
- Voice state updates
- Message events
- User profile changes
- Presence updates
- Join/leave events

---

#### log(text, code)
**Returns:** `Promise<void>`
**Purpose:** Log errors to console and DM contact user

**Parameters:**
- `text` (String): Error message or stack trace
- `code` (String): Error code

**Behavior:**
1. **Ignored Errors**: Silently ignores `GuildMembersTimeout` errors
2. **Console Log**: Logs to console with "Caught exception:" prefix
3. **DM Notification**: Sends error to configured contact user
4. **Timestamp**: Includes Unix timestamp in DM message

**Usage:**
```javascript
try {
    // risky operation
} catch (err) {
    await essentials.log(err.stack, err.code);
}
```

**DM Format:**
```
[<t:1234567890:f>] Error: Something went wrong
    at someFunction (file.js:123:45)
    ...
```

**Special Case:**
- Error code `GuildMembersTimeout` is silently ignored (returns early)
- This prevents spam from common timeout errors when fetching guild members

## Usage Throughout Bot

### Common Patterns

**Sleep for rate limiting:**
```javascript
await essentials.sleep(5);
await message.delete();
```

**Parse user input time:**
```javascript
const duration = await essentials.parsetime(userInput, 'ms');
member.timeout(duration);
```

**Check if monitoring user:**
```javascript
if (await essentials.checkFocus(user.id, guild.id)) {
    // Send detailed notifications
}
```

**Error handling:**
```javascript
process.on('uncaughtException', async (err) => {
    await essentials.log(err.stack, err.code);
});
```

## Dependencies

### Config Contact
- Requires `contact` user ID from `config.json`
- Used for error notification DMs

### Parse Locale Module
- Uses `./locales/parselocale.js` for time unit definitions
- Currently only supports English locale (`en()`)

## Notes

- All methods are static - no instantiation required
- Async methods return Promises for await compatibility
- Fish list includes 40 different fish types
- Time parser supports extremely flexible input
- Focus checking integrates with global MongoDB collection
- Error logging prevents GuildMembersTimeout spam
- Used extensively across all bot modules
