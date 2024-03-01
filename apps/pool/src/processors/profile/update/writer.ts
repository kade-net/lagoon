import KadeOracle, { eq, profile } from "oracle";
import { profile_update_events } from "../../../db";
import { write_builder } from "../../generator";


const { main } = write_builder({
    collection: profile_update_events,
    dependancy_check: async (event, collection) => {

        let creator = await KadeOracle.query.account.findFirst({
            where: (fields, { eq }) => eq(fields.id, event.payload.user_kid)
        })

        if (!creator) {
            return false
        }

        return true


    },
    assert: async (event, errors) => {
        // TODO: dependancy check may lead to blockage
        return true
    },
    mark_invalid: async (event, collection, errors) => {
        await collection.updateOne({
            _id: event._id
        }, {
            $set: {
                is_valid: false,
                written: true
            }
        })
    },
    resolve: async (event, collection) => {
        try {
            const existingProfile = await KadeOracle.query.profile.findFirst({
                where: (fields, { eq }) => eq(fields.creator, event.payload.user_kid)
            })

            if (existingProfile) {
                await KadeOracle.update(profile).set({
                    bio: event.payload.bio,
                    display_name: event.payload.display_name,
                    pfp: event.payload.pfp
                }).where(eq(profile.creator, event.payload.user_kid))
            } else {
                await KadeOracle.insert(profile).values({
                    creator: event.payload.user_kid,
                    bio: event.payload.bio,
                    display_name: event.payload.display_name,
                    pfp: event.payload.pfp,
                })
            }


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
    console.log(`FAILED TO WRITE PROFILE UPDATE EVENTS: ${e}`)
}