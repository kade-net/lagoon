import _ from "lodash"
import { provider } from "../../../contract"
import { ACCOUNT_CONTRACT, ACCOUNT_EVENTS, ACCOUNT_RESOURCE_ADDRESS } from "../../../contract/constants"
import { account_events, parserConfig } from "../../../db"
import schema from "../../../schema"
import { KADE_EVENTS } from "../../../actions"
import { sleep } from "../../../utils"

const { isNumber } = _

const getEvents = async () => {
    let config = await parserConfig.findOne({})
    if(!config) {
        throw new Error("Parser config not found")
    }
    const lastAccountSequenceNumber = config.account_create_last_sequence_number

    const events = await provider.getEventsByEventHandle(ACCOUNT_RESOURCE_ADDRESS, `${ACCOUNT_CONTRACT}::State`, ACCOUNT_EVENTS.account_create_events, {
        limit: 10,
        start: lastAccountSequenceNumber == 0 ? 0 : lastAccountSequenceNumber + 1
    })

    let lastEvent = events[events.length - 1]

    if(lastEvent && parseInt(lastEvent.sequence_number) > lastAccountSequenceNumber) {
        await parserConfig.updateOne({}, {
            $set: {
                account_create_last_sequence_number: parseInt(lastEvent.sequence_number )
            }
        })
    }

    return events
}



async function main(un_saved_events: Array<KADE_EVENTS.ACCOUNT_CREATE_EVENT> = []) {

    let events: Array<KADE_EVENTS.ACCOUNT_CREATE_EVENT> = [...un_saved_events]

    try {
        const fetched = await getEvents()
        for (const fetch of fetched){
            const parsed = schema.account_create_event_schema.safeParse(fetch.data)
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
            const resp = await account_events.insertOne({
                is_valid: true,
                payload: event,
                timestamp: event.timestamp,
                written: false,
                type: 'ACCOUNT_CREATE',
                first_seen: new Date()
            })

            console.log(`SUCCESSFULLY INSERTED EVENT: ${resp.insertedId}`)
        }
        catch(e)
        {
            un_saved_events.push(event)
            console.log(`FAILED TO INSERT EVENT: ${e}`)
        }
    }

    // TODO: add base case to stop or pause recursion if needed
    await sleep(10_000)
    await main()

}

(async ()=>{
    await main()
})()