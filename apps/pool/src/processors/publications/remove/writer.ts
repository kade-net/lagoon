import KadeOracle, { eq, publication } from "oracle";
import { write_builder } from "../../generator";
import { publication_remove_events } from "../../../db";
import { KADE_EVENTS } from "../../../actions";
import _ from "lodash"
const { isNumber } = _


const {main} = write_builder<KADE_EVENTS.EVENT<KADE_EVENTS.PUBLICATION_REMOVE_EVENT>>({
    collection: publication_remove_events,
    dependancy_check: async (event, collection) => {
        const kid = event.payload.kid as unknown as number

        const publication = await KadeOracle.query.publication.findFirst({
            where: (fields) => eq(fields.id, kid)
        })

        if(!publication){
            return false
        }

        return true
    },
    assert: async (event, errors) => {
        const kid = event.payload.kid as unknown as number

        if(!isNumber(kid)){
            errors.invalidation_reason = "MISSING KID"
            return false
        }

        const existingPublication = await KadeOracle.query.publication.findFirst({
            where: (fields) => eq(fields.id, kid)
        })

        if(!existingPublication){
            errors.invalidation_reason = "PUBLICATION DOESN'T EXIST"
            return false
        }

        return true
    },
    mark_invalid: async (event, collection, errors) =>{
        await collection.updateOne({
            _id: event._id
        }, {
            $set: {
                is_valid: false,
                written: true
            }
        })
    },
    resolve: async ( event, collection) => {
        
        const kid = event.payload.kid as unknown as number

        await KadeOracle.delete(publication).where(eq(publication.id, kid))

        await collection.updateOne({
            _id: event._id
        }, {
            $set: {
                written: true
            }
        
        })

    },
})


try {
    await main()
}
catch (e) {
    console.log(`SOMETHING WENT WRONG: ${e}`)
}
