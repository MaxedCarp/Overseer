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
			var count = 0;
			var lastChar = null;
			var hasContent = false;

            fs.createReadStream(path)
			.on('data', function(chunk) {
				if (chunk.length > 0) {
					hasContent = true;
					lastChar = chunk[chunk.length - 1];
					for (let i = 0; i < chunk.length; i++) {
						if (chunk[i] == 10) count++;
					}
				}
			})
			.on('end', function() {
				// If file has content and doesn't end with newline, add 1
				if (hasContent && lastChar !== 10) {
					count++;
				}
				resolve(count);
			})
			.on('error', function(err) {
				reject(err);
			});
        });
    }
}
module.exports = fs2;