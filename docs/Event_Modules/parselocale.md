# parselocale.js - Time Unit Locale Definitions

## Overview
**File:** `Event_Modules/locales/parselocale.js`
**Purpose:** Defines time unit conversions and formats for the `parsetime()` function

## Class: locale

### Static Methods

#### en()
**Returns:** `Object`
**Purpose:** Returns English locale time unit definitions

**Time Unit Conversions:**

| Unit | Aliases | Milliseconds | Calculation |
|------|---------|--------------|-------------|
| **Year** | year, yr, y | 31,557,600,000 | 365.25 days |
| **Month** | month, mo, mth | 2,629,800,000 | year / 12 |
| **Week** | week, wk, w | 604,800,000 | 7 days |
| **Day** | day, d | 86,400,000 | 24 hours |
| **Hour** | hour, hr, h | 3,600,000 | 60 minutes |
| **Minute** | minute, min, m | 60,000 | 60 seconds |
| **Second** | second, sec, s | 1,000 | - |
| **Millisecond** | millisecond, millisec, ms | 1 | Base unit |
| **Microsecond** | microsecond, microsec, us, µs | 0.001 | ms / 1000 |
| **Nanosecond** | nanosecond, nanosec, ns | 0.000001 | ms / 1,000,000 |

**Base Values:**
```javascript
const m = 60000        // 1 minute in ms
const h = m * 60       // 1 hour in ms (3,600,000)
const d = h * 24       // 1 day in ms (86,400,000)
const y = d * 365.25   // 1 year in ms (31,557,600,000)
```

**Special Properties:**
```javascript
{
    group: ',',        // Thousand separator
    decimal: '.',      // Decimal point character
    placeholder: ' _'  // Placeholder characters to ignore
}
```

## Object Structure

```javascript
{
    // Years
    year: 31557600000,
    yr: 31557600000,
    y: 31557600000,

    // Months
    month: 2629800000,
    mo: 2629800000,
    mth: 2629800000,

    // Weeks
    week: 604800000,
    wk: 604800000,
    w: 604800000,

    // Days
    day: 86400000,
    d: 86400000,

    // Hours
    hour: 3600000,
    hr: 3600000,
    h: 3600000,

    // Minutes
    minute: 60000,
    min: 60000,
    m: 60000,

    // Seconds
    second: 1000,
    sec: 1000,
    s: 1000,

    // Milliseconds
    millisecond: 1,
    millisec: 1,
    ms: 1,

    // Microseconds
    microsecond: 0.001,
    microsec: 0.001,
    us: 0.001,
    µs: 0.001,

    // Nanoseconds
    nanosecond: 0.000001,
    nanosec: 0.000001,
    ns: 0.000001,

    // Formatting
    group: ',',
    decimal: '.',
    placeholder: ' _'
}
```

## Usage

### In essentials.parsetime()
```javascript
const unit = require('./locales/parselocale.js').en();

// Accessing unit values
unit.hour    // 3600000
unit.hr      // 3600000
unit.h       // 3600000

// All three resolve to the same value
```

### Example Conversions

**Input: "1 hour"**
```javascript
"1 hour" → unit['hour'] → 3600000ms
```

**Input: "30min"**
```javascript
"30min" → 30 * unit['min'] → 30 * 60000 → 1800000ms
```

**Input: "2y 3mo 5d"**
```javascript
"2y"   → 2 * 31557600000 = 63115200000
"3mo"  → 3 * 2629800000  = 7889400000
"5d"   → 5 * 86400000    = 432000000
Total: 71436600000ms (≈ 827 days)
```

## Time Calculation Notes

### Why 365.25 days?
- Accounts for leap years
- More accurate for long-term calculations
- Standard calendar year averaging

### Month Calculation
- `year / 12` = Average month length
- Not calendar-accurate (months vary 28-31 days)
- Good for approximate calculations

### Microseconds & Nanoseconds
- Values < 1 (fractional milliseconds)
- Used for high-precision timing
- Rarely used in Discord bot context

## Formatting Properties

### group: ','
Thousand separator character
```javascript
"1,000" → "1000"
"1 000 000" → "1000000"
```

### decimal: '.'
Decimal point character
```javascript
"1.5h" → 1.5 hours
"2.25d" → 2.25 days
```

### placeholder: ' _'
Characters to ignore/skip during parsing
```javascript
"1 hour" → "1hour"
"2_days" → "2days"
```

## Locale Extensibility

### Current Implementation
- Only English locale (`en()`) is implemented
- Framework supports additional locales

### Potential Future Locales
```javascript
// Example Spanish locale
static es() {
    const unit = Object.create(null);
    const m = 60000, h = m * 60, d = h * 24, y = d * 365.25;

    unit.año = unit.a = y;
    unit.mes = y / 12;
    unit.semana = unit.sem = d * 7;
    unit.dia = unit.d = d;
    unit.hora = unit.h = h;
    unit.minuto = unit.min = m;
    unit.segundo = unit.seg = unit.s = 1000;
    // ...

    unit.group = '.';
    unit.decimal = ',';
    unit.placeholder = ' _';
    return unit;
}
```

## Integration

### Used By
- `essentials.js` → `parsetime()` function
- All time parsing throughout the bot
- Timeout/ban duration parsing
- Stream notification scheduling

### Benefits
- Centralized time unit definitions
- Easy to maintain and update
- Supports multiple aliases per unit
- Extensible for internationalization

## Notes

- Uses `Object.create(null)` for clean object (no prototype pollution)
- All unit values are in milliseconds
- Singular and plural forms both supported by essentials.parsetime()
- Symbol characters supported (µ for microseconds)
- Decimal and group separators configurable per locale
- Currently only English locale is implemented
- Framework ready for multi-language support
