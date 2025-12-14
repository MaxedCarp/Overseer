class KeywordFilter {
    // Checks if a message contains any filtered keywords from the database and deletes it if found
    // Fetches keywords from global.filtercol collection
    // Returns object with deletion status and matched pattern
    static async checkAndDelete(message) {
        try {
            if (!message || !message.content) {
                return { deleted: false, matchedPattern: null };
            }

            if (!global.filtercol) {
                console.error('KeywordFilter: global.filtercol is not defined');
                return { deleted: false, matchedPattern: null };
            }

            const filters = await global.filtercol.find({srv: message.guild.id}).toArray();

            if (!filters || filters.length === 0) {
                return { deleted: false, matchedPattern: null };
            }

            for (const filter of filters) {
                const keyword = filter.keyword || filter.pattern;

                if (!keyword) continue;

                let regex;
                let patternString;

                try {
                    // Check if keyword is already a RegExp object
                    if (keyword instanceof RegExp) {
                        regex = keyword;
                        patternString = keyword.source;
                    }
                    // Check if keyword is a MongoDB BSON regex object
                    else if (keyword.$regularExpression) {
                        patternString = keyword.$regularExpression.pattern;
                        let flags = keyword.$regularExpression.options || '';

                        // Strip leading/trailing slashes and flags if present (e.g., "/pattern/ig")
                        const match = patternString.match(/^\/(.+)\/([gimuy]*)$/);
                        if (match) {
                            patternString = match[1];
                            flags = match[2] || flags;
                        }

                        regex = new RegExp(patternString, flags);
                    }
                    // Handle plain string patterns
                    else if (typeof keyword === 'string') {
                        const flags = filter.caseInsensitive !== false ? 'i' : '';
                        regex = new RegExp(keyword, flags);
                        patternString = keyword;
                    }
                    // Handle object with pattern/options properties
                    else if (typeof keyword === 'object' && (keyword.pattern || keyword.source)) {
                        patternString = keyword.pattern || keyword.source;
                        const flags = keyword.options || keyword.flags || '';
                        regex = new RegExp(patternString, flags);
                    }
                    else {
                        console.error(`KeywordFilter: Unsupported keyword format. Type: ${typeof keyword}, Value:`, JSON.stringify(keyword));
                        continue;
                    }
                } catch (err) {
                    console.error(`KeywordFilter: Invalid regex pattern "${patternString || keyword}":`, err);
                    continue;
                }
                if (regex.test(message.content)) {
                    return {
                        deleted: true,
                        matchedPattern: (patternString + "").replaceAll('*', "\\*") || (keyword + "").replaceAll('*', "\\*"),
                        punishment: filter.punishment
                    };
                }
            }

            return { deleted: false, matchedPattern: null };
        } catch (error) {
            console.error('KeywordFilter error:', error);
            return { deleted: false, matchedPattern: null };
        }
    }
}

module.exports = KeywordFilter;