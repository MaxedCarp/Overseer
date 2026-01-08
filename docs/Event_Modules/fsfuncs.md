# fsfuncs.js - File System Functions

## Overview
**File:** `Event_Modules/fsfuncs.js`
**Purpose:** Promise-based wrapper for Node.js file system operations

## Dependencies
```javascript
const fs = require('node:fs');
```

## Class: fs2

All methods are static and return Promises for async/await compatibility.

### Static Methods

#### writeFile(path, data)
**Returns:** `Promise<Boolean>`
**Purpose:** Write data to a file asynchronously

**Parameters:**
- `path` (String): File path to write to
- `data` (String/Buffer): Data to write

**Usage:**
```javascript
await fs2.writeFile('./data.txt', 'Hello World');
```

**Returns:**
- `true` on success
- Rejects promise with error on failure

**Implementation:**
```javascript
fs.writeFile(path, data, (err) => {
    if (err) return reject(err);
    resolve(true);
});
```

---

#### readFile(path, encoding)
**Returns:** `Promise<String|Buffer>`
**Purpose:** Read file contents asynchronously

**Parameters:**
- `path` (String): File path to read
- `encoding` (String): Optional encoding (e.g., 'utf8', 'utf-8') - Default: null (returns Buffer)

**Usage:**
```javascript
const content = await fs2.readFile('./data.txt', 'utf8');
const buffer = await fs2.readFile('./image.png');
```

**Returns:**
- String if encoding specified
- Buffer if no encoding specified
- Resolves with data even on error (may return undefined)

**Note:** Does not reject on error, just resolves with undefined

---

#### exists(path)
**Returns:** `Promise<Boolean>`
**Purpose:** Check if a file or directory exists

**Parameters:**
- `path` (String): Path to check

**Usage:**
```javascript
if (await fs2.exists('./config.json')) {
    // File exists
}
```

**Implementation:**
```javascript
return !!(await fs2.stat(path));
```

**Returns:**
- `true`: Path exists
- `false`: Path does not exist or error occurred

---

#### stat(path)
**Returns:** `Promise<fs.Stats|null>`
**Purpose:** Get file/directory statistics

**Parameters:**
- `path` (String): Path to get stats for

**Usage:**
```javascript
const stats = await fs2.stat('./file.txt');
if (stats) {
    console.log('Size:', stats.size);
    console.log('Is file:', stats.isFile());
    console.log('Is directory:', stats.isDirectory());
}
```

**Returns:**
- `fs.Stats` object on success
- `null` on error or if path doesn't exist

**Stats Object Properties:**
- `size`: File size in bytes
- `isFile()`: Returns true if it's a file
- `isDirectory()`: Returns true if it's a directory
- `isSymbolicLink()`: Returns true if it's a symlink
- `mtime`: Last modified time
- `birthtime`: Creation time

---

#### countlines(path, encoding)
**Returns:** `Promise<Number>`
**Purpose:** Count number of lines in a file

**Parameters:**
- `path` (String): File path to count lines in
- `encoding` (String): Optional encoding - Default: null

**Usage:**
```javascript
const lineCount = await fs2.countlines('./app.js');
console.log(`File has ${lineCount} lines`);
```

**Algorithm:**
1. Creates a read stream for the file
2. Processes file in chunks
3. Counts newline characters (byte value 10, `\n`)
4. If file has content but doesn't end with newline, adds 1 to count
5. Handles empty files (returns 0)

**Implementation Details:**
- **Chunk Processing**: Reads file in chunks for memory efficiency
- **Last Character Check**: Adds 1 if file doesn't end with `\n`
- **Empty File**: Returns 0 for empty files
- **Character Code**: Newline is byte `10` (ASCII/UTF-8 `\n`)

**Edge Cases:**
```javascript
// Empty file
"" → 0 lines

// Single line, no newline at end
"Hello" → 1 line

// Single line with newline
"Hello\n" → 1 line

// Multiple lines
"Line 1\nLine 2\nLine 3" → 3 lines

// Multiple lines with trailing newline
"Line 1\nLine 2\nLine 3\n" → 3 lines
```

**Usage in Bot:**
Used by `app.js` `printLines()` function to count total lines of code in the project.

**Stream Events:**
- `data`: Processes chunk, counts newlines
- `end`: Handles final line count adjustment
- `error`: Rejects promise with error

## Usage Patterns

### Writing Configuration
```javascript
const config = JSON.stringify(configObject, null, 2);
await fs2.writeFile('./config.json', config);
```

### Reading and Parsing JSON
```javascript
const data = await fs2.readFile('./config.json', 'utf8');
const config = JSON.parse(data);
```

### Checking Before Reading
```javascript
if (await fs2.exists('./optional.json')) {
    const data = await fs2.readFile('./optional.json', 'utf8');
    // process data
}
```

### Getting File Info
```javascript
const stats = await fs2.stat('./bigfile.dat');
if (stats && stats.size > 10000000) {
    console.log('File is larger than 10MB');
}
```

### Counting Lines in Project
```javascript
const files = ['app.js', 'module1.js', 'module2.js'];
let totalLines = 0;
for (const file of files) {
    totalLines += await fs2.countlines(file);
}
console.log(`Total lines: ${totalLines}`);
```

## Advantages Over Native fs

1. **Promise-Based**: All methods return promises, no callback hell
2. **Async/Await**: Compatible with modern async/await syntax
3. **Error Handling**: Consistent error handling with promises
4. **Line Counting**: Provides additional `countlines()` utility
5. **Convenience**: `exists()` method for quick existence checks

## Notes

- All methods are static - no class instantiation needed
- `readFile` resolves even on error (may return undefined)
- `stat` returns `null` on error instead of throwing
- `exists` uses double negation `!!` for boolean coercion
- `countlines` is memory-efficient for large files (streaming)
- Used by bot for counting total lines of code on startup
- Character code `10` is `\n` (newline) in ASCII/UTF-8
