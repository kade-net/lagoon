import { LevelDB } from "../db";
import { AccountCreatePlugin, AccountFollowPlugin, AccountUnFollowPlugin, ProfileUpdatePlugin } from "./plugins/accounts";
import { RegisterUsernamePlugin } from "./plugins/usernames";
import { DataProcessor } from "./processor";


const db = await LevelDB.init()

const dataProcessor = new DataProcessor(db._db.dbi, db._db.env)

dataProcessor.registerPlugin(new AccountCreatePlugin())
dataProcessor.registerPlugin(new AccountFollowPlugin())
dataProcessor.registerPlugin(new AccountUnFollowPlugin())
dataProcessor.registerPlugin(new ProfileUpdatePlugin())

// USERNAMES
dataProcessor.registerPlugin(new RegisterUsernamePlugin())

export default dataProcessor
