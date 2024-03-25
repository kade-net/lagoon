import { WithId } from "mongodb"
import { account_unfollow_events } from "../../db"
import KadeOracle, { and, eq, follow } from "@kade-net/oracle"
import { KADE_EVENTS } from "../../actions"

const getEvents = async () => {
    const storedEvents = await account_unfollow_events.find({
        written: false, 
        is_valid: true
    }).limit(10).toArray() // TODO: add sorting by timestamp

    return storedEvents
}


async function main(){

    let events: Array<WithId<KADE_EVENTS.EVENT<KADE_EVENTS.ACCOUNT_UNFOLLOW_EVENT>>> = []

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
            const kid = event.payload.kid as unknown as number
            const follower_id = event.payload.user_kid as unknown as number

            const _follow = await KadeOracle.query.follow.findFirst({
                where: (fields) => and(eq(fields.id, kid), eq(fields.follower_id, follower_id))
            })

            if(!_follow){
                console.log(`FOLLOW DOESN'T EXIST: ${kid} -> ${follower_id}`)
                try {
                    await account_unfollow_events.updateOne({
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

            await KadeOracle.delete(follow).where(eq(follow.id, kid))

            await account_unfollow_events.updateOne({
                _id: event._id
            }, {
                $set: {
                    written: true
                }
            })


        }
        catch(e)
        {
            console.log(`FAILED TO FETCH EVENTS: ${e}`)
        }
    }

    try {

        await main()
    }
    catch (e)
    {
        console.log(`FAILED TO FETCH EVENTS: ${e}`)
    }

}


try {
    await main()
}
catch (e)
{
    console.log("Something went wrong::", e)
}