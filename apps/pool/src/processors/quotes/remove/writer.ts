import KadeOracle, { and, eq, quote } from "oracle";
import { quote_remove_events } from "../../../db";
import schema from "../../../schema";
import { read_builder, write_builder } from "../../generator";
import { KADE_EVENTS } from "../../../actions";


const {main} = write_builder<KADE_EVENTS.EVENT<KADE_EVENTS.QUOTE_REMOVE_EVENT>>({
    collection: quote_remove_events,
    dependancy_check: async (event, collection) => {
        const kid = event.payload.kid 
        const user_kid = event.payload.user_kid 

        const quote = await KadeOracle.query.quote.findFirst({
            where: fields => and(eq(fields.id, kid), eq(fields.creator_id, user_kid))
        })

        if (!quote) {
            return false
        }

        return true
    },
    assert: async (event, errors) => {
        const kid = event.payload.kid 
        const user_kid = event.payload.user_kid 

       

        const quote = await KadeOracle.query.quote.findFirst({
            where: fields => and(eq(fields.id, kid), eq(fields.creator_id, user_kid))
        })

        if (!quote) {
            errors.invalidation_reason = "QUOTE DOES NOT EXIST"
            return false
        }

        return true
    },
    mark_invalid: async (event, collection, errors) => {

        try {
            await collection.updateOne({
                _id: event._id
            }, {
                $set: {
                    is_valid: false
                }
            })
        } catch (e) {
            console.log("FAILED TO MARK EVENT AS INVALID", e)
        }


    },
    resolve: async (event, collection) => {
        const kid = event.payload.kid 
        const user_kid = event.payload.user_kid 

        try {
            await KadeOracle.delete(quote).where(and(eq(quote.id, kid), eq(quote.creator_id, user_kid)))

            await collection.updateOne({
                _id: event._id
            }, {
                $set: {
                    written: true
                }
            })
        }
        catch (e){
            console.log("FAILED TO REMOVE QUOTE", e)
        }
    }
})

try {
    await main()
}
catch (e) {
    console.log("SOMETHING WENT WRONG", e)
}