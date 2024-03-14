import { ZodError, z } from "zod";
import { LagoonError, LagoonTypeSchema } from "./helpers";
import { PostgresError } from "postgres";
import { ProcessMonitor } from "../replicate-worker/monitor";

export enum KadeItems {
    Account = "account",
    Publication = "publication",
    Quote = "quote",
    Comment = "comment"
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
    id: number;

    constructor(item: KadeItems, id: number) {
        this.item = item;
        this.id = id;
    }
}

class MyPostgresError {
    code: string;
    item: string;
    id: number;

    constructor (code: string, item: string, id: number) {
        this.code = code;
        this.item = item;
        this.id = id;
    }
}

export class InterfaceError implements LagoonError {
    sequence_number: string;
    code: string;
    type: z.infer<typeof LagoonTypeSchema>
    id: number;
    item: string

    static init(err: any, sequence_number: string, item?: KadeEvents): InterfaceError {
        let type: z.infer<typeof LagoonTypeSchema>;
        let code;
        let id;
        let errorItem;

        // Handle depending on type of error
        if (err instanceof ZodError) {
            type = "schema_error";
            code = item!;
            id = 0;
            errorItem = "";
        } else if (err instanceof MyPostgresError) {
            code = err.code;
            type = "pg_error";
            id = err.id;
            errorItem = err.item;
        } else if (err instanceof ItemNotExistError) {
            code = err.item;
            type = "item_not_exist_error"
            id = err.id;
            errorItem = "";
        } else {
            code = "unknown"
            type = "unkown_error";
            id = 0;
            errorItem = "";
        }

        return new InterfaceError(sequence_number, code, type, id, errorItem);
    }

    constructor(sequence_number: string, code: string, type: z.infer<typeof LagoonTypeSchema>, id: number, item: string) {
        this.code = code;
        this.sequence_number = sequence_number;
        this.type = type;
        this.id = id;
        this.item = item;
    }
}

export function setPostgresError(monitor: ProcessMonitor, err: PostgresError, sequence_number: string, item: string, id: number) {
    const pgError = new MyPostgresError(err.code, item, id);
    const error = InterfaceError.init(pgError, sequence_number);
    monitor.setFailed(sequence_number, JSON.stringify(error));
}

export function setSchemaError(monitor: ProcessMonitor, err: ZodError, sequence_number: string, item: KadeEvents) {
    const error = InterfaceError.init(err, sequence_number, item);
    monitor.setFailed(sequence_number, JSON.stringify(error));
}

export function setItemNotExistError(monitor: ProcessMonitor, sequence_number: string, item: KadeItems, id: number) {
    const itemError = new ItemNotExistError(item, id);
    const error = InterfaceError.init(itemError, sequence_number);
    monitor.setFailed(sequence_number, JSON.stringify(error));
}

export function setUnkownError(monitor: ProcessMonitor, err: any, sequence_number: string) {
    const error = InterfaceError.init(err, sequence_number);
    monitor.setFailed(sequence_number, JSON.stringify(error));
}

export function handleEitherPostgresOrUnkownError(sequence_number: string, monitor: ProcessMonitor, e: any, item: string, id: number) {
    if (e instanceof PostgresError) {
        setPostgresError(monitor, e, sequence_number, item, id);
    } else {
        setUnkownError(monitor, e, sequence_number);
    }
}