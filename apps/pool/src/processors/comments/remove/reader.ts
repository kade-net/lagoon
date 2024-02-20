import { PUBLICATIONS_CONTRACT, PUBLICATION_EVENTS } from "../../../contract/constants";
import { comment_remove_events } from "../../../db";
import schema from "../../../schema";
import { read_builder } from "../../generator";


const { main } = read_builder({
    collection: comment_remove_events,
    contract: "publications",
    event_name: PUBLICATION_EVENTS.comment_remove_events,
    schema: schema.comment_remove_event_schema,
    sequence_name: "comment_remove_last_sequence_number",
    type: "COMMENT_REMOVE"
})

try {
    await main()
}
catch (e)
{
    console.log(`FAILED TO FETCH EVENTS: ${e}`)
}