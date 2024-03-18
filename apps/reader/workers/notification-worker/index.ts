import {LevelDB} from "../../db";
import {NotificationProcessor} from "./worker";
import {FollowNotificationPlugin} from "./plugins/follow";
import {PublicationCreateNotification} from "./plugins/publications";
import {NotificationProcessMonitor} from "./monitor";

const db = await LevelDB.init();
export const monitor = await NotificationProcessMonitor.init();

const notificationDataProcessor = new NotificationProcessor(db._db.env ,db._db.dbi, monitor);

notificationDataProcessor.addRegisterPlugin(new FollowNotificationPlugin());
notificationDataProcessor.addRegisterPlugin(new PublicationCreateNotification());

export default notificationDataProcessor;
