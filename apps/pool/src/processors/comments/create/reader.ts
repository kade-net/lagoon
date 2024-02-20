import { comment_create_events } from "../../../db";
import schema from "../../../schema";
import { read_builder } from "../../generator";


const { main } = read_builder({
    collection: comment_create_events,
    event_name: "comment_create_events",
    contract: "publications",
    schema: schema.comment_create_event_schema,
    sequence_name: "comment_create_last_sequence_number",
    type: "COMMENT_CREATE"
})

try {
    await main()
}
catch (e)
{
    console.log(`FAILED TO FETCH EVENTS: ${e}`)
}