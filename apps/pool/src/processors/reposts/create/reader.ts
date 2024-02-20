import { PUBLICATION_EVENTS } from "../../../contract/constants";
import { repost_create_events } from "../../../db";
import schema from "../../../schema";
import { read_builder } from "../../generator";


const { main } = read_builder({
    collection: repost_create_events,
    event_name: PUBLICATION_EVENTS.repost_create_events,
    contract: "publications",
    schema: schema.repost_create_event_schema,
    sequence_name: "repost_create_last_sequence_number",
    type: "REPOST_CREATE"
})


try {
    await main()
}
catch (e)
{
    console.log("Something went wrong ::", e)
}