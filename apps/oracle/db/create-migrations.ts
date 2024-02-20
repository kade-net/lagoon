import 'dotenv/config'
import type { Config } from 'drizzle-kit'


export default {
    driver: 'pg',
    schema: './db/schema/index.ts',
    out: './db/migrations',
    dbCredentials: {
        connectionString: ''
    }
} satisfies Config