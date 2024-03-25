import { WithId } from "mongodb"
import { delegate_remove_events } from "../../../db"

import KadeOracle, { delegate, eq } from "@kade-net/oracle"
import dayjs from "dayjs"
import { KADE_EVENTS } from "../../../actions"
import { sleep } from "../../../utils"


const getEvents = async () => {
    const storedEvents = await delegate_remove_events.find({
        written: false,
        is_valid: true
    }).limit(10).sort({
        timestamp: -1,
    }).toArray() // TODO: add sorting by timestamp

    return storedEvents
}


async function main(){

    let events: Array<WithId<KADE_EVENTS.EVENT<KADE_EVENTS.DELEGATE_REMOVE_EVENT>>> = []

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

    for (const event  of events ) {
        try {
            let kid = event.payload.kid
            const _kid = kid

            const existingDelegate = await KadeOracle.query.delegate.findFirst({
                where: (fields) => eq(fields.id, _kid)
            })

            if (!existingDelegate){
                console.log(`DELEGATE NOT FOUND: ${_kid}`)
                let diff = dayjs(event.first_seen).diff(dayjs(), 'day')

                if(diff > 2) { // IF OLDER THAN 2 DAYS THEN MARK AS INVALID // TODO: change time to something less in future
                    console.log(`DELEGATE NOT FOUND FOR MORE THAN 2 DAYS: ${_kid}`)

                    try {
                        await delegate_remove_events.updateOne({
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
                }
                continue
            }

            await KadeOracle.delete(delegate).where(eq(delegate.id, _kid))

            try {
                await delegate_remove_events.updateOne({
                    _id: event._id
                }, {
                    $set: {
                        written: true
                    }
                })
            }
            catch (e)
            {
                console.log("FAILED TO MARK EVENT AS WRITTEN", e)
            }

        }catch (e)
        {
            console.log("FAILED TO DELETE EVENT", e)
        }
    }

    await sleep(10_000)
    await main()

}

try {
    await main()
}
catch (e)
{
    console.log("FAILED TO FETCH EVENTS", e)
}