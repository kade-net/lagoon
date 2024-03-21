import { WithId } from "mongodb"
import KadeOracle, { eq, follow } from "@kade-net/oracle"
import { KADE_EVENTS } from "../../actions"
import { account_follow_events } from "../../db"
import { sleep } from "../../utils"
import dayjs from "dayjs"

const getEvents = async () => {

    const storedEvents = await account_follow_events.find({
        written: false,
        is_valid: true,
    }).limit(10).sort({
        timestamp: -1,
    }).toArray() // TODO: add sorting by timestamp

    return storedEvents
}

async function main(){
    let events: Array<WithId<KADE_EVENTS.EVENT<KADE_EVENTS.ACCOUNT_FOLLOW_EVENT>>> = []

    try {
        const fetched = await getEvents()
        for (const fetch of fetched) {
            events.push(fetch)
        }
    }
    catch(e)
    {
        console.log(`FAILED TO FETCH EVENTS: ${e}`)
    }

    for(const event of events) 
    {
        try {
         let follower_kid = event.payload.follower_kid as unknown as number
         let following_kid = event.payload.following_kid as unknown as number
         let kid = event.payload.kid as unknown as number
        

         // assert both accounts exist
         const follower = await KadeOracle.query.account.findFirst({
            where: fields => eq(fields.id, follower_kid)
         })

         const following = await KadeOracle.query.account.findFirst({
            where: fields => eq(fields.id, following_kid)
         })

         if(!follower || !following){
            console.log("FOLLOWER OR FOLLOWING NOT FOUND")
            try {
                const diff = dayjs(event.first_seen).diff(dayjs(), 'day')

                if(diff > 1){
                        await account_follow_events.updateOne({
                            _id: event._id
                        }, {
                            $set: {
                                is_valid: false
                            }
                        })
                    }

                }
            catch(e)
            {
                console.log("FAILED TO MARK EVENT AS INVALID", e)
            }
         }

         // assert follow does not exist
         const _follow = await KadeOracle.query.follow.findFirst({
            where: fields => eq(fields.id, kid)
         })

         if(_follow){
            console.log("FOLLOW ALREADY EXISTS")
            try {
                await account_follow_events.updateOne({
                    _id: event._id
                }, {
                    $set: {
                        is_valid: false
                    }
                })
            }
            catch(e)
            {
                console.log("FAILED TO MARK EVENT AS INVALID", e)
            }
         }

         // create follow

        await KadeOracle.insert(follow).values({
            timestamp: event.payload.timestamp,
            follower_id: follower_kid,
            following_id: following_kid,
            id: kid,
        })

        // mark event as written
        await account_follow_events.updateOne({
            _id: event._id
        }, {
            $set: {
                written: true
            }
        })

        console.log(`FOLLOW CREATED: ${kid}`)

        }
        catch(e)
        {
            console.log(`FAILED TO INSERT EVENT: ${e}`)
        }
    }
    await sleep(10_000)
    main()
}

try {
    main()
}
catch (e)
{
    console.log(`FAILED TO FETCH EVENTS: ${e}`)
}