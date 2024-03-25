import {LevelDB} from "../../db";
import {NotificationProcessor} from "./worker";
import {FollowNotificationPlugin} from "./plugins/follow";
import {PublicationCreateNotification} from "./plugins/publications";
import {NotificationProcessMonitor} from "./monitor";
import {PostHogNotifications} from "./helpers";
import {ReactionCreateNotificationPlugin} from "./plugins/reaction";

const db = await LevelDB.init();
export const monitor = await NotificationProcessMonitor.init();
const postHogNotifier = new PostHogNotifications();

const notificationDataProcessor = new NotificationProcessor(db._db.env ,db._db.dbi, monitor, postHogNotifier);

notificationDataProcessor.addRegisterPlugin(new FollowNotificationPlugin());
notificationDataProcessor.addRegisterPlugin(new PublicationCreateNotification());
notificationDataProcessor.addRegisterPlugin(new ReactionCreateNotificationPlugin());

export default notificationDataProcessor;
