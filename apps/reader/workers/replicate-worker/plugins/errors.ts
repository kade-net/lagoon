import { ZodError } from "zod";
import { LagoonError } from "../../error-worker/helpers";
import { PostgresErrors } from "../../error-worker/classify_error";
import { PostgresError } from "postgres";
import { ProcessMonitor } from "../monitor";

export enum KadeItems {
    Account = "account"
}

export enum KadeEvents {
    AccountCreate = "accountCreate",
    DelegateCreate = "delegateCreate",
    DelegateRemove = "delegateRemove",
    ReactionCreate = "reactionCreate",
    ReactionRemove = "reactionRemove",
    QuoteCreate = "quoteCreate",
    QuoteRemove = "quoteRemove",
    RepostCreate = "repostCreate",
    RepostRemove = "repostRemove",
    CommentCreate = "commentCreate",
    CommentRemove = "commentRemove",
    PublicationCreate = "publicationCreate",
    PublicationRemove = "publicationRemove",
    AccountFollow = "accountFollow",
    AccountUnfollow = "accountUnfollow",
    UsernameRegisteration = "usernameRegisteration",
    ProfileUpdate = "profileUpdate"
}

export class ItemNotExistError {
    item: string;

    constructor(item: KadeItems) {
        this.item = item;
    }
}

export class InterfaceError implements LagoonError {
    sequence_number: string;
    code: string;
    type: "schema_error" | "pg_error" | "unkown_error" | "item_not_exist_error";

    constructor(err: any, sequence_number: string, item?: KadeEvents) {
        this.sequence_number = sequence_number;

        // Handle depending on type of error
        if (err instanceof ZodError) {
            this.type = "schema_error";
            this.code = item!;
        } else if (err instanceof PostgresError) {
            this.code = err.code;
            this.type = "pg_error";
        } else if (err instanceof ItemNotExistError) {
            this.code = err.item;
            this.type = "item_not_exist_error"
        } else {
            this.code = "unknown"
            this.type = "unkown_error";
        }
    }
}

export function setPostgresError(monitor: ProcessMonitor, err: PostgresError, sequence_number: string) {
    const error = new InterfaceError(err, sequence_number);
    monitor.setFailed(sequence_number, JSON.stringify(error));
}

export function setSchemaError(monitor: ProcessMonitor, err: ZodError, sequence_number: string, item: KadeEvents) {
    const error = new InterfaceError(err, sequence_number, item);
    monitor.setFailed(sequence_number, JSON.stringify(error));
}

export function setItemNotExistError(monitor: ProcessMonitor, sequence_number: string, item: KadeItems) {
    const itemError = new ItemNotExistError(item);
    const error = new InterfaceError(itemError, sequence_number);
    monitor.setFailed(sequence_number, JSON.stringify(error));
}

export function setUnkownError(monitor: ProcessMonitor, err: any, sequence_number: string) {
    const error = new InterfaceError(err, sequence_number);
    monitor.setFailed(sequence_number, JSON.stringify(error));
}

export function handleEitherPostgresOrUnkownError(sequence_number: string, monitor: ProcessMonitor, e: any) {
    if (e instanceof PostgresError) {
        setPostgresError(monitor, e, sequence_number);
    } else {
        setUnkownError(monitor, e, sequence_number);
    }
}