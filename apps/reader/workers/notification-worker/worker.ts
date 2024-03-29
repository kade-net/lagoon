import lmdb from "node-lmdb";
import {sleep} from "../replicate-worker/helpers";
import _ from "lodash";
const { isNull} = _;
import {capture_event} from "posthog";
import {PostHogAppID, PosthogEvents} from "../../posthog/events";
import {NotificationProcessMonitor} from "./monitor";
import {NotificationProcessorPlugin, PostHogNotifications} from "./helpers";

export class NotificationProcessor {
  // Store environment
  private env: lmdb.Env;
  private dbi: lmdb.Dbi;
  private registeredPlugins: NotificationProcessorPlugin[] = [];
  private monitor: NotificationProcessMonitor
  private postHogNotifier: PostHogNotifications
  
  constructor(env: lmdb.Env, dbi: lmdb.Dbi, monitor: NotificationProcessMonitor, postHogNotifier: PostHogNotifications) {
    this.env = env;
    this.dbi = dbi;
    this.monitor = monitor
    this.postHogNotifier = postHogNotifier;
  }

  addRegisterPlugin(plugin: NotificationProcessorPlugin) {
    this.registeredPlugins.push(plugin);
  }


  async process(_last_read?: number) {
    console.log("Processing some notifications");

    let last_read = "000000000";

    // Processing the last read key
    if (_last_read) {
      const s = `000000000${_last_read}`;
      last_read = s.substring(s.length - 9);
    }

    // Creating cursor to read store with
    const txn = this.env.beginTxn({
      readOnly: true
    })
    const cursor = new lmdb.Cursor(txn, this.dbi)

    const atRange = last_read === "000000000" ? {} : cursor.goToRange(last_read);

    // Seeing if there is anything
    if (!atRange) {
      console.log("Nothing To Read");
      cursor.close();
      txn.commit();
      await sleep(60_000);
      await this.process(parseInt(last_read));
      return;
    }

    let key, value: Buffer | null;
    while((key = cursor.goToNext()) != null) {
      // Gets data at key
      value = cursor.getCurrentBinary();
      
      if(value && !isNull(value)) {
        const data = JSON.parse(value.toString());
        const event_type = data.type;
        const event_data = JSON.parse(data.event);
        const signature = data.signature;

        console.log("Data Gotten is", data);
        console.log("Event type is", event_type);
        const chosenPlugin = this.registeredPlugins.find(p => p.name() === event_type)

        if (chosenPlugin) {
          try {
            console.log("A plugin has been chosen");
            await chosenPlugin.process(event_data, this.monitor, key, signature, this.postHogNotifier);
          } catch(e) {
            capture_event(PostHogAppID, PosthogEvents.FAILED, {error: e});
          }
      }

      last_read = key;
  
    }
    
  }

  cursor.close();
  txn.commit();
  await this.monitor.updateLastNotified(last_read);
  await sleep(60_000);
  await this.process(parseInt(last_read));
  }
}
