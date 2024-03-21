import KadeOracle, { eq, publication } from "@kade-net/oracle";
import { publication_create_events } from "../../../db";
import { write_builder } from "../../generator";
import dayjs from "dayjs";
import { KADE_EVENTS } from "../../../actions";
import _ from "lodash"
const { isNumber } = _


const {main} = write_builder<KADE_EVENTS.EVENT<KADE_EVENTS.PUBLICATION_CREATE_EVENT>>({
    collection: publication_create_events,
    dependancy_check: async (event, collection) => {
        const user_kid = event.payload.user_kid as unknown as number
        const user = await KadeOracle.query.account.findFirst({
            where: (fields) => eq(fields.id, user_kid)
        })

        if(!user){
            return false
        }

        return true
    },
    assert: async (event, errors) => {
        const kid = event.payload.kid as unknown as number
        const user_kid = event.payload.user_kid as unknown as number

        if(!isNumber(kid) || !isNumber(user_kid)){
            errors.invalidation_reason = "MISSING KID OR USER_KID"
            return false
        }

        const existingPublication = await KadeOracle.query.publication.findFirst({
            where: (fields) => eq(fields.id, kid)
        })

        if(existingPublication){
            errors.invalidation_reason = "PUBLICATION ALREADY EXISTS"
            return false
        }

        const user = await KadeOracle.query.account.findFirst({
            where: (fields) => eq(fields.id, user_kid)
        })

        if(!user){
            errors.invalidation_reason = "USER DOESN'T EXIST"
            return false
        }

       return true
    },
    mark_invalid: async (event, collection, errors) =>{
        // TODO: add a flag to check what caused the event to be invalid
        if(errors.invalidation_reason == "USER DOESN'T EXIST"){
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
        const kid = event.payload.kid as unknown as number
        const user_kid = event.payload.user_kid as unknown as number

        await KadeOracle.insert(publication).values({
            id: kid,
            creator_id: user_kid,
            content: JSON.parse(event.payload.payload),
            timestamp: event.payload.timestamp
        })

        console.log(`PUBLICATION CREATED: ${kid}`)


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
    console.log(`FAILED TO FETCH EVENTS: ${e}`)
}