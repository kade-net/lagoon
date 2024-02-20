import { Collection, WithId } from "mongodb";
import { z } from "zod";
import { parserConfig } from "../../db";
import { provider } from "../../contract";
import { ACCOUNT_CONTRACT, ACCOUNT_RESOURCE_ADDRESS, PUBLICATIONS_CONTRACT, PUBLICATION_RESOURCE_ADDRESS } from "../../contract/constants";
import _ from "lodash"
const { isNumber } = _
import { KADE_EVENTS } from "../../actions";
import { sleep } from "../../utils";
import dayjs from "dayjs";

interface ReaderDependancies {
    event_name: string,
    sequence_name: keyof KADE_EVENTS.EVENT_PARSER_CONFIG,
    schema: z.ZodSchema<any>,
    collection: Collection<any>
    type: KADE_EVENTS.EVENT_TYPE,
    contract: 'accounts' | 'publications'
}

function read_builder(deps: ReaderDependancies) {

    const getEvents = async () => {
        const config = await parserConfig.findOne({})
        if(!config) {
            throw new Error("Parser config not found")
        }

        const lastFollowSequenceNumber = config[deps.sequence_name]

        console.log(`LAST SEQUENCE NUMBER: ${lastFollowSequenceNumber}`)

        const events = await provider.getEventsByEventHandle(deps.contract == 'accounts' ? ACCOUNT_RESOURCE_ADDRESS : PUBLICATION_RESOURCE_ADDRESS, `${deps.contract == 'accounts' ? ACCOUNT_CONTRACT : PUBLICATIONS_CONTRACT}::State`, deps.event_name, {
            limit: 10,
            start: lastFollowSequenceNumber == 0 ? 0 : lastFollowSequenceNumber + 1
        })

        if(deps.type == "REPOST_CREATE")
        {
            console.log(events)
        }

        let lastEvent = events[events.length - 1]

        if(lastEvent && parseInt(lastEvent.sequence_number) > lastFollowSequenceNumber) {
            await parserConfig.updateOne({}, {
                $set: {
                    [deps.sequence_name]: parseInt(lastEvent.sequence_number)
                }
            })
        }

        return events
    }

    async function main(un_saved_events: Array<any> = []) {
        let events: Array<KADE_EVENTS.ACCOUNT_FOLLOW_EVENT> = [...un_saved_events]

        try {
            const fetched = await getEvents()
            for (const fetch of fetched){
                const parsed = deps.schema.safeParse(fetch.data)
                if(parsed.success){
                    events.push(parsed.data)
                }else
                {
                    console.log(`INVALID EVENT: ${fetch.sequence_number}`)
                }
            }
        }
        catch(e)
        {
            console.log(`FAILED TO FETCH EVENTS: ${e}`)
        }

        
        for (const event of events){
            try {
                const resp = await deps.collection.insertOne({
                    is_valid: true,
                    payload: event,
                    timestamp: event.timestamp,
                    written: false,
                    type: deps.type,
                    first_seen: new Date()
                })
                console.log(`INSERTED EVENT: ${resp.insertedId}`)
            }
            catch (e)
            {
                console.log(`FAILED TO WRITE EVENT: ${e}`)
            }
        }

        try {  
            await sleep(10_000)
            await main()
        }
        catch (e)
        {
            console.log(`SOMETHING WENT WRONG: ${e}`)
        }
    }

    
    return {
        main
    }

    

}

interface WritterDependancies<T extends KADE_EVENTS.EVENT = any> {
    collection: Collection<T>,
    assert: (event: WithId<T>, errors: {
        invalidation_reason: string | null
    }) => Promise<boolean>,
    mark_invalid: (event: WithId<T>, collection: Collection<T>, errors: {
        invalidation_reason: string | null
    }) => Promise<void>,
    resolve: (event: WithId<T>, collection: Collection<T>) => Promise<void>,
    dependancy_check?: (event: WithId<T>, collection: Collection<T>) => Promise<boolean>
}

function write_builder<T extends KADE_EVENTS.EVENT = any>(deps: WritterDependancies<T>) {

    const getEvents = async () => {
        // @ts-ignore 
        const storedEvents = await deps.collection.find({
            written: false,
            is_valid: true
        }).limit(10).toArray() // TODO: add sorting by timestamp

        return storedEvents
    }

    async function main(){
        let events: Array<any> = []
        const errors: {
            invalidation_reason: string | null
        } = {
            invalidation_reason: null
        }

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
                const dependacies_exist = deps.dependancy_check ? await deps.dependancy_check(event, deps.collection) : true

                if(!dependacies_exist){
                    const diff = dayjs(event.first_seen).diff(dayjs(), 'day')
                    if(diff > 1){ // TODO: reduce to minutes to prevent spam blocking
                        await deps.collection.updateOne({
                            _id: event._id
                            // @ts-ignore
                        }, {
                            $set: {
                                is_valid: false,
                                written: true
                            }
                        })
                    }
                    continue
                }
                const valid = await deps.assert(event, errors)
                if(!valid){
                    console.log("MARKING INVALID EVENT")
                    console.log(errors)
                    await deps.mark_invalid(event, deps.collection, errors)
                }else
                {
                    await deps.resolve(event, deps.collection)
                    console.log("RESOLVED EVENT")
                }
            }
            catch(e)
            {
                console.log(`FAILED TO FETCH EVENTS: ${e}`)
            }
        }

        try {
            await sleep(10_000)
            await main()
        }
        catch (e)
        {
            console.log(`SOMETHING WENT WRONG: ${e}`)
        }
    }

    return {
        main
    }

}


export {
    read_builder,
    write_builder
}
