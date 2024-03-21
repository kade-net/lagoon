import KadeOracle, { comment } from "@kade-net/oracle";
import { KADE_EVENTS } from "../../../actions";
import { comment_create_events } from "../../../db";
import { write_builder } from "../../generator";
import dayjs from "dayjs";


const { main  } = write_builder<KADE_EVENTS.EVENT<KADE_EVENTS.COMMENT_CREATE_EVENT>>({
    collection: comment_create_events,
    dependancy_check: async (event, collection) => {
        const kid = event.payload.kid
        const user_kid = event.payload.user_kid
        const  type = event.payload.type

        const creator = await KadeOracle.query.account.findFirst({
            where: (fields, {eq}) => eq(fields.id, user_kid)
        })

        if(!creator) {
            return false
        }

        if(type == 1) {
            const publication = await KadeOracle.query.publication.findFirst({
                where: (fields, {eq}) => eq(fields.id, kid)
            })

            if(!publication) {
                return false
            }
        }

        if(type == 2){
            const quote = await KadeOracle.query.quote.findFirst({
                where: (fields, {eq}) => eq(fields.id, kid)
            })

            if(!quote) {
                return false
            }
        }

        if(type == 3){
            const comment = await KadeOracle.query.comment.findFirst({
                where: (fields, {eq}) => eq(fields.id, kid)
            })

            if(!comment) {
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
            const publication = await KadeOracle.query.publication.findFirst({
                where: (fields, {eq}) => eq(fields.id, reference_kid)
            })

            if(!publication) {
                errors.invalidation_reason = "PUBLICATION DOESN'T EXIST"
                return false
            }

            
        }

        if(type == 2){
            const quote = await KadeOracle.query.quote.findFirst({
                where: (fields, {eq}) => eq(fields.id, reference_kid)
            })

            if(!quote) {
                errors.invalidation_reason = "QUOTE DOESN'T EXIST"
                return false
            }
        }

        if(type == 3){
            const comment = await KadeOracle.query.comment.findFirst({
                where: (fields, {eq}) => eq(fields.id, reference_kid)
            })

            if(!comment) {
                errors.invalidation_reason = "COMMENT DOESN'T EXIST"
                return false
            }
        }

        return true
    },
    mark_invalid: async (event, collection, errors) => {
        if(errors.invalidation_reason && ["PUBLICATION DOESN'T EXIST", "COMMENT DOESN'T EXIST", "QUOTE DOESN'T EXIST"].includes(errors.invalidation_reason)){
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

                return
            }else
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
    resolve:async (event, collection ) => {
        await KadeOracle.insert(comment).values({
            id: event.payload.kid,
            content: JSON.parse(event.payload.content),
            creator_id: event.payload.user_kid,
            comment_id: event.payload.reference_kid ?? null,
            publication_id: event.payload.reference_kid ?? null,
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
    console.log(`SOMETHING WENT WRONG: ${e}`)
}