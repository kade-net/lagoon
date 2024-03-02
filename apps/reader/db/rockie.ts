import RocksDB from "rocksdb"

export class Rockie<K extends string = string, V extends string = string> {
    private _location: string
    private _db: RocksDB

    static async create(location: string) {
        const db = RocksDB(location)
        return new Promise((resolve, reject) => {
            db.open({
                createIfMissing: true
            }, (err) => {
                if (err) {
                    reject(err)
                }
                else {
                    resolve(new Rockie(location))
                }
            })
        })
    }

    static async openOrCreate(location: string) {
        const db = RocksDB(location)
        return new Promise((resolve, reject) => {
            db.open({
                createIfMissing: true
            }, (err) => {
                if (err) {
                    reject(err)
                }
                else {
                    console.log("opened")
                    resolve(new Rockie(location))
                }
            })
        })
    }

    constructor(location: string) {
        this._location = location
        this._db = RocksDB(location)
        console.log("created")
    }

    async open(options: RocksDB.OpenOptions) {
        return new Promise((resolve, reject) => {
            this._db.open(options, (err) => {
                if (err) {
                    reject(err)
                }
                else {
                    resolve(null)
                }
            })
        })
    }

    async put(key: K, value: V) {
        console.log("put", key, value)
        return new Promise((resolve, reject) => {
            this._db.put(Buffer.from(key), Buffer.from(value), (err) => {
                if (err) {
                    console.log("error", err)
                    reject(err)
                }
                else {
                    console.log("resolved")
                    resolve(null)
                }
            })
        })
    }

    async get(key: K): Promise<V> {
        return new Promise((resolve, reject) => {
            this._db.get(Buffer.from(key), (err, value) => {
                if (err) {
                    reject(err)
                }
                else {
                    resolve(value.toString() as V)
                }
            })
        })
    }

    async close() {
        return new Promise((resolve, reject) => {
            this._db.close((err) => {
                if (err) {
                    reject(err)
                }
                else {
                    resolve(null)
                }
            })
        })

    }

    async destroy() {
        return new Promise((resolve, reject) => {

            this._db.destroy(this._location, (err) => {
                if (err) {
                    reject(err)
                }
                else {
                    resolve(null)
                }

            })
        })
    }


    iterator(options: RocksDB.IteratorOptions) {
        return this._db.iterator(options)
    }

}