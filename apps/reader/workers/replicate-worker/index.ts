import { LevelDB } from "../../db";
import { AccountCreatePlugin, AccountFollowPlugin, AccountUnFollowPlugin, DelegateCreatePlugin, DelegateRemovePlugin, ProfileUpdatePlugin } from "./plugins/accounts";
import { CommentCreateEventPlugin, CommentRemoveEventPlugin, PublicationCreateEventPlugin, PublicationRemoveEventPlugin, QuoteCreateEventPlugin, QuoteRemoveEventPlugin, ReactionCreateEventPlugin, ReactionRemoveEventPlugin, RepostCreateEventPlugin, RepostRemoveEventPlugin } from "./plugins/publications";
import { RegisterUsernamePlugin } from "./plugins/usernames";
import { DataProcessor } from "./writer";


const db = await LevelDB.init()
const dataProcessor = new DataProcessor(db._db.dbi, db._db.env)

dataProcessor.registerPlugin(new RegisterUsernamePlugin())
// ACCOUNT PLUGINS
dataProcessor.registerPlugin(new AccountCreatePlugin())
dataProcessor.registerPlugin(new DelegateCreatePlugin())
dataProcessor.registerPlugin(new DelegateRemovePlugin())
dataProcessor.registerPlugin(new AccountFollowPlugin())
dataProcessor.registerPlugin(new AccountUnFollowPlugin())
dataProcessor.registerPlugin(new ProfileUpdatePlugin())
// PUBLICATION PLUGINS
dataProcessor.registerPlugin(new PublicationCreateEventPlugin())
dataProcessor.registerPlugin(new PublicationRemoveEventPlugin())
dataProcessor.registerPlugin(new CommentCreateEventPlugin())
dataProcessor.registerPlugin(new CommentRemoveEventPlugin())
dataProcessor.registerPlugin(new RepostCreateEventPlugin())
dataProcessor.registerPlugin(new RepostRemoveEventPlugin())
dataProcessor.registerPlugin(new QuoteCreateEventPlugin())
dataProcessor.registerPlugin(new QuoteRemoveEventPlugin())
dataProcessor.registerPlugin(new ReactionCreateEventPlugin())
dataProcessor.registerPlugin(new ReactionRemoveEventPlugin())

export default dataProcessor
