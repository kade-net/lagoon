import db from "./client"


interface PEER {
    protocol: string,
    host: string,
    port: number
    name: string,
}


interface RISE_EVENT {
    timestamp: number,
}

interface SLEEP_EVENT {
    timestamp: number,
}


export const peers = db.collection<PEER>("peers")
export const rise_events = db.collection<RISE_EVENT>("rise_events")
export const sleep_events = db.collection<SLEEP_EVENT>("sleep_events")

