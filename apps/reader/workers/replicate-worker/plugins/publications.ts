import oracle, { comment, eq, publication, quote, reaction, repost } from "oracle"
import schema from "../../../schema"
import { ProcessorPlugin } from "../helpers"
import { ProcessMonitor } from "../monitor"
import { KadeEvents, handleEitherPostgresOrUnkownError, setSchemaError } from "../../error-worker/errors"


export class PublicationCreateEventPlugin extends ProcessorPlugin {
    name(): string {
        return "PublicationCreate"
    }
    async process(event: Record<string, any>, monitor: ProcessMonitor, sequence_number: string): Promise<void> {
        const parsed = schema.publication_create_event_schema.safeParse(event)
        if (!parsed.success) {
            console.log(parsed.error);
            setSchemaError(monitor, parsed.error, sequence_number, KadeEvents.PublicationCreate);
        }

        if (parsed.success) {
            const data = parsed.data

            try {
                await oracle.insert(publication).values({
                    content: JSON.parse(data.payload),
                    creator_id: data.user_kid,
                    id: data.kid,
                    timestamp: data.timestamp
                })
                monitor.setSuccess(sequence_number)
            }
            catch (e) {
                handleEitherPostgresOrUnkownError(sequence_number, monitor, e);
                console.log(`Something went wrong while processing data: ${e}`)
            }
        }
    }
}

export class PublicationRemoveEventPlugin extends ProcessorPlugin {
    name(): string {
        return "PublicationRemoveEvent"
    }
    async process(event: Record<string, any>, monitor: ProcessMonitor, sequence_number: string): Promise<void> {
        const parsed = schema.publication_remove_event_schema.safeParse(event)
        if (!parsed.success) {
            console.log(parsed.error);
            setSchemaError(monitor, parsed.error, sequence_number, KadeEvents.PublicationRemove);
        }

        if (parsed.success) {
            const data = parsed.data

            try {
                await oracle.delete(publication).where(eq(publication.id, data.kid))
                monitor.setSuccess(sequence_number)
            }
            catch (e) {
                handleEitherPostgresOrUnkownError(sequence_number, monitor, e);
                console.log(`Something went wrong while processing data: ${e}`)
            }
        }
    }
}

export class CommentCreateEventPlugin extends ProcessorPlugin {
    name(): string {
        return "CommentCreateEvent"
    }
    async process(event: Record<string, any>, monitor: ProcessMonitor, sequence_number: string): Promise<void> {
        const parsed = schema.comment_create_event_schema.safeParse(event)
        if (!parsed.success) {
            console.log(parsed.error)
            setSchemaError(monitor, parsed.error, sequence_number, KadeEvents.CommentCreate);
        }

        if (parsed.success) {
            const data = parsed.data

            try {
                await oracle.insert(comment).values({
                    content: JSON.parse(data.content),
                    creator_id: data.user_kid,
                    id: data.kid,
                    timestamp: data.timestamp,
                    ...(
                        data.type == 1 ? { publication_id: data.reference_kid } :
                            data.type == 2 ? { quote_id: data.reference_kid } :
                                data.type == 3 ? { comment_id: data.reference_kid } : {}
                    )
                })
                monitor.setSuccess(sequence_number)
            }
            catch (e) {
                handleEitherPostgresOrUnkownError(sequence_number, monitor, e);
                console.log(`Something went wrong while processing data: ${e}`)
            }
        }
    }
}

export class CommentRemoveEventPlugin extends ProcessorPlugin {
    name(): string {
        return "CommentRemoveEvent"
    }
    async process(event: Record<string, any>, monitor: ProcessMonitor, sequence_number: string): Promise<void> {
        const parsed = schema.comment_remove_event_schema.safeParse(event)

        if (!parsed.success) {
            console.log(parsed.error)
            setSchemaError(monitor, parsed.error, sequence_number, KadeEvents.CommentRemove);
        }

        if (parsed.success) {
            const data = parsed.data

            try {
                await oracle.delete(comment).where(eq(comment.id, data.kid))
                monitor.setSuccess(sequence_number)
            }
            catch (e) {
                handleEitherPostgresOrUnkownError(sequence_number, monitor, e);
                console.log(`Something went wrong while processing data: ${e}`)
            }
        }
    }
}

export class RepostCreateEventPlugin extends ProcessorPlugin {
    name(): string {
        return "RepostCreateEvent"
    }
    async process(event: Record<string, any>, monitor: ProcessMonitor, sequence_number: string): Promise<void> {

        const parsed = schema.repost_create_event_schema.safeParse(event)

        if (!parsed.success) {
            console.log(parsed.error)
            setSchemaError(monitor, parsed.error, sequence_number, KadeEvents.RepostCreate);
        }


        if (parsed.success) {
            const data = parsed.data


            try {
                await oracle.insert(repost).values({
                    creator_id: data.user_kid,
                    id: data.kid,
                    publication_id: data.reference_kid,
                    timestamp: data.timestamp
                })
                monitor.setSuccess(sequence_number)
            }
            catch (e) {
                handleEitherPostgresOrUnkownError(sequence_number, monitor, e);
                console.log(`Something went wrong while processing data: ${e}`)
            }
        }
    }
}

export class RepostRemoveEventPlugin extends ProcessorPlugin {
    name(): string {
        return "RepostRemoveEvent"
    }
    async process(event: Record<string, any>, monitor: ProcessMonitor, sequence_number: string): Promise<void> {

        const parsed = schema.repost_remove_event_schema.safeParse(event)

        if (!parsed.success) {
            console.log(parsed.error);
            setSchemaError(monitor, parsed.error, sequence_number, KadeEvents.RepostRemove);
        }

        if (parsed.success) {
            const data = parsed.data
            try {
                await oracle.delete(repost).where(eq(repost.id, data.kid))
                monitor.setSuccess(sequence_number)
            }
            catch (e) {
                handleEitherPostgresOrUnkownError(sequence_number, monitor, e);
                console.log(`Something went wrong while processing data: ${e}`)
            }
        }
    }
}

export class QuoteCreateEventPlugin extends ProcessorPlugin {
    name(): string {
        return "QuoteCreateEvent"
    }
    async process(event: Record<string, any>, monitor: ProcessMonitor, sequence_number: string): Promise<void> {
        const parsed = schema.quote_create_event_schema.safeParse(event)

        if (!parsed.success) {
            console.log(parsed.error);
            setSchemaError(monitor, parsed.error, sequence_number, KadeEvents.QuoteCreate);
        }

        if (parsed.success) {
            const data = parsed.data

            try {
                await oracle.insert(quote).values({
                    content: JSON.parse(data.payload),
                    creator_id: data.user_kid,
                    id: data.kid,
                    publication_id: data.reference_kid,
                    timestamp: data.timestamp
                })
                monitor.setSuccess(sequence_number)
            }
            catch (e) {
                handleEitherPostgresOrUnkownError(sequence_number, monitor, e);
                console.log(`Something went wrong while processing data: ${e}`)
            }
        }
    }
}

export class QuoteRemoveEventPlugin extends ProcessorPlugin {
    name(): string {
        return "QuoteRemoveEvent"
    }
    async process(event: Record<string, any>, monitor: ProcessMonitor, sequence_number: string): Promise<void> {
        const parsed = schema.quote_remove_event_schema.safeParse(event)

        if (!parsed.success) {
            console.log(parsed.error)
            setSchemaError(monitor, parsed.error, sequence_number, KadeEvents.QuoteRemove);
        }

        if (parsed.success) {
            const data = parsed.data
            try {
                await oracle.delete(quote).where(eq(quote.id, data.kid))
                monitor.setSuccess(sequence_number)
            }
            catch (e) {
                handleEitherPostgresOrUnkownError(sequence_number, monitor, e);
                console.log(`Something went wrong while processing data: ${e}`)
            }
        }
    }
}

export class ReactionCreateEventPlugin extends ProcessorPlugin {
    name(): string {
        return "ReactionCreateEvent"
    }
    async process(event: Record<string, any>, monitor: ProcessMonitor, sequence_number: string): Promise<void> {
        const parsed = schema.reaction_create_event_schema.safeParse(event)

        if (!parsed.success) {
            console.log(parsed.error);
            setSchemaError(monitor, parsed.error, sequence_number, KadeEvents.ReactionCreate);
        }

        if (parsed.success) {
            const data = parsed.data

            try {
                await oracle.insert(reaction).values({
                    creator_id: data.user_kid,
                    id: data.kid,
                    reaction: data.reaction,
                    timestamp: data.timestamp,
                    ...(
                        data.type == 1 ? { publication_id: data.reference_kid } :
                            data.type == 2 ? { quote_id: data.reference_kid } :
                                data.type == 3 ? { comment_id: data.reference_kid } : {}
                    )
                })
                monitor.setSuccess(sequence_number)
            }
            catch (e) {
                handleEitherPostgresOrUnkownError(sequence_number, monitor, e);
                console.log(`Something went wrong while processing data: ${e}`)
            }
        }
    }
}

export class ReactionRemoveEventPlugin extends ProcessorPlugin {
    name(): string {
        return "ReactionRemoveEvent"
    }
    async process(event: Record<string, any>, monitor: ProcessMonitor, sequence_number: string): Promise<void> {
        const parsed = schema.reaction_remove_event_schema.safeParse(event)

        if (!parsed.success) {
            console.log(parsed.error)
            setSchemaError(monitor, parsed.error, sequence_number, KadeEvents.ReactionRemove);
        }

        if (parsed.success) {
            const data = parsed.data
            try {
                await oracle.delete(reaction).where(eq(reaction.id, data.kid))
                monitor.setSuccess(sequence_number)
            }
            catch (e) {
                handleEitherPostgresOrUnkownError(sequence_number, monitor, e);
                console.log(`Something went wrong while processing data: ${e}`)
            }
        }
    }
}