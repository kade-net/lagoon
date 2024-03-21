import KadeOracle, { account, eq } from "@kade-net/oracle"
import { account_events } from "../../../db"
import { WithId } from "mongodb"
import { KADE_EVENTS } from "../../../actions"
import _ from "lodash"
import { sleep } from "../../../utils"

const { isNumber } = _


const getEvents = async () => {
    const storedEvents = await account_events.find({
        written: false,
        is_valid: true
    }).limit(10).sort({timestamp: -1}).toArray() // TODO: add sorting by timestamp

    return storedEvents
}


async function main(){

    let events: Array<WithId<KADE_EVENTS.EVENT<KADE_EVENTS.ACCOUNT_CREATE_EVENT>>> = []

    try {
        const fetched = await getEvents()
        for (const fetch of fetched){
            events.push(fetch)
        }
    }
    catch (e)
    {
        console.log(`FAILED TO FETCH EVENTS: ${e}`)
    }

    for (const event of events){
        try {
            // asset account doesn't already exist
            let kid = event.payload.kid
            const _kid = isNumber(kid) ? kid :parseInt(kid) as number

            const existingAccount = await KadeOracle.query.account.findFirst({
                where: (fields) => eq(fields.id, _kid)
            })

            if (existingAccount){
                console.log(`ACCOUNT ALREADY EXISTS: ${existingAccount.id}`)
                
                try {
                    // mark event as invalid and written
                    await account_events.updateOne({
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

                continue // skip to the next event
            }

            // create account

            await KadeOracle.insert(account).values({
                id: _kid,
                bio: '', // TODO: extend the bio field
                address: event.payload.creator_address,
                object_address: event.payload.account_object_address,
                username: event.payload.username,
                timestamp: event.payload.timestamp
            })

            // mark event as written
            await account_events.updateOne({
                _id: event._id
            }, {
                $set: {
                    written: true
                }
            })

            console.log(`ACCOUNT CREATED: ${_kid}`)

        }
        catch (e)
        {
            console.log(`FAILED TO INSERT EVENT: ${e}`)
        }
    }


    await sleep(10_000)
    main()
}


try {
    await main()
}
catch(e)
{
    console.log(`FAILED TO RUN MAIN: ${e}`)
}
