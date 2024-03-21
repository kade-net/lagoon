import KadeOracle, { eq, reaction } from "@kade-net/oracle";
import { reaction_create_events } from "../../../db";
import { write_builder } from "../../generator";
import dayjs from "dayjs";
import { KADE_EVENTS } from "../../../actions";


const {main} = write_builder<KADE_EVENTS.EVENT<KADE_EVENTS.REACTION_CREATE_EVENT>>({ 
    collection: reaction_create_events,
    dependancy_check: async (event, collection ) => {

        const user_kid = event.payload.user_kid
        const reference_kid = event.payload.reference_kid 
        const type = event.payload.type

        const user = await KadeOracle.query.account.findFirst({
            where: (fields) => eq(fields.id, user_kid)
        })

        if(!user){
            return false
        }

        if(type == 1) {
            let publication = await KadeOracle.query.publication.findFirst({
                where: (fields) => eq(fields.id, reference_kid)
            })

            if(!publication){
                return false
            }
        }
        else if(type == 2){
            let comment = await KadeOracle.query.comment.findFirst({
                where: (fields) => eq(fields.id, reference_kid)
            })

            if(!comment){
                return false
            }
        }
        else if(type == 3){
            let quote = await KadeOracle.query.quote.findFirst({
                where: (fields) => eq(fields.id, reference_kid)
            })

            if(!quote){
                return false
            }
        }
        

        return true
    },
    assert: async (event, errors) => {
        const kid = event.payload.kid
        const user_kid = event.payload.user_kid 
        const reference_kid = event.payload.reference_kid 
        const type = event.payload.type 

        if(type == 1) {
            let publication = await KadeOracle.query.publication.findFirst({
                where: (fields) => eq(fields.id, reference_kid)
            })

            if(!publication){
                errors.invalidation_reason = "PUBLICATION DOESN'T EXIST"
                return false
            }
        }
        else if(type == 3){
            let comment = await KadeOracle.query.comment.findFirst({
                where: (fields) => eq(fields.id, reference_kid)
            })

            if(!comment){
                errors.invalidation_reason = "COMMENT DOESN'T EXIST"
                return false
            }
        }
        else if(type == 2){
            let quote = await KadeOracle.query.quote.findFirst({
                where: (fields) => eq(fields.id, reference_kid)
            })

            if(!quote){
                errors.invalidation_reason = "QUOTE DOESN'T EXIST"
                return false
            }
        }
        else {
            errors.invalidation_reason = "INVALID TYPE"
            return false
        }

        return true

        
    }, 
    mark_invalid: async (event, collection, errors )=> {
            if([
                "PUBLICATION DOESN'T EXIST",
                "COMMENT DOESN'T EXIST",
                "QUOTE DOESN'T EXIST",
            ].includes(errors.invalidation_reason ?? ""))
            {
                const diff = dayjs().diff(dayjs(event.payload.timestamp), "day")
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
                return
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
        const kid = event.payload.kid 
        const user_kid = event.payload.user_kid 
        const reference_kid = event.payload.reference_kid 
        const type = event.payload.type 

        await KadeOracle.insert(reaction).values({
            creator_id: user_kid,
            id: kid,
            reaction: event.payload.reaction as unknown as number,
            ...(type == 1 ? {
                publication_id: reference_kid
            } : type == 2 ? {
                comment_id: reference_kid
            } : {
                quote_id: reference_kid
            }),
            timestamp: event.payload.timestamp
        })

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
    console.log("SOMETHING WENT WRONG::", e)
}