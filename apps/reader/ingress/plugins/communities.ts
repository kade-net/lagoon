import { ServerUnaryCall, ServerWritableStream, events, sendUnaryData } from "@kade-net/tunnel";
import { EVENT_NAMES } from "../../workers/replicate-worker/helpers";
import { IngressPlugin } from "./definitions";
import schema from "../../schema";

export class MemberJoinPlugin extends IngressPlugin {
    name(): EVENT_NAMES {
        return "MemberJoinEvent";
    }
    extract(event: Record<string, any>, sequence_number: string): events.Event | null {
        const parsed = schema.member_join_event_schema.safeParse(event);

        if (!parsed.success) {
            return null;
        }

        if (parsed.success) {
            const data = parsed.data;
            const event = new events.Event({
                member_join_event: new events.MemberJoinEvent({
                    owner: data.owner,
                    community_name: data.community_name,
                    timestamp: data.timestamp.getTime(),
                    bid: data.bid,
                    type: data.type,
                    user_kid: data.user_kid,
                }),
                event_type: "MemberJoinEvent",
                sequence_number: parseInt(sequence_number),
            });
            return event;
        }
        return null;
    }

    async process(call: ServerWritableStream<events.EventsRequest, events.Event>, event: Record<string, any>, sequence_number: string) {
        const event_data = this.extract(event, sequence_number);

        if (event_data) {
            call.write(event_data, (err: any) => {
                if (err) {
                    console.log(err);
                }
            });
        } else {
            console.log("Error parsing event");
        }
    }

    async processSingle(callback: sendUnaryData<events.Event>, event: Record<string, any>, sequence_number: string) {
        const event_data = this.extract(event, sequence_number);

        if (event_data) {
            callback(null, event_data);
        } else {
            callback(new Error("Error parsing event"), null);
        }
    }
}

export class MembershipDeletePlugin extends IngressPlugin {

    name(): EVENT_NAMES {
        return "MembershipDeleteEvent";
    }

    extract(event: Record<string, any>, sequence_number: string): events.Event | null {
        const parsed = schema.membership_delete_event_schema.safeParse(event);

        if (!parsed.success) {
            return null;
        }

        if (parsed.success) {

            const data = parsed.data;

            const event = new events.Event({
                membership_delete_event: new events.MembershipDeleteEvent({
                    community_name: data.community_name,
                    community_id: data.community_id,
                    membership_id: data.membership_id,
                    user_kid: data.user_kid,
                    timestamp: data.timestamp.getTime(),
                }),
                event_type: "MembershipDeleteEvent",
                sequence_number: parseInt(sequence_number),

            });

            return event;

        }

        return null;

    }
    async process(call: ServerWritableStream<events.EventsRequest, events.Event>, event: Record<string, any>, sequence_number: string) {
        const event_data = this.extract(event, sequence_number);

        if (event_data) {
            call.write(event_data, (err: any) => {
                if (err) {
                    console.log(err);
                }
            });
        } else {
            console.log("Error parsing event");
        }
    }


    async processSingle(callback: sendUnaryData<events.Event>, event: Record<string, any>, sequence_number: string) {
        const event_data = this.extract(event, sequence_number);

        if (event_data) {
            callback(null, event_data);

        } else {
            callback(new Error("Error parsing event"), null);

        }
    }
}

export class CommunityRegisteredPlugin extends IngressPlugin {
    name(): EVENT_NAMES {
        return "CommunityRegisteredEvent";
    }
    extract(event: Record<string, any>, sequence_number: string): events.Event | null {
        const parsed = schema.community_registered_event_schema.safeParse(event);

        if (!parsed.success) {
            return null;
        }

        if (parsed.success) {

            const data = parsed.data;

            const event = new events.Event({
                community_registered_event: new events.CommunityRegisteredEvent({
                    name: data.name,
                    timestamp: data.timestamp.getTime(),
                    creator: data.creator,
                    bid: data.bid,
                    image: data.image,
                    description: data.description,
                    user_kid: data.user_kid,
                }),
                event_type: "CommunityRegisteredEvent",
                sequence_number: parseInt(sequence_number),
            });

            return event;

        }

        return null;
    }

    async process(call: ServerWritableStream<events.EventsRequest, events.Event>, event: Record<string, any>, sequence_number: string
    ) {
        const event_data = this.extract(event, sequence_number);
        if (event_data) {
            call.write(event_data, (err: any) => {
                if (err) {
                    console.log(err);
                }
            });
        } else {
            console.log("Error parsing event");
        }
    }

    async processSingle(callback: sendUnaryData<events.Event>, event: Record<string, any>, sequence_number: string) {
        const event_data = this.extract(event, sequence_number);

        if (event_data) {
            callback(null, event_data);
        } else {
            callback(new Error("Error parsing event"), null);
        }
    }

}

export class MembershipReclaimPlugin extends IngressPlugin {
    name(): EVENT_NAMES {
        return "MembershipReclaimEvent";
    }

    extract(event: Record<string, any>, sequence_number: string): events.Event | null {
        const parsed = schema.membership_reclaim_event_schema.safeParse(event);

        if (!parsed.success) {
            return null;
        }

        if (parsed.success) {
            const data = parsed.data;

            const event = new events.Event({
                membership_reclaim_event: new events.MembershipReclaimEvent({
                    membership_id: data.membership_id,
                    community_id: data.community_id,
                    user_kid: data.user_kid,
                    timestamp: data.timestamp.getTime(),
                }),
                event_type: "MembershipReclaimEvent",
                sequence_number: parseInt(sequence_number),
            });

            return event;

        }

        return null;

    }

    async process(call: ServerWritableStream<events.EventsRequest, events.Event>, event: Record<string, any>, sequence_number: string) {
        const event_data = this.extract(event, sequence_number);

        if (event_data) {
            call.write(event_data, (err: any) => {
                if (err) {
                    console.log(err);
                }
            });

        } else {

            console.log("Error parsing event");
        }
    }

    async processSingle(callback: sendUnaryData<events.Event>, event: Record<string, any>, sequence_number: string) {
        const event_data = this.extract(event, sequence_number);

        if (event_data) {
            callback(null, event_data);
        } else {

            callback(new Error("Error parsing event"), null);

        }
    }

}

export class MembershipChangePlugin extends IngressPlugin {

    name(): EVENT_NAMES {
        return "MembershipChangeEvent";
    }

    extract(event: Record<string, any>, sequence_number: string): events.Event | null {
        const parsed = schema.membership_change_event_schema.safeParse(event);

        if (!parsed.success) {
            return null;
        }

        if (parsed.success) {

            const data = parsed.data;

            const event = new events.Event({
                membership_change_event: new events.MembershipChangeEvent({
                    membership_id: data.membership_id,
                    community_id: data.community_id,
                    user_kid: data.user_kid,
                    timestamp: data.timestamp.getTime(),
                    type: data.type,
                    made_by: data.made_by,
                    community_name: data.community_name,
                    membership_owner: data.membership_owner,

                }),
                event_type: "MembershipChangeEvent",
                sequence_number: parseInt(sequence_number),

            });

            return event;

        }

        return null;
    }

    async process(call: ServerWritableStream<events.EventsRequest, events.Event>, event: Record<string, any>, sequence_number: string) {
        const event_data = this.extract(event, sequence_number);

        if (event_data) {
            call.write(event_data, (err: any) => {
                if (err) {
                    console.log(err);
                }
            });

        } else {

            console.log("Error parsing event");
        }

    }
    async processSingle(callback: sendUnaryData<events.Event>, event: Record<string, any>, sequence_number: string) {
        const event_data = this.extract(event, sequence_number);

        if (event_data) {
            callback(null, event_data);
        } else {
            callback(new Error("Error parsing event"), null);
        }
    }
}
export class CommunityUpdatePlugin extends IngressPlugin {
    name(): EVENT_NAMES {
        return "CommunityUpdateEvent";
    }

    extract(event: Record<string, any>, sequence_number: string): events.Event | null {
        const parsed = schema.community_update_event_schema.safeParse(event);

        if (!parsed.success) {
            return null;
        }

        if (parsed.success) {

            const data = parsed.data;

            const event = new events.Event({
                community_update_event: new events.CommunityUpdateEvent({
                    name: data.name,
                    timestamp: data.timestamp.getTime(),
                    display_name: data.display_name,
                    bid: data.bid,
                    image: data.image,
                    description: data.description,
                    user_kid: data.user_kid,
                }),

                event_type: "CommunityUpdateEvent",
                sequence_number: parseInt(sequence_number),
            });

            return event;

        }

        return null;
    }

    async process(call: ServerWritableStream<events.EventsRequest, events.Event>, event: Record<string, any>, sequence_number: string) {
        const event_data = this.extract(event, sequence_number);

        if (event_data) {
            call.write(event_data, (err: any) => {
                if (err) {
                    console.log(err);
                }
            });

        } else {
            console.log("Error parsing event");
        }
    }

    async processSingle(callback: sendUnaryData<events.Event>, event: Record<string, any>, sequence_number: string) {
        const event_data = this.extract(event, sequence_number);

        if (event_data) {
            callback(null, event_data);

        } else {
            callback(new Error("Error parsing event"), null);
        }
    }
}