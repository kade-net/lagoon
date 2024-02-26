import { username_registration_events } from "../../../db";
import schema from "../../../schema";
import { read_builder } from "../../generator";


const { main } = read_builder({
    collection: username_registration_events,
    contract: "usernames",
    event_name: "registration_events",
    schema: schema.username_registration_event_schema,
    sequence_name: "username_registration_last_sequence_number",
    type: "USERNAME_REGISTREATION"
})

try {
    await main()
}
catch (e) {
    console.log(`FAILED TO READ USERNAME REGISTRATION EVENTS: ${e}`)
}