const fs = require('node:fs');
class fs2 {
    static writeFile(path, data) {
        return new Promise((resolve, reject) => {
            fs.writeFile(path, data, (err) => {
                if (err) return reject(err);
                resolve(true);
            });
        })
    }
    static readFile(path, encoding = null) {
        return new Promise((resolve, reject) => {
            fs.readFile(path, encoding, (err, data) => {
                if (err) {
                    reject(err)
                }
                resolve(data);
            });
        });
    }
    static async exists(path) {
        return !!(await fs2.stat(path));
    }
    static stat(path) {
        return new Promise((resolve) => {
            fs.stat(path, (err, stat) => {
                if (err || !stat) return resolve(null);
                resolve(stat);
            });
        });
    }
	static countlines(path, encoding = null) {
        return new Promise((resolve, reject) => {
			var i;
			var count = 0;
            fs.createReadStream(path)
			.on('data', function(chunk) {
				for (i=0; i < chunk.length; i++)
					if (chunk[i] == 10) count++;
			})
			.on('end', function() {
				resolve(count);
			});
        });
    }
}
module.exports = fs2;