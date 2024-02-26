import { ACCOUNT_EVENTS } from "../../../contract/constants";
import { profile_update_events } from "../../../db";
import schema from "../../../schema";
import { read_builder } from "../../generator";


const { main } = read_builder({
    collection: profile_update_events,
    contract: "accounts",
    event_name: ACCOUNT_EVENTS.profile_update_events,
    schema: schema.profile_update_event_schema,
    sequence_name: "profile_update_last_sequence_number",
    type: "PROFILE_UPDATE"
})


try {
    await main()
}
catch (e) {
    console.log(`FAILED TO READ PROFILE UPDATE EVENTS: ${e}`)
}