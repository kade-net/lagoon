import {LevelDB} from "../../../db";
import {ProcessMonitor} from "../../replicate-worker/monitor";
import {NotificationProcessor} from "../worker";
import {FollowNotificationPlugin} from "./follow";
import {PublicationCreateNotification} from "./publications";

const db = await LevelDB.init();
export const monitor = await ProcessMonitor.init();

const notificationDataProcessor = new NotificationProcessor(db._db.env ,db._db.dbi, monitor);

notificationDataProcessor.addRegisterPlugin(new FollowNotificationPlugin());
notificationDataProcessor.addRegisterPlugin(new PublicationCreateNotification());

export default NotificationProcessor;
