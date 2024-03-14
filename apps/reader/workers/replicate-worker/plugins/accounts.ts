import schema from "../../../schema";
import { ProcessorPlugin, sleep } from "../helpers";
import oracle, { account, delegate, eq, follow, profile } from "oracle"
import { ProcessMonitor } from "../monitor";
import { InterfaceError, KadeEvents, KadeItems, handleEitherPostgresOrUnkownError, setItemNotExistError, setSchemaError } from "../../error-worker/errors";
import { PostgresError } from "postgres";
import { capture_event } from "posthog";
import { PostHogAppId, PostHogEvents } from "../../../posthog/events";


export class AccountCreatePlugin extends ProcessorPlugin {
    name(): string {
        return "AccountCreateEvent"
    }
    async process(event: Record<string, any>, monitor: ProcessMonitor, sequence_number: string): Promise<void> {
        const parsed = schema.account_create_event_schema.safeParse(event)
        if (!parsed.success) {
            setSchemaError(monitor, parsed.error, sequence_number, KadeEvents.AccountCreate);
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

                capture_event(PostHogAppId, PostHogEvents.REPLICATE_WORKER_SUCCESS, {
                    message: "success",
                    sequence_number: sequence_number,
                    event: "AccountCreateEvent"
                });
                monitor.setSuccess(sequence_number)
            }
            catch (e) {
                // Very hard to get Foreign Key error
                let item = "";
                let id = 0;
                handleEitherPostgresOrUnkownError(sequence_number, monitor, e, item, id);
            }
        }
    }
}


export class DelegateCreatePlugin extends ProcessorPlugin {
    name(): string {
        return "DelegateCreateEvent"
    }
    async process(event: Record<string, any>, monitor: ProcessMonitor, sequence_number: string): Promise<void> {
        const parsed = schema.delegate_create_event_schema.safeParse(event)
        if (!parsed.success) {
            setSchemaError(monitor, parsed.error, sequence_number, KadeEvents.DelegateCreate);
        }

        if (parsed.success) {
            const data = parsed.data

            try {
                const accounts = await oracle.query.account.findFirst({
                    where: (fields, { eq }) => eq(fields.address, data.owner_address)
                })

                if (accounts) {
                    await oracle.insert(delegate).values({
                        address: data.delegate_address,
                        id: data.kid,
                        owner_id: accounts?.id,
                        timestamp: data.timestamp
                    });
                    
                    capture_event(PostHogAppId, PostHogEvents.REPLICATE_WORKER_SUCCESS, {
                        message: "success",
                        sequence_number: sequence_number,
                        event: "DelegateCreateEvent"
                    });
                    monitor.setSuccess(sequence_number)
                }
                else {
                    await sleep(60_000);
                    const result = await oracle.select({
                        id: account.id
                    }).from(account).where(eq(account.address, data.owner_address));
                    let item = KadeItems.Account;
                    capture_event(PostHogAppId, PostHogEvents.REPLICATE_WORKER_SUCCESS, {
                        message: "Account with address not found",
                        address: data.owner_address
                    })
                    setItemNotExistError(monitor, sequence_number, KadeItems.Account, result[0].id);
                }
            }
            catch (e) {
                let item = "";
                let id = 0;

                if (e instanceof PostgresError) {
                    const result = await oracle.select({
                        id: account.id
                    }).from(account).where(eq(account.address, data.owner_address));
                    let item = KadeItems.Account;
                    let id = result[0].id
                }
                handleEitherPostgresOrUnkownError(sequence_number, monitor, e, item, id);
            }
        }
    }
}

export class DelegateRemovePlugin extends ProcessorPlugin {
    name(): string {
        return "DelegateRemoveEvent"
    }
    async process(event: Record<string, any>, monitor: ProcessMonitor, sequence_number: string): Promise<void> {
        const parsed = schema.delegate_remove_event_schema.safeParse(event)
        if (!parsed.success) {
            setSchemaError(monitor, parsed.error, sequence_number, KadeEvents.DelegateRemove);
        }

        if (parsed.success) {
            const data = parsed.data

            try {
                await oracle.delete(delegate).where(eq(delegate.id, data.kid))
                capture_event(PostHogAppId, PostHogEvents.REPLICATE_WORKER_SUCCESS, {
                    message: "success",
                    sequence_number: sequence_number,
                    event: "DelegateRemoveEvent"
                });
                monitor.setSuccess(sequence_number)
            }
            catch (e) {
                // Very hard to get Foreign Key error
                let item = "";
                let id = 0;
                handleEitherPostgresOrUnkownError(sequence_number, monitor, e, item, id);
            }
        }
    }
}

export class AccountFollowPlugin extends ProcessorPlugin {
    name(): string {
        return "AccountFollowEvent"
    }
    async process(event: Record<string, any>, monitor: ProcessMonitor, sequence_number: string): Promise<void> {
        const parsed = schema.account_follow_event_schema.safeParse(event)

        if (!parsed.success) {
            setSchemaError(monitor, parsed.error, sequence_number, KadeEvents.AccountFollow)
        }

        if (parsed.success) {
            const data = parsed.data

            try {
                await oracle.insert(follow).values({
                    id: data.kid,
                    follower_id: data.follower_kid,
                    following_id: data.following_kid,
                    timestamp: data.timestamp
                })
                capture_event(PostHogAppId, PostHogEvents.REPLICATE_WORKER_SUCCESS, {
                    message: "success",
                    sequence_number: sequence_number,
                    event: "AccountFollowEvent"
                });
                monitor.setSuccess(sequence_number)
            }
            catch (e) {
                let item = "";
                let id = 0;

                if (e instanceof PostgresError) {
                    if (e.detail?.includes("follower_id")) {
                        let item = KadeItems.Account;
                        let id = data.follower_kid
                    } else if (e.detail?.includes("following_id")) {
                        let item = KadeItems.Account;
                        let id = data.following_kid;
                    }
                }
                handleEitherPostgresOrUnkownError(sequence_number, monitor, e, item, id);
            }
        }
    }
}

export class AccountUnFollowPlugin extends ProcessorPlugin {
    name(): string {
        return "AccountUnFollowEvent"
    }
    async process(event: Record<string, any>, monitor: ProcessMonitor, sequence_number: string): Promise<void> {
        const parsed = schema.account_unfollow_event_schema.safeParse(event)

        if (!parsed.success) {
            setSchemaError(monitor, parsed.error, sequence_number, KadeEvents.AccountUnfollow);
        }

        if (parsed.success) {
            const data = parsed.data

            try {
                await oracle.delete(follow).where(eq(follow.id, data.kid))
                capture_event(PostHogAppId, PostHogEvents.REPLICATE_WORKER_SUCCESS, {
                    message: "success",
                    sequence_number: sequence_number,
                    event: "AccountUnFollowEvent"
                });
                monitor.setSuccess(sequence_number)
            }
            catch (e) {
                // Very hard to get Foreign Key error
                let item = "";
                let id = 0;
                handleEitherPostgresOrUnkownError(sequence_number, monitor, e, item, id);
            }
        }
    }
}

export class ProfileUpdatePlugin extends ProcessorPlugin {
    name(): string {
        return "ProfileUpdateEvent"
    }
    async process(event: Record<string, any>, monitor: ProcessMonitor, sequence_number: string): Promise<void> {
        const parsed = schema.profile_update_event_schema.safeParse(event)

        if (!parsed.success) {
            setSchemaError(monitor, parsed.error, sequence_number, KadeEvents.ProfileUpdate);
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
                capture_event(PostHogAppId, PostHogEvents.REPLICATE_WORKER_SUCCESS, {
                    message: "success",
                    sequence_number: sequence_number,
                    event: "AccountUnFollowEvent"
                });
                monitor.setSuccess(sequence_number)
            }
            catch (e) {
                let item = "";
                let id = 0;

                if (e instanceof PostgresError) {
                    if (e.detail?.includes("creator")) {
                        let item = KadeItems.Account;
                        let id = data.user_kid;
                    }
                }
                handleEitherPostgresOrUnkownError(sequence_number, monitor, e, item, id);
            }
        }
    }
}