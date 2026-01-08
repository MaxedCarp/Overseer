# embedcreator.js - Discord Embed and Button Creator

## Overview
**File:** `Event_Modules/embedcreator.js`
**Purpose:** Utility class for creating Discord embeds and buttons with automatic field splitting

## Dependencies
```javascript
const { EmbedBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
```

## Class: embedcreator

### Static Methods

#### Create(title, description, image, footer, footericon, author, authoricon, color, fields, url, thumbnail)
**Returns:** `Promise<EmbedBuilder>`
**Purpose:** Creates a Discord embed with automatic field length management

**Parameters:**
| Parameter | Type | Optional | Description |
|-----------|------|----------|-------------|
| `title` | String | Yes | Embed title |
| `description` | String | Yes | Embed description |
| `image` | String (URL) | Yes | Embed image URL |
| `footer` | String | Yes | Footer text |
| `footericon` | String (URL) | Yes | Footer icon URL |
| `author` | String | Yes | Author name |
| `authoricon` | String (URL) | Yes | Author icon URL |
| `color` | Hex Number | Yes | Embed color (e.g., 0xFF0000) |
| `fields` | Array | Yes | Array of field objects `{name, value, inline}` |
| `url` | String (URL) | Yes | Embed URL (makes title clickable) |
| `thumbnail` | String (URL) | Yes | Thumbnail URL |

**Field Processing Logic:**
1. **Maximum Field Value**: 2500 characters (truncates if longer)
2. **Standard Field**: Values ≤ 1024 characters added normally
3. **Long Field Split**: Values > 1024 characters split into multiple fields
   - First field: Uses original name, first 1024 characters
   - Subsequent fields: Name is " ", chunks of 1024 characters
   - Maintains inline property across all split fields

**Example:**
```javascript
const embed = await EmbedCreator.Create(
    "Welcome!",
    "This is a welcome message",
    null,
    "Server Name",
    "https://server.icon/url",
    "User Name",
    "https://user.avatar/url",
    0x00FF00,
    [{name: "Field 1", value: "Value 1", inline: true}],
    "https://example.com",
    "https://thumbnail.url"
);
```

**Field Splitting Example:**
```javascript
// Input field with 2500+ character value
{name: "Long Field", value: "A".repeat(2500), inline: false}

// Output: Multiple fields
[
    {name: "Long Field", value: "A".repeat(1024), inline: false},
    {name: " ", value: "A".repeat(1024), inline: false},
    {name: " ", value: "A".repeat(452), inline: false}
]
```

#### Button(id, label, style, emoji, disabled)
**Returns:** `Promise<ButtonBuilder>`
**Purpose:** Creates a Discord button component

**Parameters:**
| Parameter | Type | Optional | Description |
|-----------|------|----------|-------------|
| `id` | String | No | Custom ID for the button |
| `label` | String | No | Button text label |
| `style` | ButtonStyle | No | Button style (Primary, Secondary, Success, Danger, Link) |
| `emoji` | String | Yes | Emoji to display on button |
| `disabled` | Boolean | Yes | Whether button is disabled |

**Button Styles:**
- `ButtonStyle.Primary`: Blue button
- `ButtonStyle.Secondary`: Gray button
- `ButtonStyle.Success`: Green button
- `ButtonStyle.Danger`: Red button
- `ButtonStyle.Link`: Link button (requires URL instead of custom ID)

**Example:**
```javascript
const button = await EmbedCreator.Button(
    "confirm_action",
    "Confirm",
    ButtonStyle.Success,
    "✅",
    false
);
```

## Usage Pattern

### Creating an Embed with Button
```javascript
const embed = await EmbedCreator.Create(
    "Action Required",
    "Please confirm your action",
    null, guild.name, guild.iconURL(),
    user.username, user.avatarURL(),
    0xFF0000,
    [{name: "Details", value: "Action details here"}]
);

const confirmBtn = await EmbedCreator.Button("confirm", "Confirm", ButtonStyle.Success);
const cancelBtn = await EmbedCreator.Button("cancel", "Cancel", ButtonStyle.Danger);

const row = new ActionRowBuilder().addComponents(confirmBtn, cancelBtn);

await channel.send({ embeds: [embed], components: [row] });
```

## Key Features

1. **Automatic Field Splitting**: Handles Discord's 1024 character field limit automatically
2. **Flexible Parameters**: All parameters are optional (except button's id, label, style)
3. **Promise-Based**: Returns promises for async compatibility
4. **Field Validation**: Filters out empty fields (value.length > 0)
5. **Length Safety**: Truncates fields at 2500 characters to prevent errors

## Discord Limits Handled

| Element | Limit | Handling |
|---------|-------|----------|
| Field Value | 1024 chars | Auto-splits into multiple fields |
| Field Max Content | 2500 chars | Truncates at 2500 before splitting |
| Embed Color | Hex number | Direct passthrough |
| URL Fields | Valid URL | No validation, direct passthrough |

## Notes

- Empty field values are automatically filtered out
- Field splitting preserves the `inline` property across all chunks
- The class uses static methods, no instantiation required
- All methods return Promises that resolve immediately
- Used extensively throughout the bot for consistent embed formatting
