declare namespace NodeJS {
    interface ProcessEnv {
        DOCK_ENV: 'test' | 'dev' | 'prod'
        PG_CONNECTION_STRING: string
        MONGO_CONNECTION_STRING: string
    }
}