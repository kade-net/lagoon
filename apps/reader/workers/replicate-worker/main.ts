import 'dotenv/config'
import dataProcessor, { monitor } from "."


try {
    const last_read = await monitor.last_read.get("last_read")
    const _last_read = last_read ? parseInt(last_read) : 0
    const value = Number.isNaN(_last_read) ? 0 : _last_read
    console.log("Last read::", value)
    await dataProcessor.process(value)
    // TODO: add a prune worker to remove old data
}
catch (e) {
    console.log("Something went wrong while processing data:", e)
}