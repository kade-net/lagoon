declare namespace NodeJS {
    interface ProcessEnv {
        APTOS_NET: "testnet" | "mainnet"
        INDEXER_API_KEY: string
        MODULE_ADDRESS: string
        STARTING_VERSION: string
        PG_CONNECTION_STRING: string
    }
}