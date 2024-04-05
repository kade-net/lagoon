import schema from "../../../schema";
import { EVENT_NAMES, ProcessorPlugin } from "../helpers";
import oracle, { account, and, delegate, eq, follow, profile } from "@kade-net/oracle"
import { ProcessMonitor } from "../monitor";


export class AccountCreatePlugin extends ProcessorPlugin {
    name(): EVENT_NAMES {
        return "AccountCreateEvent"
    }
    async process(event: Record<string, any>, monitor: ProcessMonitor, sequence_number: string, signature: string): Promise<void> {
        const parsed = schema.account_create_event_schema.safeParse(event)
        if (!parsed.success) {
            console.log(parsed.error)
            monitor.setPosthogFailed(sequence_number, parsed.error)
        }
        if (parsed.success) {
            const data = parsed.data
            try {
                await oracle.insert(account).values({
                    id: data.kid,
                    address: data.creator_address,
                    object_address: data.account_object_address,
                    timestamp: data.timestamp,
                })

                monitor.setPosthogSuccess(sequence_number)
            }
            catch (e) {
                console.log(e)
                monitor.setPosthogFailed(sequence_number, {error: e})
            }
        }
    }
}


export class DelegateCreatePlugin extends ProcessorPlugin {
    name(): EVENT_NAMES {
        return "DelegateCreateEvent"
    }
    async process(event: Record<string, any>, monitor: ProcessMonitor, sequence_number: string, signature: string): Promise<void> {
        const parsed = schema.delegate_create_event_schema.safeParse(event)
        if (!parsed.success) {
            console.log(parsed.error)
            monitor.setPosthogFailed(sequence_number, parsed.error);
        }

        if (parsed.success) {
            const data = parsed.data

            try {
                const account = await oracle.query.account.findFirst({
                    where: (fields, { eq }) => eq(fields.address, data.owner_address)
                })

                if (account) {
                    await oracle.insert(delegate).values({
                        address: data.delegate_address,
                        id: data.kid,
                        owner_id: account?.id,
                        timestamp: data.timestamp
                    })
                    monitor.setPosthogSuccess(sequence_number);
                }
                else {
                    console.log(`Account with address ${data.owner_address} not found`)
                    monitor.setPosthogFailed(sequence_number, { error: `Account with address ${data.owner_address} not found` })
                }
            }
            catch (e) {
                console.log(`Something went wrong while processing data: ${e}`)
                monitor.setPosthogFailed(sequence_number, {error: e})
            }
        }
    }
}

export class DelegateRemovePlugin extends ProcessorPlugin {
    name(): EVENT_NAMES {
        return "DelegateRemoveEvent"
    }
    async process(event: Record<string, any>, monitor: ProcessMonitor, sequence_number: string, signature: string): Promise<void> {
        const parsed = schema.delegate_remove_event_schema.safeParse(event)
        if (!parsed.success) {
            console.log(parsed.error)
            monitor.setPosthogFailed(sequence_number, parsed.error);
        }

        if (parsed.success) {
            const data = parsed.data

            try {
                await oracle.delete(delegate).where(eq(delegate.id, data.kid))
                monitor.setPosthogSuccess(sequence_number);
            }
            catch (e) {
                console.log(`Something went wrong while processing data: ${e}`)
                monitor.setPosthogFailed(sequence_number, {error: e})
            }
        }
    }
}

export class AccountFollowPlugin extends ProcessorPlugin {
    name(): EVENT_NAMES {
        return "AccountFollowEvent"
    }
    async process(event: Record<string, any>, monitor: ProcessMonitor, sequence_number: string, signature: string): Promise<void> {
        const parsed = schema.account_follow_event_schema.safeParse(event)

        if (!parsed.success) {
            console.log(parsed.error)
            monitor.setPosthogFailed(sequence_number, parsed.error);
        }

        if (parsed.success) {
            const data = parsed.data

            try {
                const existing = await oracle.query.follow.findFirst({
                    where: (fields, { eq, and }) => and(
                        eq(fields.follower_id, data.follower_kid),
                        eq(fields.following_id, data.following_kid)
                    )
                })

                if (existing) {
                    return
                }
                await oracle.insert(follow).values({
                    id: data.kid,
                    follower_id: data.follower_kid,
                    following_id: data.following_kid,
                    timestamp: data.timestamp
                })

                monitor.setPosthogSuccess(sequence_number);
            }
            catch (e) {
                console.log(`Something went wrong while processing data: ${e}`)
                monitor.setPosthogFailed(sequence_number, {error: e})
            }
        }
    }
}

export class AccountUnFollowPlugin extends ProcessorPlugin {
    name(): EVENT_NAMES {
        return "AccountUnFollowEvent"
    }
    async process(event: Record<string, any>, monitor: ProcessMonitor, sequence_number: string): Promise<void> {
        const parsed = schema.account_unfollow_event_schema.safeParse(event)

        if (!parsed.success) {
            console.log(parsed.error)
            monitor.setPosthogFailed(sequence_number, parsed.error)
        }

        if (parsed.success) {
            const data = parsed.data

            try {
                await oracle.delete(follow).where(and(
                    eq(follow.follower_id, data.user_kid),
                    eq(follow.following_id, data.unfollowing_kid)
                ))
                monitor.setPosthogSuccess(sequence_number)
            }
            catch (e) {
                console.log(`Something went wrong while processing data: ${e}`)
                monitor.setPosthogFailed(sequence_number, {error: e})
            }
        }
    }
}

export class ProfileUpdatePlugin extends ProcessorPlugin {
    name(): EVENT_NAMES {
        return "ProfileUpdateEvent"
    }
    async process(event: Record<string, any>, monitor: ProcessMonitor, sequence_number: string, signature: string): Promise<void> {
        const parsed = schema.profile_update_event_schema.safeParse(event)

        if (!parsed.success) {
            console.log(parsed.error)
            monitor.setPosthogFailed(sequence_number, parsed.error);
        }

        if (parsed.success) {
            const data = parsed.data

            try {
                const existingProfile = await oracle.query.profile.findFirst({
                    where: (fields, { eq }) => eq(fields.creator, data.user_kid)
                })

                if (existingProfile) {
                    await oracle.update(profile).set({
                        bio: data.bio,
                        display_name: data.display_name,
                        pfp: data.pfp,
                    }).where(eq(profile.creator, data.user_kid))
                }
                else {
                    await oracle.insert(profile).values({
                        bio: data.bio,
                        display_name: data.display_name,
                        pfp: data.pfp,
                        creator: data.user_kid
                    })
                }
                monitor.setPosthogSuccess(sequence_number);
            }
            catch (e) {
                console.log(`Something went wrong while processing data: ${e}`)
                monitor.setPosthogFailed(sequence_number, {error: e});
            }
        }
    }
}