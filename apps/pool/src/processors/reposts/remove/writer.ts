import _ from "lodash";
const { isNumber } = _
import { repost_remove_events } from "../../../db";
import { write_builder } from "../../generator";
import KadeOracle, { and, eq, repost } from "@kade-net/oracle";




const { main } = write_builder({
    collection: repost_remove_events,
    dependancy_check: async (event, collection) => {
        const kid = event.payload.kid
        const user_kid = event.payload.user_kid

        const repost = await KadeOracle.query.repost.findFirst({
            where: fields => and(eq(fields.id, kid), eq(fields.creator_id, user_kid))
        })

        if(!repost){
            return false
        }

        return true
    },
    assert: async (event, errors) => {
        const kid = event.payload.kid
        const user_kid = event.payload.user_kid

        const repost = await KadeOracle.query.repost.findFirst({
            where: fields => and(eq(fields.id, kid), eq(fields.creator_id, user_kid))
        })

        if(!repost){
            errors.invalidation_reason = "REPOST DOES NOT EXIST"
            return false
        }


        return true

    },
    mark_invalid: async (event, collection, errors)=> {
        await collection.updateOne({
            _id: event._id
        }, {
            $set: {
                is_valid: false
            }
        })
    },
    resolve: async (event, collection) => {
        await KadeOracle.delete(repost).where(eq(repost.id, event.payload.kid as unknown as number))
        await collection.updateOne({
            _id: event._id
        }, {
            $set: {
                written: true
            }
        })
    }
})


try {
    await main()
}
catch (e)
{
    console.log(`SOETHING WENT WRONG: ${e}`)
}