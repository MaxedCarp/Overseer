class essentials {
	static sleep(seconds){
		return new Promise(r => setTimeout(r, seconds * 1000));
	}
	static fishList() {
		return [
			"salmon",
			"tang",
			"shark",
			"betta",
			"tuna",
			"guppy",
			"mahi-mahi",
			"halibut",
			"cod",
			"haddock",
			"anchovy",
			"herring",
			"sturgeon",
			"trout",
			"pike",
			"marlin",
			"mackerel",
			"snapper",
			"eel",
			"barracuda",
			"carp",
			"bass",
			"perch",
			"flounder",
			"dory",
			"wrasse",
			"grouper",
			"sardine",
			"tilapia",
			"shrimp",
			"fish"
		];
	}
	static parsetime(str = '', format = 'ms') {
		let parse = {};
		parse.unit = require('./locales/parselocale.js').en();
		const durationRE = /((?:\d{1,16}(?:\.\d{1,16})?|\.\d{1,16})(?:[eE][-+]?\d{1,4})?)\s?([\p{L}]{0,14})/gu
		return new Promise((resolve, reject) => {
			let result = null, prevUnits;
			String(str)
				.replace(new RegExp(`(\\d)[${parse.unit.placeholder}${parse.unit.group}](\\d)`, 'g'), '$1$2')  // clean up group separators / placeholders
				.replace(parse.unit.decimal, '.') // normalize decimal separator
				.replace(durationRE, (_, n, units) => {
					// if no units, find next smallest units or fall back to format value
					// eg. 1h30 -> 1h30m
					if (!units) {
						if (prevUnits) {
							for (const u in parse.unit) if (parse.unit[u] < prevUnits) { units = u; break }
						}
						else units = format;
					}
					else units = units.toLowerCase();

					prevUnits = units = parse.unit[units] || parse.unit[units.replace(/s$/, '')];

					if (units) result = (result || 0) + n * units;
				});

			resolve(result && ((result / (parse.unit[format] || 1)) * (str[0] === '-' ? -1 : 1)));
		});
    }
};
module.exports = essentials;