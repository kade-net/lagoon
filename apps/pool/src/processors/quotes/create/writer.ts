import KadeOracle, { and, eq, quote } from "oracle";
import { quote_create_events } from "../../../db";
import { write_builder } from "../../generator";
import dayjs from "dayjs";
import _ from 'lodash'
const { isNumber } = _



const { main } = write_builder({
    collection: quote_create_events,
    dependancy_check: async (event, collection) => {
        const publication_kid = event.payload.reference_kid
        const quote_kid = event.payload.kid
        const user_kid = event.payload.user_kid

        const creator = await KadeOracle.query.account.findFirst({
            where: fields => eq(fields.id, user_kid)
        })

        if(!creator) {
            return false
        }

        const publication = await KadeOracle.query.publication.findFirst({
            where: fields => eq(fields.id, publication_kid)
        })

        if(!publication) {
            return false
        }

        const quote = await KadeOracle.query.quote.findFirst({
            where: fields => and(eq(fields.id, quote_kid), eq(fields.creator_id, user_kid))
        })

        if(quote) {
            return false
        }

        return true
    },
    assert: async (event, errors)=>{
        const publication_kid = event.payload.reference_kid 
        const quote_kid = event.payload.kid 
        const user_kid = event.payload.user_kid

        try {
            const publication = await KadeOracle.query.publication.findFirst({
                where: fields => eq(fields.id, publication_kid)
            }) 

            if(!publication) {
                errors.invalidation_reason = "PUBLICATION DOES NOT EXIST"
                return false
            }
            const quote = await KadeOracle.query.quote.findFirst({
                where: fields => and(eq(fields.id, quote_kid), eq(fields.creator_id, user_kid))
            })

            if(quote) {
                errors.invalidation_reason = "QUOTE ALREADY EXISTS"
                return false
            }

            return true
        }
        catch (e)
        {
            console.log("SOMETHING WENT WRONG ", e)
            return false
        }
    },
    mark_invalid: async (event, collection, errors)=> {
        
        if(errors.invalidation_reason == 'PUBLICATION DOES NOT EXIST'){
            const diff = dayjs().diff(dayjs(event.first_seen), 'day')

            if(diff > 1) {

                await collection.updateOne({
                    _id: event._id
                }, {
                    $set: {
                        is_valid: false
                    }
                })

            }
            else 
            {
                return
            }
        }

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
        const publication_kid = event.payload.reference_kid
        const user_kid = event.payload.user_kid 
        const quote_kid = event.payload.kid 


        try {
            await KadeOracle.insert(quote).values({
                content: JSON.parse(event.payload.payload),
                creator_id: user_kid,
                id: quote_kid,
                publication_id: publication_kid,
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
        catch (e)
        {
             console.log("SOMETHING WENT WRONG",e)
        }

    }
})


try {
    await main()
}
catch (e)
{
    console.log("Something went wrong ::", e)
}