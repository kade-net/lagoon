import { PUBLICATION_EVENTS } from "../../../contract/constants";
import { quote_create_events } from "../../../db";
import schema from "../../../schema";
import { read_builder } from "../../generator";



const { main } = read_builder({
    collection: quote_create_events,
    event_name: PUBLICATION_EVENTS.quote_create_events,
    schema: schema.quote_create_event_schema,
    sequence_name: 'quote_create_last_sequence_number',
    type: 'QUOTE_CREATE',
    contract: 'publications'
})


try {
    await main()
}   
catch (e)
{
    console.log("SOMETHING WENT WRONG", e)
}