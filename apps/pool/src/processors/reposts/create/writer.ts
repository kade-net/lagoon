import _ from 'lodash'
const { isNumber } = _
import { repost_create_events } from "../../../db";
import { write_builder } from "../../generator";
import KadeOracle, { eq, repost } from "oracle";
import dayjs from "dayjs";


const { main } = write_builder({
    collection: repost_create_events,
    dependancy_check: async (event, collection) => {
        const user_kid = event.payload.user_kid
        const reference_kid = event.payload.reference_kid

        const creator = await KadeOracle.query.account.findFirst({
            where: fields => eq(fields.id, user_kid)
        })

        if(!creator) {
            return false
        }

        const publication = await KadeOracle.query.publication.findFirst({
            where: fields => eq(fields.id, reference_kid)
        })

        if(!publication) {
            return false
        }

        return true
    },
    assert: async (events, errors) => {
        const reference_kid = events.payload.reference_kid 

        const existingPublication = await KadeOracle.query.publication.findFirst({
            where: fields => eq(fields.id, reference_kid)
        })

        if(!existingPublication) {
            const diff = dayjs().diff(dayjs(events.first_seen), 'day') 

            if(diff > 1) {
                errors.invalidation_reason = "PUBLICATION DOES NOT EXIST"
                return false
            }

            else 
            {
                errors.invalidation_reason = "PUBLICATION MAY EXIST"
                return false
            }
        }

        return true


    },
    mark_invalid: async (event, collection, errors) => {
        try {
            if(!(errors.invalidation_reason == 'PUBLICATION MAY EXIST')) {
                collection.updateOne({
                    _id: event._id
                }, {
                    $set: {
                        is_valid: false
                    }
                
                })
            }
        }
        catch (e)
        {
            console.log(`FAILED TO MARK EVENT AS INVALID: ${e}`)
        }
    },
    resolve: async (event, collection) => {
        try {
            const resp = await KadeOracle.insert(repost).values({
                id: event.payload.kid as unknown as number,
                creator_id: event.payload.user_kid as unknown as number,
                publication_id: event.payload.reference_kid as unknown as number,
                timestamp: event.timestamp
            })

            console.log(`REPOST CREATED: ${resp}`)

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
            console.log(`FAILED TO WRITE EVENT: ${e}`)
        }
    }
})


try {
    await main()
}
catch (e)
{
    console.log(`FAILED TO FETCH EVENTS: ${e}`)
}