import { PUBLICATION_EVENTS } from "../../../contract/constants";
import { publication_remove_events } from "../../../db";
import schema from "../../../schema";
import { read_builder } from "../../generator";


const {main} = read_builder({
    collection: publication_remove_events,
    event_name: PUBLICATION_EVENTS.publication_remove_events,
    schema: schema.publication_remove_event_schema,
    sequence_name: "publication_remove_last_sequence_number",
    type: "PUBLICATION_REMOVE",
    contract: 'publications'
})


try {
    await main()
}
catch (e)
{
    console.log(`FAILED TO FETCH EVENTS: ${e}`)
}