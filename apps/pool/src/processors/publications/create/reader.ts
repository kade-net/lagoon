import { PUBLICATION_EVENTS } from "../../../contract/constants";
import { publication_create_events } from "../../../db";
import schema from "../../../schema";
import { read_builder } from "../../generator";


const {main} = read_builder({
    collection: publication_create_events,
    event_name: PUBLICATION_EVENTS.publication_create_events,
    schema: schema.publication_create_event_schema,
    sequence_name: "publication_create_last_sequence_number",
    type: "PUBLICATION_CREATE",
    contract: "publications"
})

try {
    await main()
}
catch (e)
{
    console.log(`FAILED TO FETCH EVENTS: ${e}`)
}