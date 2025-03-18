class purgeset {
    static getImages(channel, lim, sor) {
		return new Promise((resolve, reject) => {
			const look = { $and: [ { messageChannelID: channel,  $or: [ { "messageAttachments.fileType": "image/png" }, { "messageAttachments.fileType": "image/jpeg" }, { "messageAttachments.fileType": "image/webp" } ] } ] };
			const data = global.msgcol.find(look).limit(lim).sort({"_id": sor}).toArray();
			resolve(data);
		});
    }
	static getAttachments(channel, lim, sor) {
		return new Promise((resolve, reject) => {
			const look = {$and: [{messageChannelID: channel, messageAttachments: {$not: { $eq: [] }}, "messageAttachments.fileType": {$not: { $eq: "text/css; charset=utf-8" }}}]};
			const data = global.msgcol.find(look).limit(lim).sort({"_id": sor}).toArray();
			resolve(data);
		});
    }
	static getVideos(channel, lim, sor) {
		return new Promise((resolve, reject) => {
			const look = { $and: [ { messageChannelID: channel,  $or: [ { "messageAttachments.fileType": "video/mp4" }, { "messageAttachments.fileType": "video/mkv" } ] } ] };
			const data = global.msgcol.find(look).limit(lim).sort({"_id": sor}).toArray();
			resolve(data);
		});
    }
	static getGIFs(channel, lim, sor) {
		return new Promise((resolve, reject) => {
			const look = { $and: [ { messageChannelID: channel,  "messageAttachments.fileType": "image/gif" } ] };
			const data = global.msgcol.find(look).limit(lim).sort({"_id": sor}).toArray();
			resolve(data);
		});
    }
	static getAudio(channel, lim, sor) {
		return new Promise((resolve, reject) => {
			const look = { $and: [ { messageChannelID: channel,  $or: [ { "messageAttachments.fileType": "audio/mpeg" }, { "messageAttachments.fileType": "audio/mp3" }, { "messageAttachments.fileType": "audio/m4a" } ] } ] };
			const data = global.msgcol.find(look).limit(lim).sort({"_id": sor}).toArray();
			resolve(data);
		});
    }
    
}
module.exports = purgeset;