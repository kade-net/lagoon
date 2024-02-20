import _ from "lodash"
const { isNumber } = _
import { provider } from "../../contract"
import { ACCOUNT_CONTRACT, ACCOUNT_EVENTS, ACCOUNT_RESOURCE_ADDRESS } from "../../contract/constants"
import { account_follow_events, parserConfig } from "../../db"
import schema from "../../schema"
import { KADE_EVENTS } from "../../actions"
import { sleep } from "../../utils"


const getEvents = async () => {
    const config = await parserConfig.findOne({})
    if(!config) {
        throw new Error("Parser config not found")
    }

    const lastFollowSequenceNumber = config.account_follow_last_sequence_number

    const events = await provider.getEventsByEventHandle(ACCOUNT_RESOURCE_ADDRESS, `${ACCOUNT_CONTRACT}::State`, ACCOUNT_EVENTS.account_follow_events, {
        limit: 10,
        start: lastFollowSequenceNumber == 0 ? 0 : lastFollowSequenceNumber + 1
    })

    let lastEvent = events[events.length - 1]

    if(lastEvent && parseInt(lastEvent.sequence_number) > lastFollowSequenceNumber){
        await parserConfig.updateOne({}, {
            $set: {
                account_follow_last_sequence_number: parseInt(lastEvent.sequence_number)
            }
        })
    }

    return events
}

async function main(un_saved_events: Array<KADE_EVENTS.ACCOUNT_FOLLOW_EVENT> = []) {
    let events: Array<KADE_EVENTS.ACCOUNT_FOLLOW_EVENT> = [...un_saved_events]

    try {
        const fetched = await getEvents()
        for (const fetch of fetched){
            const parsed = schema.account_follow_event_schema.safeParse(fetch.data)
            if(parsed.success){
                events.push(parsed.data)
            }else
            {
                console.warn(`INVALID EVENT: ${fetch.sequence_number}`)
            }
        }
    }
    catch(e)
    {
        console.log(`FAILED TO FETCH EVENTS: ${e}`)
    }

    for (const event of events){
        try {
            const resp = await account_follow_events.insertOne({
                is_valid: true,
                payload: event,
                timestamp: event.timestamp,
                written: false,
                type: 'ACCOUNT_FOLLOW',
                first_seen: new Date()
            })
        }
        catch(e)
        {
            console.log(`FAILED TO INSERT EVENT: ${e}`)
        }
    }

    try {
        await sleep(10_000)
        await main()
    }
    catch(e)
    {
        console.log("FAILED TO PROCESS EVENTS", e)
    }
}

try {
    await main()
}
catch(e)
{
    console.log("FAILED TO PROCESS EVENTS", e)
}