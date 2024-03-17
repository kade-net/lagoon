import { LevelDB } from "../../db";
import { ProcessMonitor } from "./monitor";
import { AccountCreatePlugin, AccountFollowPlugin, AccountUnFollowPlugin, DelegateCreatePlugin, DelegateRemovePlugin, ProfileUpdatePlugin } from "./plugins/accounts";
import { CommunityRegisteredEventPlugin, CommunityUpdateEventPlugin, MemberJoinEventPlugin, MembershipChangeEventPlugin, MembershipDeleteEventPlugin, MembershipReclaimEventPlugin } from "./plugins/communities";
import { PublicationCreateEventPlugin, PublicationCreateWithRefEventPlugin, PublicationRemoveEventPlugin, PublicationRemoveWithRefEventPlugin, ReactionCreateEventPlugin, ReactionCreateEventWithRefPlugin, ReactionRemoveEventPlugin, ReactionRemoveEventWithRefPlugin } from "./plugins/publications";
import { RegisterUsernamePlugin } from "./plugins/usernames";
import { DataProcessor } from "./writer";


const db = await LevelDB.init()
export const monitor = await ProcessMonitor.init()
const dataProcessor = new DataProcessor(db._db.dbi, db._db.env, monitor)

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
dataProcessor.registerPlugin(new PublicationCreateWithRefEventPlugin())
dataProcessor.registerPlugin(new PublicationRemoveWithRefEventPlugin())
dataProcessor.registerPlugin(new ReactionCreateEventWithRefPlugin())
dataProcessor.registerPlugin(new ReactionRemoveEventWithRefPlugin())
dataProcessor.registerPlugin(new ReactionCreateEventPlugin())
dataProcessor.registerPlugin(new ReactionRemoveEventPlugin())
// COMMUNITY PLUGINS
dataProcessor.registerPlugin(new CommunityRegisteredEventPlugin())
dataProcessor.registerPlugin(new MemberJoinEventPlugin())
dataProcessor.registerPlugin(new MembershipChangeEventPlugin())
dataProcessor.registerPlugin(new MembershipDeleteEventPlugin())
dataProcessor.registerPlugin(new MembershipReclaimEventPlugin())
dataProcessor.registerPlugin(new CommunityUpdateEventPlugin())

export default dataProcessor
