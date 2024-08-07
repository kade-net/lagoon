import protos, { aptos } from "@aptos-labs/aptos-protos";
import { LevelDB } from "../../db";

const MODULE_ADDRESS = process.env.MODULE_ADDRESS!

const COMMUNITY_MODULE_ADDRESS = process.env.COMMUNITY_MODULE_ADDRESS!

const USERNAME_MODULE = `${MODULE_ADDRESS}::usernames`
const ACCOUNT_MODULE = `${MODULE_ADDRESS}::accounts`
const PUBLICATION_MODULE = `${MODULE_ADDRESS}::publications`
const COMMUNITY_MODULE = `${COMMUNITY_MODULE_ADDRESS}::community`


const SUPPORTED_EVENT_TYPES = [
    // USERNAME
    `${USERNAME_MODULE}::RegisterUsernameEvent`,
    `${USERNAME_MODULE}::UserNameReclaimed`,
    // ACCOUNT
    `${ACCOUNT_MODULE}::AccountCreateEvent`,
    `${ACCOUNT_MODULE}::DelegateCreateEvent`,
    `${ACCOUNT_MODULE}::DelegateRemoveEvent`,
    `${ACCOUNT_MODULE}::AccountFollowEvent`,
    `${ACCOUNT_MODULE}::AccountUnFollowEvent`,
    `${ACCOUNT_MODULE}::ProfileUpdateEvent`,
    `${ACCOUNT_MODULE}::AccountDeleteEvent`,
    // PUBLICATIONS
    `${PUBLICATION_MODULE}::PublicationCreate`,
    `${PUBLICATION_MODULE}::PublicationRemove`,
    `${PUBLICATION_MODULE}::PublicationCreateWithRef`,
    `${PUBLICATION_MODULE}::PublicationRemoveWithRef`,
    `${PUBLICATION_MODULE}::ReactionRemoveEventWithRef`,
    `${PUBLICATION_MODULE}::ReactionCreateEventWithRef`,
    `${PUBLICATION_MODULE}::ReactionCreateEvent`,
    `${PUBLICATION_MODULE}::ReactionRemoveEvent`,
    // COMMUNITY
    `${COMMUNITY_MODULE}::CommunityRegisteredEvent`,
    `${COMMUNITY_MODULE}::CommunityUpdateEvent`,
    `${COMMUNITY_MODULE}::MemberJoinEvent`,
    `${COMMUNITY_MODULE}::MembershipChangeEvent`,
    `${COMMUNITY_MODULE}::MembershipDeleteEvent`,
    `${COMMUNITY_MODULE}::MembershipReclaimEvent`
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

            const hex_signature = userTransaction.request?.signature?.ed25519?.signature ?
                Buffer.from(userTransaction.request?.signature?.ed25519?.signature!).toString('hex') : ''

            if (!userTransaction.events) {
                continue
            }

            const events = userTransaction.events!;

            for (const event of events) {
                const eventType = event.typeStr;
                if (eventType && SUPPORTED_EVENT_TYPES.includes(eventType)) {
                    console.log("Processing event", eventType)
                    await db.put({
                        type: eventType?.split("::")?.at(2),
                        event: event.data,
                        signature: hex_signature,
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