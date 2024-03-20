import 'dotenv/config';
import notificationDataProcessor from ".";
import { monitor } from ".";

try {
  console.log("Running the notification worker");
  const last_notified = await monitor.last_read.get("last_notified");
  console.log(`Last Notified is ${last_notified}`);
  const _last_notified = last_notified ? parseInt(last_notified) : 0;
  const value = Number.isNaN(_last_notified) ? 0: _last_notified;
  await notificationDataProcessor.process(value);

} catch(e) {
  console.log("Something Fishy Is Going On....And It Ain't Tilapia", e);
}
