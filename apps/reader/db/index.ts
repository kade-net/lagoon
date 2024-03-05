import _ from "lodash"
import { Lama } from "./lama"
const { isNumber, isNull } = _;


export abstract class EventProcessor {
    abstract process(event: Record<string, any>): Promise<void>
}

export class LevelDB {
    _db: Lama
    private _sequence_store: Lama
    private _version_store: Lama


    constructor(_db: Lama, _sequence_store: Lama, _version_store: Lama) {
        this._db = _db
        this._sequence_store = _sequence_store
        this._version_store = _version_store
    }

    static async init() {
        const events = await Lama.init("events")
        const sequences = await Lama.init("sequences")
        const versions = await Lama.init("_versions")
        return new LevelDB(events, sequences, versions)
    }

    async getLatestVersion() {
        try {
            const version = await this._version_store.get("version")
            console.log("Version", version)
            const p = version ? BigInt(version) : BigInt(0)
            return p
        }
        catch (e) {
            await this.putVersion(BigInt(0))
            return BigInt(0)
        }
    }

    async putVersion(version: bigint) {
        await this._version_store!.put("version", version.toString())
    }

    async getSequenceNumber() {
        try {
            const number = await this._sequence_store!.get("sequence")
            const p = isNull(number) ? 0 : parseInt(number)
            return Number.isNaN(p) ? 0 : p
        }
        catch (e) {
            console.log("Error", e)
            return 0
        }
    }

    padSequenceNumber(num: number, size: number) {
        let s = "000000000" + num;
        return s.substring(s.length - size);
    }

    getNextKey(sequence: number) {
        const paddedSequence = this.padSequenceNumber(sequence, 9);
        return paddedSequence;
    }

    async put(data: Record<string, any>) {
        const sequence = await this.getSequenceNumber();
        console.log("Sequence", sequence);
        const nextKey = this.getNextKey(sequence);
        await this._db!.put(nextKey, JSON.stringify(data));
        await this._sequence_store!.put("sequence", `${sequence + 1}`);
        await this._version_store!.put("version", `${sequence + 1}`);
    }

    async get(sequence: number) {
        const nextKey = this.getNextKey(sequence);
        return await this._db!.get(nextKey);
    }



}