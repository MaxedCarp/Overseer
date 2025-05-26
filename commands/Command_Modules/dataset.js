class dataset {
    static addSecretKey(sid, keywords, role, agereq){
		return new Promise((resolve) => {
			global.srvcol.find({"srv": sid}).toArray().then(srvdata => {
				const sdata = srvdata[0];
				const look = {srv: sid};
				sdata.secretkeys.push({"key": keywords, "roleID": role, "agereq": agereq});
				const test = { secretkeys: sdata.secretkeys};
				const upd = { $set: test };
				global.srvcol.updateOne(look, upd).then();
				resolve(true);
			});
		});
	};
	static delSecretKey(sid, index){
		return new Promise((resolve) => {
			global.srvcol.find({"srv": sid}).toArray().then(srvdata => {
				const sdata = srvdata[0]
				const look = {srv: sid};
				sdata.secretkeys.splice(index, 1);
				const test = { secretkeys: sdata.secretkeys};
				const upd = { $set: test };
				global.srvcol.updateOne(look, upd).then();
				resolve(true);
			});
		});
	};
}
module.exports = dataset;