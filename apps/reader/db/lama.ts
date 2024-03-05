import _ from "lodash"
const { isNull } = _;
import lmdb from "node-lmdb"
import { Readable } from "stream"


export class Lama {

    env: lmdb.Env
    dbi: lmdb.Dbi

    constructor(dbi: lmdb.Dbi, env: lmdb.Env) {
        this.dbi = dbi
        this.env = env
    }

    static async init(name: string) {
        const env = new lmdb.Env()
        env.open({
            path: `./store/lama`,
            maxDbs: 10,
            mapSize: 4 * 1024 * 1024 * 1024, // TODO: add a prune worker to remove old data
        })
        const dbi = env.openDbi({
            name,
            create: true
        })
        return new Lama(dbi, env)
    }


    async put(key: string, value: string) {
        console.log("Putting", key, value)
        const txn = this.env.beginTxn()
        const bufferValue = Buffer.from(value)
        txn.putBinary(this.dbi, key, bufferValue)
        txn.commit()
    }

    async get(key: string) {
        const txn = this.env.beginTxn()
        const value = txn.getBinary(this.dbi, key)
        txn.commit()
        if (isNull(value)) {
            return null
        }
        return value.toString()
    }

    async close() {
        this.dbi.close()
        this.env.close()
    }
}

export class LamaReader extends Readable {

    env: lmdb.Env
    dbi: lmdb.Dbi
    lastKey: string

    constructor(dbi: lmdb.Dbi, env: lmdb.Env, lastKey: string = "000000000") {
        super({ objectMode: true })
        this.dbi = dbi
        this.env = env
        this.lastKey = lastKey
    }

    async _read() {
        const txn = this.env.beginTxn()
        const cursor = new lmdb.Cursor(txn, this.dbi)
        const atRange = cursor.goToRange(this.lastKey)
        if (!atRange) {
            console.log("No more data")
            this.push(null)
            return
        }
        console.log("At range", this.lastKey)
        let key
        let value
        while ((key = cursor.goToNext()) !== null) {
            value = cursor.getCurrentBinary()
            if (value) {
                const v = value.toString()
                if (v.startsWith("{") && v.endsWith("}")) {
                    this.push(JSON.stringify({ key, value: JSON.parse(v) }))
                } else {
                    this.push(JSON.stringify({ key, value: v }))
                }
            }
        }
        cursor.close()
        txn.commit()
        this.push(null)
    }

    async close() {
        this.dbi.close()
        this.env.close()
    }

    async setLastKey(key: string) {
        this.lastKey = key
    }



}