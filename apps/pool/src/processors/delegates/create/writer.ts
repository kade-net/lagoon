import { WithId } from "mongodb"
import { delegate_create_events } from "../../../db"
import _ from "lodash"
const { isNumber } = _
import KadeOracle, { delegate, eq } from "@kade-net/oracle"
import dayjs from "dayjs"
import { KADE_EVENTS } from "../../../actions"
import { sleep } from "../../../utils"

const getEvents = async () => {
    const storedEvents = await delegate_create_events.find({
        written: false,
        is_valid: true
    }).limit(10).sort({
        timestamp: -1,
    }).toArray()

    return storedEvents
}


async function main() {
    let events: Array<WithId<KADE_EVENTS.EVENT<KADE_EVENTS.DELEGATE_CREATE_EVENT>>> = []

    try {
        const fetched = await getEvents()
        for (const fetch of fetched) {
            events.push(fetch)
        }
    }
    catch (e) {
        console.log(`FAILED TO FETCH EVENTS: ${e}`)
    }

    for (const event of events) {
        try {
            let kid = event.payload.kid 

            const existingDelegate = await KadeOracle.query.delegate.findFirst({
                where: (fields) => eq(fields.id, kid)
            })

            const owner = await KadeOracle.query.account.findFirst({
                where: (fileds) => eq(fileds.address, event.payload.owner_address)
            })

            if(!owner) { // TODO: POSSIBLE BLOCKING ISSUE
                console.log(`OWNER NOT FOUND: ${event.payload.owner_address}`)

                let diff = dayjs(event.first_seen).diff(dayjs(), 'day')

                if(diff > 2) { // IF OLDER THAN 2 DAYS THEN MARK AS INVALID // TODO: change time to something less in future
                    console.log(`OWNER NOT FOUND FOR MORE THAN 2 DAYS: ${event.payload.owner_address}`)

                    try {
                        await delegate_create_events.updateOne({
                            _id: event._id
                        }, {
                            $set: {
                                is_valid: false
                            }
                        })
                    }
                    catch (e) {
                        console.log("FAILED TO MARK EVENT AS INVALID", e)
                    }
                }

                continue
            }

            if(existingDelegate) {
                console.log(`DELEGATE ALREADY EXISTS: ${existingDelegate.id}`)

                try {
                    await delegate_create_events.updateOne({
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
                continue 
            }

            // create delegate  

            await KadeOracle.insert(delegate).values({
                address: event.payload.delegate_address,
                owner_id: owner.id,
                id: kid,
                timestamp: event.payload.timestamp
            })

            // mark event as written 

            await delegate_create_events.updateOne({
                _id: event._id
            }, {
                $set: {
                    written: true
                }
            })

            console.log(`DELEGATE CREATED: ${kid}`)
        }
        catch (e){
            console.log(`FAILED TO INSERT EVENT: ${e}`)
        }
    }

    await sleep(10_000)
    main()
}

try {
    await main()
}
catch (e)
{
    console.log(`FAILED TO RUN MAIN: ${e}`)
}