import fs from "fs";
import path from "path";
import crypto from "crypto"
import LunaCache from "./luna-cache";

/**
 * A simple file cache implementation. Saves the files in the
 * `.cache` directory. Does not have any kind of automatic invalidation.
 */
export default class FileCache extends LunaCache {
    constructor() {
        super();
        this.cacheDirectory = luna.config('cache.file.directory', '.storage/cache');
    }

    hash(data) {
        return crypto.createHash('sha1').update(data).digest('hex');
    }

    async clear() {
        await super.clear();

        try {
            fs.rmdirSync(this.cacheDirectory, { recursive: true });
        } catch {}
    }

    async set(key, value, group = 'default') {
        try {
            if (!fs.existsSync(path.join(this.cacheDirectory, group))) {
                fs.mkdirSync(path.join(this.cacheDirectory, group), { recursive: true });
            }
            fs.writeFileSync(path.join(this.cacheDirectory, group, this.hash(key)), JSON.stringify(value), 'UTF-8');
        } catch (error) {
            console.error(error);
        }
    }

    async get(key, group = 'default', defaultValue = false) {
        try {
            const filePath = path.join(this.cacheDirectory, group, this.hash(key));

            if (fs.existsSync(filePath)) {
                return JSON.parse(fs.readFileSync(filePath, 'UTF-8'));
            }

        } catch {}

        return defaultValue;
    }

    async has(key, group = 'default') {
        try {
            const filePath = path.join(this.cacheDirectory, group, this.hash(key));
            return fs.existsSync(filePath);
        } catch {}

        return false;
    }
}
