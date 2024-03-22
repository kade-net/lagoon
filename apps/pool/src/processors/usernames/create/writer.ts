import KadeOracle, { username } from "@kade-net/oracle";
import { KADE_EVENTS } from "../../../actions";
import { username_registration_events } from "../../../db";
import { write_builder } from "../../generator";


const { main } = write_builder({
    collection: username_registration_events,
    dependancy_check: async (event, collection) => {
        return true
    },
    assert: async (event, errors) => {

        const username = event.payload.username

        const current_username = await KadeOracle.query.username.findFirst({
            where: (fields, { eq }) => eq(fields.username, username)
        })

        if (current_username) {
            return false
        }

        return true
    },
    mark_invalid: async (event, collection, errors) => {
        try {
            collection.updateOne({
                _id: event._id
            }, {
                $set: {
                    is_valid: false,
                    written: true
                }
            })
        }
        catch (e) {
            console.log(`FAILED TO MARK INVALID: ${e}`)
        }
    },
    resolve: async (event, collection) => {
        try {
            await KadeOracle.insert(username).values({
                owner_address: event.payload.owner_address,
                token_address: event.payload.token_address,
                username: event.payload.username,
                timestamp: event.timestamp
            })

            await collection.updateOne({
                _id: event._id
            }, {
                $set: {
                    written: true
                }
            })
        }
        catch (e) {
            console.log(`FAILED TO RESOLVE: ${e}`)
        }
    }
})


try {
    await main()
}
catch (e) {
    console.log(`FAILED TO WRITE USERNAME REGISTRATION EVENTS: ${e}`)
}