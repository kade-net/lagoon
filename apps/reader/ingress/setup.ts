import { LevelDB } from "../db";
import { AccountCreatePlugin, AccountFollowPlugin, AccountUnFollowPlugin, ProfileUpdatePlugin } from "./plugins/accounts";
import { PublicationCreateEventPlugin, PublicationCreateWithRef, PublicationRemoveEventPlugin, PublicationRemoveWithRef, ReactionCreateEventPlugin, ReactionCreateEventWithRefPlugin, ReactionRemoveEventPlugin, ReactionRemoveEventWithRefPlugin } from "./plugins/publications";
import { RegisterUsernamePlugin } from "./plugins/usernames";
import { DataProcessor } from "./processor";


const db = await LevelDB.init()

const dataProcessor = new DataProcessor(db._db.dbi, db._db.env)
// Accounts
dataProcessor.registerPlugin(new AccountCreatePlugin())
dataProcessor.registerPlugin(new AccountFollowPlugin())
dataProcessor.registerPlugin(new AccountUnFollowPlugin())
dataProcessor.registerPlugin(new ProfileUpdatePlugin())

// USERNAMES
dataProcessor.registerPlugin(new RegisterUsernamePlugin())

// PUBLICATIONS AND REACTIONS
dataProcessor.registerPlugin(new PublicationCreateEventPlugin())
dataProcessor.registerPlugin(new PublicationCreateWithRef())
dataProcessor.registerPlugin(new PublicationRemoveEventPlugin())
dataProcessor.registerPlugin(new PublicationRemoveWithRef())
dataProcessor.registerPlugin(new ReactionCreateEventPlugin())
dataProcessor.registerPlugin(new ReactionCreateEventWithRefPlugin())
dataProcessor.registerPlugin(new ReactionRemoveEventPlugin())
dataProcessor.registerPlugin(new ReactionRemoveEventWithRefPlugin())

export default dataProcessor
