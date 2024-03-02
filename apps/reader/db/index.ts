import { Lama } from "./lama"


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
            const p = BigInt(version)
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
            const p = parseInt(number)
            return Number.isNaN(p) ? 0 : p
        }
        catch (e) {
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
    }

    async get(sequence: number) {
        const nextKey = this.getNextKey(sequence);
        return await this._db!.get(nextKey);
    }



}