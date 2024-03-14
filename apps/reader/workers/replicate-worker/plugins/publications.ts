import oracle, { comment, eq, publication, quote, reaction, repost } from "oracle"
import schema from "../../../schema"
import { ProcessorPlugin } from "../helpers"
import { ProcessMonitor } from "../monitor"
import { KadeEvents, KadeItems, handleEitherPostgresOrUnkownError, setSchemaError } from "../../error-worker/errors"
import { PostgresError } from "postgres"
import { capture_event } from "posthog"
import { PostHogAppId, PostHogEvents } from "../../../posthog/events"


export class PublicationCreateEventPlugin extends ProcessorPlugin {
    name(): string {
        return "PublicationCreate"
    }
    async process(event: Record<string, any>, monitor: ProcessMonitor, sequence_number: string): Promise<void> {
        const parsed = schema.publication_create_event_schema.safeParse(event)
        if (!parsed.success) {
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
                capture_event(PostHogAppId, PostHogEvents.REPLICATE_WORKER_ACCOUNT_PUBLICATION_ERROR, {
                    message: "success",
                    sequence_number: sequence_number,
                    event: "PublicationCreate"
                });
                monitor.setSuccess(sequence_number)
            }
            catch (e) {
                handleEitherPostgresOrUnkownError(sequence_number, monitor, e, KadeItems.Account, data.user_kid);
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
            setSchemaError(monitor, parsed.error, sequence_number, KadeEvents.PublicationRemove);
        }

        if (parsed.success) {
            const data = parsed.data

            try {
                await oracle.delete(publication).where(eq(publication.id, data.kid))
                capture_event(PostHogAppId, PostHogEvents.REPLICATE_WORKER_ACCOUNT_PUBLICATION_ERROR, {
                    message: "success",
                    sequence_number: sequence_number,
                    event: "PublicationRemoveEvent"
                });
                monitor.setSuccess(sequence_number)
            }
            catch (e) {
                // I think its very hard to get foreign key violation in this case so there is no need to provide item and id
                handleEitherPostgresOrUnkownError(sequence_number, monitor, e, "", 1);
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
                });
                capture_event(PostHogAppId, PostHogEvents.REPLICATE_WORKER_ACCOUNT_PUBLICATION_ERROR, {
                    message: "success",
                    sequence_number: sequence_number,
                    event: "CommentCreateEvent"
                });
                monitor.setSuccess(sequence_number)
            }
            catch (e) {
                let item = "";
                let id = 0;

                if (e instanceof PostgresError) {
                    // Try getting item that could have been missing
                    if (e.detail?.includes("publication_id")) {
                        item = KadeItems.Publication;
                        id = data.reference_kid;
                    } else if (e.detail?.includes("quote_id")) {
                        item = KadeItems.Quote,
                            id = data.reference_kid;
                    } else if (e.detail?.includes("creator_id")) {
                        item = KadeItems.Account,
                            id = data.reference_kid;
                    }
                }

                handleEitherPostgresOrUnkownError(sequence_number, monitor, e, item, id);
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
            setSchemaError(monitor, parsed.error, sequence_number, KadeEvents.CommentRemove);
        }

        if (parsed.success) {
            const data = parsed.data

            try {
                await oracle.delete(comment).where(eq(comment.id, data.kid))
                capture_event(PostHogAppId, PostHogEvents.REPLICATE_WORKER_ACCOUNT_PUBLICATION_ERROR, {
                    message: "success",
                    sequence_number: sequence_number,
                    event: "CommentRemoveEvent"
                });
                monitor.setSuccess(sequence_number)
            }
            catch (e) {
                // Very hard for a foreign key error to occur here so no need to set item and id
                let item = "";
                let id = 0;
                handleEitherPostgresOrUnkownError(sequence_number, monitor, e, item, id);
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
                });
                capture_event(PostHogAppId, PostHogEvents.REPLICATE_WORKER_ACCOUNT_PUBLICATION_ERROR, {
                    message: "success",
                    sequence_number: sequence_number,
                    event: "RepostCreateEvent"
                });
                monitor.setSuccess(sequence_number)
            }
            catch (e) {
                let item = "";
                let id = 0;

                if (e instanceof PostgresError) {
                    if (e.detail?.includes("publication_id")) {
                        item = KadeItems.Publication;
                        id = data.reference_kid;
                    } else if (e.detail?.includes("creator_id")) {
                        item = KadeItems.Account;
                        id = data.user_kid;
                    }
                }

                handleEitherPostgresOrUnkownError(sequence_number, monitor, e, item, id);
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
            setSchemaError(monitor, parsed.error, sequence_number, KadeEvents.RepostRemove);
        }

        if (parsed.success) {
            const data = parsed.data
            try {
                await oracle.delete(repost).where(eq(repost.id, data.kid))
                capture_event(PostHogAppId, PostHogEvents.REPLICATE_WORKER_ACCOUNT_PUBLICATION_ERROR, {
                    message: "success",
                    sequence_number: sequence_number,
                    event: "RepostRemoveEvent"
                });
                monitor.setSuccess(sequence_number)
            }
            catch (e) {
                // Very hard to get foreign key error so no need to set item and id
                let item = "";
                let id = 0;
                handleEitherPostgresOrUnkownError(sequence_number, monitor, e, item, id);
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
                capture_event(PostHogAppId, PostHogEvents.REPLICATE_WORKER_ACCOUNT_PUBLICATION_ERROR, {
                    message: "success",
                    sequence_number: sequence_number,
                    event: "QuoteCreateEvent"
                });
                monitor.setSuccess(sequence_number)
            }
            catch (e) {
                let item = "";
                let id = 0;

                if (e instanceof PostgresError) {
                    if (e.detail?.includes("publication_id")) {
                        item = KadeItems.Publication;
                        id = data.reference_kid;
                    } else if (e.detail?.includes("creator_id")) {
                        item = KadeItems.Account;
                        id = data.user_kid;
                    }
                }

                handleEitherPostgresOrUnkownError(sequence_number, monitor, e, item, id);
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
            setSchemaError(monitor, parsed.error, sequence_number, KadeEvents.QuoteRemove);
        }

        if (parsed.success) {
            const data = parsed.data
            try {
                await oracle.delete(quote).where(eq(quote.id, data.kid))
                capture_event(PostHogAppId, PostHogEvents.REPLICATE_WORKER_ACCOUNT_PUBLICATION_ERROR, {
                    message: "success",
                    sequence_number: sequence_number,
                    event: "QuoteRemoveEvent"
                });
                monitor.setSuccess(sequence_number)
            }
            catch (e) {
                // Very hard to get Foreign Key error so no need to set item and id
                let item = "";
                let id = 0;
                handleEitherPostgresOrUnkownError(sequence_number, monitor, e, item, id);
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
                capture_event(PostHogAppId, PostHogEvents.REPLICATE_WORKER_ACCOUNT_PUBLICATION_ERROR, {
                    message: "success",
                    sequence_number: sequence_number,
                    event: "ReactionCreateEvent"
                });
                monitor.setSuccess(sequence_number)
            }
            catch (e) {
                let item = "";
                let id = 0;

                if (e instanceof PostgresError) {
                    if (e.detail?.includes("publication_id")) {
                        item = KadeItems.Publication;
                        id = data.reference_kid;
                    } else if (e.detail?.includes("creator_id")) {
                        item = KadeItems.Account;
                        id = data.user_kid;
                    } else if (e.detail?.includes("comment_id")) {
                        item = KadeItems.Comment;
                        id = data.reference_kid;
                    }
                }

                handleEitherPostgresOrUnkownError(sequence_number, monitor, e, item, id);
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
            setSchemaError(monitor, parsed.error, sequence_number, KadeEvents.ReactionRemove);
        }

        if (parsed.success) {
            const data = parsed.data
            try {
                await oracle.delete(reaction).where(eq(reaction.id, data.kid))
                capture_event(PostHogAppId, PostHogEvents.REPLICATE_WORKER_ACCOUNT_PUBLICATION_ERROR, {
                    message: "success",
                    sequence_number: sequence_number,
                    event: "ReactionRemoveEvent"
                });
                monitor.setSuccess(sequence_number)
            }
            catch (e) {
                // Very hard to get Foreign key error
                let item = "";
                let id = 0;
                handleEitherPostgresOrUnkownError(sequence_number, monitor, e, item, id);
            }
        }
    }
}