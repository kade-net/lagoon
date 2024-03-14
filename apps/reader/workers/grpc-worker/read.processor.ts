import protos, { aptos } from "@aptos-labs/aptos-protos";
import { LevelDB } from "../../db";
import { capture_event } from "posthog";
import { PostHogAppId, PostHogEvents } from "../../posthog/events";

const MODULE_ADDRESS = process.env.MODULE_ADDRESS!

const USERNAME_MODULE = `${MODULE_ADDRESS}::usernames`
const ACCOUNT_MODULE = `${MODULE_ADDRESS}::accounts`
const PUBLICATION_MODULE = `${MODULE_ADDRESS}::publications`


const SUPPORTED_EVENT_TYPES = [
    // USERNAME
    `${USERNAME_MODULE}::RegisterUsernameEvent`,
    // ACCOUNT
    `${ACCOUNT_MODULE}::AccountCreateEvent`,
    `${ACCOUNT_MODULE}::DelegateCreateEvent`,
    `${ACCOUNT_MODULE}::DelegateRemoveEvent`,
    `${ACCOUNT_MODULE}::AccountFollowEvent`,
    `${ACCOUNT_MODULE}::AccountUnFollowEvent`,
    `${ACCOUNT_MODULE}::ProfileUpdateEvent`,
    // PUBLICATIONS
    `${PUBLICATION_MODULE}::PublicationCreate`,
    `${PUBLICATION_MODULE}::PublicationRemove`,
    `${PUBLICATION_MODULE}::CommentCreateEvent`,
    `${PUBLICATION_MODULE}::CommentRemoveEvent`,
    `${PUBLICATION_MODULE}::RepostCreateEvent`,
    `${PUBLICATION_MODULE}::RepostRemoveEvent`,
    `${PUBLICATION_MODULE}::QuoteCreateEvent`,
    `${PUBLICATION_MODULE}::QuoteRemoveEvent`,
    `${PUBLICATION_MODULE}::ReactionCreateEvent`,
    `${PUBLICATION_MODULE}::ReactionRemoveEvent`,
]

export type ProcessingResult = {
    startVersion: bigint;
    endVersion: bigint;
};

export abstract class TransactionsProcessor {

    abstract name(): string;


    abstract processTransactions({
        transactions,
        startVersion,
        endVersion,
        db
    }: {
        transactions: aptos.transaction.v1.Transaction[];
        startVersion: bigint;
        endVersion: bigint;
        db: LevelDB
    }): Promise<ProcessingResult>;

}


export class ReadProcessor extends TransactionsProcessor {
    name(): string {
        return "read_processor";
    }

    async processTransactions({
        transactions,
        startVersion,
        endVersion,
        db
    }: {
        transactions: aptos.transaction.v1.Transaction[];
        startVersion: bigint;
        endVersion: bigint;
        db: LevelDB
    }): Promise<ProcessingResult> {
        for (const transaction of transactions) {

            if (transaction.type != protos.aptos.transaction.v1.Transaction_TransactionType.TRANSACTION_TYPE_USER) {
                continue
            }

            const userTransaction = transaction.user!;

            if (!userTransaction.events) {
                continue
            }

            const events = userTransaction.events!;

            for (const event of events) {
                const eventType = event.typeStr;
                if (eventType && SUPPORTED_EVENT_TYPES.includes(eventType)) {
                    capture_event(PostHogAppId, PostHogEvents.GRPC_READ_PROCESSOR, {
                        message: "Processing event",
                        eventType: eventType
                    })
                    await db.put({
                        type: eventType?.split("::")?.at(2),
                        event: event.data
                    })
                }
            }

        }
        return {
            startVersion,
            endVersion
        };
    }
}