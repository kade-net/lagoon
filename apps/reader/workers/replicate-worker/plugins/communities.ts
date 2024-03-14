import schema from "../../../schema";
import { EVENT_NAMES, ProcessorPlugin } from "../helpers";
import { ProcessMonitor } from "../monitor";
import oracle, { and, communities, count, eq, membership } from "oracle"



export class CommunityRegisteredEventPlugin implements ProcessorPlugin {
    name(): EVENT_NAMES {
        return "CommunityRegisteredEvent"
    }
    async process(event: Record<string, any>, monitor: ProcessMonitor, sequence_number: string, signature: string): Promise<void> {
        const parsed = schema.community_registered_event_schema.safeParse(event)
        if (!parsed.success) {
            console.log(parsed.error)
            monitor.setFailed(sequence_number, JSON.stringify(parsed.error))
            monitor.setPosthogFailed(sequence_number, parsed.error);
            return
        }

        if (parsed.success) {
            const data = parsed.data
            try {
                await oracle.insert(communities).values({
                    id: data.bid,
                    creator_address: data.creator,
                    description: data.description,
                    image: data.image,
                    name: data.name,
                    user_kid: data.user_kid,
                    timestamp: data.timestamp
                })

                monitor.setSuccess(sequence_number)
                monitor.setPosthogSuccess(sequence_number);
            }
            catch (e) {
                console.log(e)
                monitor.setFailed(sequence_number, JSON.stringify({ error: e }))
                monitor.setPosthogFailed(sequence_number, {error: e});
            }
        }
    }

}


export class MemberJoinEventPlugin implements ProcessorPlugin {
    name(): EVENT_NAMES {
        return "MemberJoinEvent"
    }
    async process(event: Record<string, any>, monitor: ProcessMonitor, sequence_number: string, signature: string): Promise<void> {
        const parsed = schema.member_join_event_schema.safeParse(event)

        if (!parsed.success) {
            console.log(parsed.error)
            monitor.setFailed(sequence_number, JSON.stringify(parsed.error))
            monitor.setPosthogFailed(sequence_number, parsed.error);
            return
        }

        if (parsed.success) {
            const data = parsed.data

            try {
                const community = await oracle.query.communities.findFirst({
                    where: (fields, { eq }) => eq(fields.name, data.community_name)
                })

                if (!community) {
                    monitor.setFailed(sequence_number, JSON.stringify({ error: "Community not found" }))
                    monitor.setPosthogFailed(sequence_number, { error: "Community not found" });
                    return
                }

                await oracle.transaction(async (txn) => {
                    const current_count = await txn.select({
                        membership_count: count(membership.id)
                    }).from(membership)

                    const _count = current_count?.at(0)?.membership_count || 0

                    // TODO: Currently the smart contract isn't incrementing the membership id, so we have to do it here

                    await txn.insert(membership).values({
                        community_id: community.id,
                        id: _count + 1,
                        type: data.type,
                        user_kid: data.user_kid,
                        is_active: true,
                    })
                })
                monitor.setSuccess(sequence_number)
                monitor.setPosthogSuccess(sequence_number);
            }
            catch (e) {
                console.log(e)
                monitor.setFailed(sequence_number, JSON.stringify({ error: e }))
                monitor.setPosthogFailed(sequence_number, {error: e});
            }
        }
    }

}

export class MembershipChangeEventPlugin implements ProcessorPlugin {
    name(): EVENT_NAMES {
        return "MembershipChangeEvent"
    }
    async process(event: Record<string, any>, monitor: ProcessMonitor, sequence_number: string, signature: string): Promise<void> {
        const parsed = schema.membership_change_event_schema.safeParse(event)

        if (!parsed.success) {
            console.log(parsed.error)
            monitor.setFailed(sequence_number, JSON.stringify(parsed.error))
            monitor.setPosthogFailed(sequence_number, parsed.error);
            return
        }

        const data = parsed.data

        try {
            const community = await oracle.query.communities.findFirst({
                where: (fields, { eq }) => eq(fields.name, data.community_name)
            })

            if (!community) {
                monitor.setFailed(sequence_number, JSON.stringify({ error: "Community not found" }))
                monitor.setPosthogFailed(sequence_number, { error: "Community not found" });
                return
            }

            if (community.creator_address != data.made_by) {
                monitor.setFailed(sequence_number, JSON.stringify({ error: "Only creator can change membership" }))
                monitor.setPosthogFailed(sequence_number, { error: "Only creator can change membership" });
                return
            }

            await oracle.update(membership).set({
                type: data.type
            }).where(and(
                eq(membership.id, data.membership_id),
                eq(membership.community_id, community.id)
            ))

            monitor.setSuccess(sequence_number)
            monitor.setPosthogSuccess(sequence_number);
        }
        catch (e) {
            console.log(e)
            monitor.setFailed(sequence_number, JSON.stringify({ error: e }))
            monitor.setPosthogFailed(sequence_number, {error: e});
        }

    }

}

export class MembershipDeleteEventPlugin implements ProcessorPlugin {
    name(): EVENT_NAMES {
        return "MembershipDeleteEvent"
    }
    async process(event: Record<string, any>, monitor: ProcessMonitor, sequence_number: string, signature: string): Promise<void> {
        const parsed = schema.membership_delete_event_schema.safeParse(event)

        if (!parsed.success) {
            console.log(parsed.error)
            monitor.setFailed(sequence_number, JSON.stringify(parsed.error))
            monitor.setPosthogFailed(sequence_number, parsed.error);
            return
        }

        const data = parsed.data

        try {
            const community = await oracle.query.communities.findFirst({
                where: (fields, { eq }) => eq(fields.name, data.community_name)
            })

            if (!community) {
                monitor.setFailed(sequence_number, JSON.stringify({ error: "Community not found" }))
                monitor.setPosthogFailed(sequence_number, { error: "Community not found" });
                return
            }

            await oracle.update(membership).set({
                is_active: false
            }).where(and(
                eq(membership.id, data.membership_id),
                eq(membership.community_id, community.id)
            ))

            monitor.setSuccess(sequence_number)
            monitor.setPosthogSuccess(sequence_number);
        }
        catch (e) {
            console.log(e)
            monitor.setFailed(sequence_number, JSON.stringify({ error: e }))
            monitor.setPosthogFailed(sequence_number, {error: e})
        }

    }

}

export class MembershipReclaimEventPlugin implements ProcessorPlugin {
    name(): EVENT_NAMES {
        return "MembershipReclaimEvent"
    }
    async process(event: Record<string, any>, monitor: ProcessMonitor, sequence_number: string, signature: string): Promise<void> {
        const parsed = schema.membership_reclaim_event_schema.safeParse(event)

        if (!parsed.success) {
            console.log(parsed.error)
            monitor.setFailed(sequence_number, JSON.stringify(parsed.error))
            monitor.setPosthogFailed(sequence_number, parsed.error);
            return
        }

        const data = parsed.data

        try {
            const community = await oracle.query.communities.findFirst({
                where: (fields, { eq }) => eq(fields.id, data.community_id)
            })

            if (!community) {
                monitor.setFailed(sequence_number, JSON.stringify({ error: "Community not found" }))
                monitor.setPosthogFailed(sequence_number, { error: "Community not found" });
                return
            }

            await oracle.update(membership).set({
                is_active: true
            }).where(and(
                eq(membership.id, data.membership_id),
                eq(membership.community_id, community.id)
            ))

            monitor.setSuccess(sequence_number)
            monitor.setPosthogSuccess(sequence_number);
        }
        catch (e) {
            console.log(e)
            monitor.setFailed(sequence_number, JSON.stringify({ error: e }))
            monitor.setPosthogFailed(sequence_number, {error: e});
        }

    }
}