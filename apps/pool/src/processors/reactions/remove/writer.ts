import KadeOracle, { and, eq, reaction } from "@kade-net/oracle";
import { reaction_remove_events } from "../../../db";
import { write_builder } from "../../generator";
import { KADE_EVENTS } from "../../../actions";



const { main } = write_builder<KADE_EVENTS.EVENT<KADE_EVENTS.REACTION_REMOVE_EVENT>>({
    collection: reaction_remove_events,
    dependancy_check: async (event, collection) => {
        const kid = event.payload.kid
        const user_kid = event.payload.user_kid

        const reaction = await KadeOracle.query.reaction.findFirst({
            where: fields => and(eq(fields.id, kid), eq(fields.creator_id, user_kid))
        })

        if(!reaction) {
            return false
        }

        return true
    },
    assert: async (event, errors)=>{
        const kid = event.payload.kid
        const user_kid = event.payload.user_kid 

        try {
            const reaction = await KadeOracle.query.reaction.findFirst({
                where: fields => and(eq(fields.id, kid), eq(fields.creator_id, user_kid))
            })

            if(!reaction) {
                errors.invalidation_reason = "REACTION DOES NOT EXIST"
                return false
            }

            return true
        }
        catch (e) {
            console.log("Something went wrong", e)

            return false
        }
    },
    mark_invalid: async (event, collection, errors)=> {
        
      try {
        await collection.updateOne({
            _id: event._id
            }, {
            $set: {
                is_valid: false
            }
            
        })
      }
      catch (e)
      {
            console.log("FAILED TO MARK EVENT AS INVALID", e)
      }
    }, 
    resolve: async (event, collection) => {
        const kid = event.payload.kid
        const user_kid = event.payload.user_kid 

        try {
            await KadeOracle.delete(reaction).where(and(eq(reaction.id, kid), eq(reaction.creator_id, user_kid)))
            await collection.updateOne({
                _id: event._id
            }, {
                $set: {
                    written: true
                }
            })
        }
        catch (e)
        {
            console.log("Something went wrong", e)
        }
    },
})


try {
    await main()
}
catch (e)
{
    console.log("SOMETHING WENT WRONG", e)
}