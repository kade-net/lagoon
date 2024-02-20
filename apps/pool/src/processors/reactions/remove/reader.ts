import { PUBLICATION_EVENTS } from "../../../contract/constants";
import { reaction_remove_events } from "../../../db";
import schema from "../../../schema";
import { read_builder } from "../../generator";


const { main } = read_builder({
    collection: reaction_remove_events,
    event_name: PUBLICATION_EVENTS.reaction_remove_events,
    schema: schema.reaction_remove_event_schema,
    sequence_name: 'reaction_remove_last_sequence_number',
    type: 'REACTION_REMOVE',
    contract: "publications"
})


try {
    await main()
}
catch (e)
{
    console.log("SOMETHING WENT WRONG", e)
}