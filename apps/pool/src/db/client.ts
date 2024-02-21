import { MongoClient } from "mongodb";


const client = new MongoClient(process.env.MONGO_CONNECTION_STRING!)

const db = client.db("lagoon")

export default db;