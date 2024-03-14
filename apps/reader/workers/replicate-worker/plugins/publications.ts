import oracle, { and, community_posts, eq, publication, reaction } from "oracle"
import schema from "../../../schema"
import { EVENT_NAMES, ProcessorPlugin } from "../helpers"
import { ProcessMonitor } from "../monitor"
import { randomBytes } from "crypto"


export class PublicationCreateEventPlugin extends ProcessorPlugin {
    name(): EVENT_NAMES {
        return "PublicationCreate"
    }
    async process(event: Record<string, any>, monitor: ProcessMonitor, sequence_number: string, signature: string): Promise<void> {
        const parsed = schema.publication_create_event_schema.safeParse(event)
        if (!parsed.success) {
            console.log(parsed.error)
            monitor.setFailed(sequence_number, JSON.stringify(parsed.error))
            return
        }

        if (parsed.success) {
            const data = parsed.data
            const payload = data.type == 4 ? null : JSON.parse(data.payload)


            try {
                await oracle.transaction(async (txn) => {

                    await txn.insert(publication).values({
                        content: data.type == 4 ? {} : JSON.parse(data.payload),
                        creator_id: data.user_kid,
                        id: data.kid,
                        timestamp: data.timestamp,
                        publication_ref: data.publication_ref.length == 0 ? undefined : data.publication_ref,
                        parent_id: data.reference_kid < 100 ? undefined : data.reference_kid,
                        type: data.type
                    }).returning()

                    if (data.type == 1 && payload && payload.community) { // only posts
                        const community = await txn.query.communities.findFirst({
                            where: (fields, { eq }) => eq(fields.name, payload.community)
                        })
                        if (community) {
                            const membership = await txn.query.membership.findFirst({
                                where: (fields, { eq, and }) => and(
                                    eq(fields.community_id, community.id),
                                    eq(fields.user_kid, data.user_kid),
                                    eq(fields.is_active, true)
                                )
                            })

                            if (membership) {
                                await txn.insert(community_posts).values({
                                    community_id: community.id,
                                    id: randomBytes(32).toString('hex'),
                                    post_id: data.kid,
                                    user_kid: data.user_kid
                                })
                            }
                            // IGNORE IF MEMBERSHIP NOT FOUND
                        }
                        // IGNORE IF COMMUNITY NOT FOUND
                    }
                })


                monitor.setSuccess(sequence_number)
            }
            catch (e) {
                monitor.setFailed(sequence_number, JSON.stringify({ error: e }))
                console.log(`Something went wrong while processing data: ${e}`)
            }
        }
    }
}

export class PublicationRemoveEventPlugin extends ProcessorPlugin {
    name(): EVENT_NAMES {
        return "PublicationRemove"
    }
    async process(event: Record<string, any>, monitor: ProcessMonitor, sequence_number: string): Promise<void> {
        const parsed = schema.publication_remove_event_schema.safeParse(event)
        if (!parsed.success) {
            console.log(parsed.error)
            monitor.setFailed(sequence_number, JSON.stringify(parsed.error))
        }

        if (parsed.success) {
            const data = parsed.data

            try {
                await oracle.delete(publication).where(eq(publication.id, data.kid))
                await oracle.delete(reaction).where(eq(reaction.publication_id, data.kid))
                await oracle.delete(community_posts).where(eq(community_posts.post_id, data.kid))
                monitor.setSuccess(sequence_number)
            }
            catch (e) {
                monitor.setFailed(sequence_number, JSON.stringify({ error: e }))
                console.log(`Something went wrong while processing data: ${e}`)
            }
        }
    }
}

export class PublicationCreateWithRefEventPlugin extends ProcessorPlugin {
    name(): EVENT_NAMES {
        return "PublicationCreateWithRef"
    }
    async process(event: Record<string, any>, monitor: ProcessMonitor, sequence_number: string, signature: string): Promise<void> {
        const parsed = schema.publication_create_with_ref_event_schema.safeParse(event)
        if (!parsed.success) {
            console.log(parsed.error)
            monitor.setFailed(sequence_number, JSON.stringify(parsed.error))
            return 
        }

        if (parsed.success) {
            const data = parsed.data

            try {
                const parent = await oracle.query.publication.findFirst({
                    where: (fields, { eq }) => eq(fields.publication_ref, data.parent_ref)
                })

                if (!parent) {
                    monitor.setFailed(sequence_number, JSON.stringify({ error: "Parent publication not found" }))
                    return
                }

                await oracle.transaction(async (txn) => {
                    await oracle.insert(publication).values({
                        content: data.type == 4 ? {} : JSON.parse(data.payload),
                        creator_id: data.user_kid,
                        id: data.kid,
                        timestamp: data.timestamp,
                        publication_ref: data.publication_ref,
                        type: data.type,
                        parent_id: parent.id
                    })

                    const payload = data.type == 4 ? null : JSON.parse(data.payload)

                    if (data.type == 1 && payload && payload.community) { // only posts
                        const community = await txn.query.communities.findFirst({
                            where: (fields, { eq }) => eq(fields.name, payload.community)
                        })
                        if (community) {
                            const membership = await txn.query.membership.findFirst({
                                where: (fields, { eq, and }) => and(
                                    eq(fields.community_id, community.id),
                                    eq(fields.user_kid, data.user_kid),
                                    eq(fields.is_active, true)
                                )
                            })

                            if (membership) {
                                await txn.insert(community_posts).values({
                                    community_id: community.id,
                                    id: randomBytes(32).toString('hex'),
                                    post_id: data.kid,
                                    user_kid: data.user_kid
                                })
                            }
                            // IGNORE IF MEMBERSHIP NOT FOUND
                        }
                        // IGNORE IF COMMUNITY NOT FOUND
                    }

                })




                monitor.setSuccess(sequence_number)
            }
            catch (e) {
                monitor.setFailed(sequence_number, JSON.stringify({ error: e }))
                console.log(`Something went wrong while processing data: ${e}`)
            }
        }
    }
}


export class PublicationRemoveWithRefEventPlugin extends ProcessorPlugin {
    name(): EVENT_NAMES {
        return "PublicationRemoveWithRef"
    }
    async process(event: Record<string, any>, monitor: ProcessMonitor, sequence_number: string): Promise<void> {
        const parsed = schema.publication_remove_with_ref_event_schema.safeParse(event)
        if (!parsed.success) {
            console.log(parsed.error)
            monitor.setFailed(sequence_number, JSON.stringify(parsed.error))
        }

        if (parsed.success) {
            const data = parsed.data

            try {
                const chosen = await oracle.query.publication.findFirst({
                    where: (fields, { eq }) => and(eq(fields.publication_ref, data.ref), eq(fields.creator_id, data.user_kid))
                })
                if (!chosen) {
                    monitor.setFailed(sequence_number, JSON.stringify({ error: "Publication not found" }))
                    return
                }
                await oracle.delete(publication).where(eq(publication.id, chosen.id))
                await oracle.delete(reaction).where(eq(reaction.publication_id, chosen.id))
                await oracle.delete(community_posts).where(eq(community_posts.post_id, chosen.id))
                monitor.setSuccess(sequence_number)
            }
            catch (e) {
                monitor.setFailed(sequence_number, JSON.stringify({ error: e }))
                console.log(`Something went wrong while processing data: ${e}`)
            }
        }
    }
}



export class ReactionCreateEventPlugin extends ProcessorPlugin {
    name(): EVENT_NAMES {
        return "ReactionCreateEvent"
    }
    async process(event: Record<string, any>, monitor: ProcessMonitor, sequence_number: string, signature: string): Promise<void> {
        const parsed = schema.reaction_create_event_schema.safeParse(event)

        if (!parsed.success) {
            console.log(parsed.error)
            monitor.setFailed(sequence_number, JSON.stringify(parsed.error))
        }

        if (parsed.success) {
            const data = parsed.data

            try {
                await oracle.insert(reaction).values({
                    creator_id: data.user_kid,
                    id: data.kid,
                    reaction: data.reaction,
                    timestamp: data.timestamp,
                    publication_id: data.reference_kid,
                })
                monitor.setSuccess(sequence_number)
            }
            catch (e) {
                monitor.setFailed(sequence_number, JSON.stringify({ error: e }))
                console.log(`Something went wrong while processing data: ${e}`)
            }
        }
    }
}

export class ReactionCreateEventWithRefPlugin extends ProcessorPlugin {
    name(): EVENT_NAMES {
        return "ReactionCreateEventWithRef"
    }
    async process(event: Record<string, any>, monitor: ProcessMonitor, sequence_number: string, signature: string): Promise<void> {
        const parsed = schema.reaction_create_event_with_ref.safeParse(event)

        if (!parsed.success) {
            console.log(parsed.error)
            monitor.setFailed(sequence_number, JSON.stringify(parsed.error))
        }

        if (parsed.success) {
            const data = parsed.data

            try {
                const pub = await oracle.query.publication.findFirst({
                    where: (fields, { eq }) => eq(fields.publication_ref, data.publication_ref)
                })
                if (!pub) {
                    monitor.setFailed(sequence_number, JSON.stringify({ error: "Publication not found" }))
                    return
                }
                await oracle.insert(reaction).values({
                    creator_id: data.user_kid,
                    id: data.kid,
                    reaction: data.reaction,
                    timestamp: data.timestamp,
                    publication_id: pub?.id,
                })
                monitor.setSuccess(sequence_number)
            }
            catch (e) {
                monitor.setFailed(sequence_number, JSON.stringify({ error: e }))
                console.log(`Something went wrong while processing data: ${e}`)
            }
        }
    }

}

export class ReactionRemoveEventPlugin extends ProcessorPlugin {
    name(): EVENT_NAMES {
        return "ReactionRemoveEvent"
    }
    async process(event: Record<string, any>, monitor: ProcessMonitor, sequence_number: string): Promise<void> {
        const parsed = schema.reaction_remove_event_schema.safeParse(event)

        if (!parsed.success) {
            console.log(parsed.error)
            monitor.setFailed(sequence_number, JSON.stringify(parsed.error))
        }

        if (parsed.success) {
            const data = parsed.data
            try {
                await oracle.delete(reaction).where(eq(reaction.id, data.kid))
                monitor.setSuccess(sequence_number)
            }
            catch (e) {
                monitor.setFailed(sequence_number, JSON.stringify({ error: e }))
                console.log(`Something went wrong while processing data: ${e}`)
            }
        }
    }
}


export class ReactionRemoveEventWithRefPlugin extends ProcessorPlugin {
    name(): EVENT_NAMES {
        return "ReactionRemoveEventWithRef"
    }
    async process(event: Record<string, any>, monitor: ProcessMonitor, sequence_number: string): Promise<void> {
        const parsed = schema.reaction_remove_event_with_ref.safeParse(event)

        if (!parsed.success) {
            console.log(parsed.error)
            monitor.setFailed(sequence_number, JSON.stringify(parsed.error))
        }

        if (parsed.success) {
            const data = parsed.data
            try {
                const pub = await oracle.query.publication.findFirst({
                    where: (fields, { eq }) => eq(fields.publication_ref, data.ref)
                })
                if (!pub) {
                    monitor.setFailed(sequence_number, JSON.stringify({ error: "Publication not found" }))
                    return
                }
                await oracle.delete(reaction).where(and(eq(reaction.publication_id, pub?.id), eq(reaction.creator_id, data.user_kid)))
                monitor.setSuccess(sequence_number)
            }
            catch (e) {
                monitor.setFailed(sequence_number, JSON.stringify({ error: e }))
                console.log(`Something went wrong while processing data: ${e}`)
            }
        }
    }
}