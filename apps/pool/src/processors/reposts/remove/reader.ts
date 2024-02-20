import { PUBLICATION_EVENTS } from "../../../contract/constants";
import { repost_remove_events } from "../../../db";
import schema from "../../../schema";
import { read_builder } from "../../generator";


const { main } = read_builder({
    collection: repost_remove_events,
    contract: "publications",
    event_name: PUBLICATION_EVENTS.repost_remove_events,
    schema: schema.repost_remove_event_schema,
    sequence_name: "repost_remove_last_sequence_number",
    type: "REPOST_REMOVE"
})

try {
    await main()
}
catch (e)
{
    console.log(`SOETHING WENT WRONG: ${e}`)
}