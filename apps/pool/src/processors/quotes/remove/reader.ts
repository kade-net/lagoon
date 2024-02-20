import { PUBLICATION_EVENTS } from "../../../contract/constants";
import { quote_remove_events } from "../../../db";
import schema from "../../../schema";
import { read_builder } from "../../generator";


const { main } = read_builder({
    collection: quote_remove_events,
    event_name: PUBLICATION_EVENTS.quote_remove_events,
    schema: schema.quote_remove_event_schema,
    sequence_name: 'quote_remove_last_sequence_number',
    type: 'QUOTE_REMOVE',
    contract: "publications"
})


try {
    await main()
} 
catch(e){
    console.log("SOMETHING WENT WRONG", e)
}