import KadeOracle, { and, comment, eq } from "oracle";
import { KADE_EVENTS } from "../../../actions";
import { write_builder } from "../../generator";
import { comment_remove_events } from "../../../db";
import dayjs from "dayjs";


const { main } = write_builder<KADE_EVENTS.EVENT<KADE_EVENTS.COMMENT_REMOVE_EVENT>>({
    collection: comment_remove_events,
    dependancy_check: async (event, collection) => {
        const kid = event.payload.kid
        const user_kid = event.payload.user_kid

        const comment = await KadeOracle.query.comment.findFirst({
            where: (fields, {eq, and}) => and(eq(fields.id, kid), eq(fields.creator_id, user_kid))
        })

        if(!comment) {
            return false
        }
        return true
    },
    assert: async (event, errors) => {
        const kid = event.payload.kid
        const user_kid = event.payload.user_kid
        const comment = await KadeOracle.query.comment.findFirst({
            where: (fields, {eq}) => eq(fields.id, kid)
        })

        if(!comment) {
            errors.invalidation_reason = "COMMENT DOESN'T EXIST"
            return false
        }

        return true
    },
    mark_invalid: async (event, collection, errors) => {
        if(errors.invalidation_reason && errors.invalidation_reason == "COMMENT DOESN'T EXIST"){
            const diff = dayjs(event.first_seen).diff(dayjs(), 'day')

            if(diff > 1){
                await collection.updateOne({
                    _id: event._id
                }, {
                    $set: {
                        is_valid: false,
                        written: true
                    }
                })
            }
            else
            {
                return
            }
        }
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
        await KadeOracle.delete(comment).where(and(eq(comment.id, event.payload.kid), eq(comment.creator_id, event.payload.user_kid)))

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
    console.log(`SOMETHING WENT WRONG: ${e}`)
}