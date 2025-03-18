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
};
module.exports = essentials;