import "dotenv/config";
import { Lama } from "./db/lama";
import lmdb from "node-lmdb";
import _ from "lodash";
import schema from "./schema";
const {isNull} = _;

const addressSize = 66;
const addressTransfomer = (p: string) => {
    const address = p
    // Check if address is less than 66 char long
    if (typeof p == 'string' && p.length < addressSize) {
        // Add the necessary padding
        let paddingAmount = addressSize - p.length;

        // Add padding
        let padding = "0".repeat(paddingAmount);
        const newAddress = p.replace("0x", "0x" + padding);
        return newAddress;
    }
    return address
}

const DEBUG_MODE = process.env.DEBUG_MODE === "true";

// Function returns events that should be updated
async function getEventsToBeUpdated() {
    let env_name;
    if (DEBUG_MODE) {
        env_name="test_env";
    } else {
        env_name="events";
    }

    console.log("Processing events from lama");

    let lama = await Lama.init(env_name);
    let env = lama.env;
    let dbi = lama.dbi;
    let txn = env.beginTxn();
    let cursor = new lmdb.Cursor(txn, dbi);

    try {
        let error = false;
        for(let found = cursor.goToFirst(); found != null; found = cursor.goToNext()) {
            if (error === true) {
                break;
            }
            
            let value = cursor.getCurrentBinary();
            

            if (value != null && !isNull(value)) {
                let json = JSON.parse(value.toString());
                let parsed;

                console.log("Type => ", json['type']);
                switch(json['type']) {
                    case "AccountCreateEvent":
                        parsed = schema.account_create_event_schema.safeParse(json['event']);

                        if (!parsed.success) {
                            console.log(parsed.error, "Error Parsing JSON");
                            error = true;
                        } else {
                            let data = parsed.data;
                            console.log("Parsing this data => ", data);

                            data.creator_address = addressTransfomer(data.creator_address);

                            txn.putBinary(dbi, found, Buffer.from(JSON.stringify(data)));
                        }
                        break;

                    case "AccountFollowEvent":
                        parsed = schema.account_follow_event_schema.safeParse(json['event']);

                        if (!parsed.success) {
                            console.log(parsed.error, "Error Parsing JSON");
                            error = true;
                        } else {
                            let data = parsed.data;
                            console.log("Parsing this data => ", data);

                            data.follower = addressTransfomer(data.follower);
                            data.following = addressTransfomer(data.following);

                            txn.putBinary(dbi, found, Buffer.from(JSON.stringify(data)));
                        }
                        break;

                    case "UsernameRegistrationEvent":
                        parsed = schema.username_registration_event_schema.safeParse(json['event']);

                        if (!parsed.success) {
                            console.log(parsed.error, "Error Parsing JSON");
                            error = true;
                        } else {
                            let data = parsed.data;
                            console.log("Parsing this data => ", data);

                            data.owner_address = addressTransfomer(data.owner_address);

                            txn.putBinary(dbi, found, Buffer.from(JSON.stringify(data)));
                        }
                        break;

                    case "CommunityRegisteredEvent":
                        parsed = schema.community_registered_event_schema.safeParse(json['event']);

                        if (!parsed.success) {
                            console.log(parsed.error, "Error Parsing JSON");
                            error = true;
                        } else {
                            let data = parsed.data;
                            console.log("Parsing this data => ", data);

                            data.creator = addressTransfomer(data.creator);

                            txn.putBinary(dbi, found, Buffer.from(JSON.stringify(data)));
                        }
                        break;

                    case "MemberJoinEvent":
                        parsed = schema.member_join_event_schema.safeParse(json['event']);

                        if (!parsed.success) {
                            console.log(parsed.error, "Error Parsing JSON");
                            error = true;
                        } else {
                            let data = parsed.data;
                            console.log("Parsing this data => ", data);

                            data.owner = addressTransfomer(data.owner);

                            txn.putBinary(dbi, found, Buffer.from(JSON.stringify(data)));
                        }
                        break;

                    default:
                        console.log("Type not supported");
                        break;
                }
            }
        }
        txn.commit()
        cursor.close()
        console.log("\n\nUpdating Event Store Done\n\n");
    } catch(err) {
        console.log(err, "Could Not Update Store");
    }
}

getEventsToBeUpdated()