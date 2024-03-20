import { ServerWritableStream, events } from "tunnel";
import { EVENT_NAMES } from "../../workers/replicate-worker/helpers";
import { IngressPlugin } from "./definitions";
import schema from "../../schema";


export class AccountCreatePlugin extends IngressPlugin {
    name(): EVENT_NAMES {
        return 'AccountCreateEvent'
    }
    async process(call: ServerWritableStream<events.EventsRequest, events.Event>, event: Record<string, any>, sequence_number: string) {
        const parsed = schema.account_create_event_schema.safeParse(event)

        if (!parsed.success) {
            console.log(parsed.error)
        }
        if (parsed.success) {
            const data = parsed.data
            const event = new events.Event({
                account_create_event: new events.AccountCreateEvent({
                    account_object_address: data.account_object_address,
                    creator_address: data.creator_address,
                    kid: data.kid,
                    timestamp: data.timestamp.getTime(),
                    username: data.username
                }),
                event_type: "AccountCreateEvent",
                sequence_number: parseInt(sequence_number),
            })

            call.write(event, (err: any) => {
                if (err) {
                    console.log(err)
                }
            })
        }
    }

}

export class AccountFollowPlugin extends IngressPlugin {
    name(): EVENT_NAMES {
        return 'AccountFollowEvent'
    }
    async process(call: ServerWritableStream<events.EventsRequest, events.Event>, event: Record<string, any>, sequence_number: string) {
        const parsed = schema.account_follow_event_schema.safeParse(event)

        if (!parsed.success) {
            console.log(parsed.error)
        }
        if (parsed.success) {
            const data = parsed.data
            const event = new events.Event({
                account_follow_event: new events.AccountFollowEvent({
                    timestamp: data.timestamp.getTime(),
                    follower: data.follower,
                    following: data.following,
                    delegate: data.delegate,
                    follower_kid: data.follower_kid,
                    following_kid: data.following_kid,
                    kid: data.kid,
                    user_kid: data.user_kid
                }),
                event_type: "AccountFollowEvent",
                sequence_number: parseInt(sequence_number),
            })

            call.write(event, (err: any) => {
                if (err) {
                    console.log(err)
                }
            })
        }
    }

}

export class AccountUnFollowPlugin extends IngressPlugin {
    name(): EVENT_NAMES {
        return 'AccountUnFollowEvent'
    }
    async process(call: ServerWritableStream<events.EventsRequest, events.Event>, event: Record<string, any>, sequence_number: string) {
        const parsed = schema.account_unfollow_event_schema.safeParse(event)

        if (!parsed.success) {
            console.log(parsed.error)
        }
        if (parsed.success) {
            const data = parsed.data
            const event = new events.Event({
                account_unfollow_event: new events.AccountUnfollowEvent({
                    timestamp: data.timestamp.getTime(),
                    delegate: data.delegate,
                    unfollowing_kid: data.unfollowing_kid,
                    user_kid: data.user_kid,
                }),
                event_type: "AccountUnFollowEvent",
                sequence_number: parseInt(sequence_number),
            })

            call.write(event, (err: any) => {
                if (err) {
                    console.log(err)
                }
            })
        }
    }

}

export class ProfileUpdatePlugin extends IngressPlugin {
    name(): EVENT_NAMES {
        return 'ProfileUpdateEvent'
    }
    async process(call: ServerWritableStream<events.EventsRequest, events.Event>, event: Record<string, any>, sequence_number: string) {
        const parsed = schema.profile_update_event_schema.safeParse(event)

        if (!parsed.success) {
            console.log(parsed.error)
        }
        if (parsed.success) {
            const data = parsed.data
            const event = new events.Event({
                profile_update_event: new events.ProfileUpdateEvent({
                    bio: data.bio,
                    delegate: data.delegate,
                    display_name: data.display_name,
                    pfp: data.pfp,
                    timestamp: data.timestamp.getTime(),
                    user_kid: data.user_kid,
                }),
                event_type: "ProfileUpdateEvent",
                sequence_number: parseInt(sequence_number),
            })

            call.write(event, (err: any) => {
                if (err) {
                    console.log(err)
                }
            })
        }
    }
}