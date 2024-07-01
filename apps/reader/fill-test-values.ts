import { Lama } from "./db/lama"

// Insert events in test 
async function fillTestValues() {
    let lama = await Lama.init('test_env');
    let env = lama.env;
    let dbi = lama.dbi;

    try {
        
        // Enter event types that our data should not touch
        let options;
        env.batchWrite([
            [dbi, "1", Buffer.from(JSON.stringify({type: "MemberJoinEvent", event: {owner: "0x69c18fb0d693ec30118535e3852763034a595977daa6ebeead254e5f54a7bd1", community_name: "test", bid: "1", type: "2", user_kid: "1", timestamp: "1711037972"}, signature: ""}))],
            [dbi, "2", Buffer.from(JSON.stringify({type: "MembershipDeleteEvent", event: {community_name: "Test", community_id: "1", membership_id: "1", user_kid: "1", timestamp: "1711037972"}, signature: ""}))],
            [dbi, "3", Buffer.from(JSON.stringify({type: "MembershipReclaimEvent", event: {community_id: "1", membership_id: "1", user_kid: "1", timestamp: "1711037972"}, signature: ""}))],
            [dbi, "4", Buffer.from(JSON.stringify({type: "CommunityUpdateEvent", event: {name: "test", description: "test", image: "test", display_name: "tes", bid: "est", user_kid: "1", timestamp: "1711037972"}, signature: ""}))],

            // account_create with everything ok,
            // then both creator_address and account_object_address wrong,
            // then only creator_address wrong
            // then only account_object_address_wrong
            [dbi, "5", Buffer.from(JSON.stringify({type: "AccountCreateEvent", event: {username: "alice", creator_address: "0x6d85963d424e44a6a85912d941997cb3f2bc8ae4fc74e32e9ac56b1501023ff8", account_object_address: "0x6d85963d424e44a6a85912d941997cb3f2bc8ae4fc74e32e9ac56b1501023ff8", kid: "1", timestamp: "1711037972"}, signature: ""}))],
            [dbi, "6", Buffer.from(JSON.stringify({type: "AccountCreateEvent", event: {username: "bob", creator_address: "0x69c18fb0d693ec30118535e3852763034a595977daa6ebeead254e5f54a7bd1", account_object_address: "0x69c18fb0d693ec30118535e3852763034a595977daa6ebeead254e5f54a7bd1", kid: "1", timestamp: "1711037972"}, signature: ""}))],
            [dbi, "7", Buffer.from(JSON.stringify({type: "AccountCreateEvent", event: {username: "ray", creator_address: "0x69c18fb0d693ec30118535e3852763034a595977daa6ebeead254e5f54a7bd1", account_object_address: "0x6d85963d424e44a6a85912d941997cb3f2bc8ae4fc74e32e9ac56b1501023ff8", kid: "1", timestamp: "1711037972"}, signature: ""}))],
            [dbi, "8", Buffer.from(JSON.stringify({type: "AccountCreateEvent", event: {username: "don", creator_address: "0x6d85963d424e44a6a85912d941997cb3f2bc8ae4fc74e32e9ac56b1501023ff8", account_object_address: "0x69c18fb0d693ec30118535e3852763034a595977daa6ebeead254e5f54a7bd1", kid: "1", timestamp: "1711037972"}, signature: ""}))],

            // delegate create event with everything okay
            // owner_address and object_address and delegate_address wrong
            // only owner_address wrong
            // only object_address wrong
            // only delegate_address wrong
            [dbi, "9", Buffer.from(JSON.stringify({type: "DelegateCreateEvent", event: {owner_address: "0x6d85963d424e44a6a85912d941997cb3f2bc8ae4fc74e32e9ac56b1501023ff8", object_address: "0x6d85963d424e44a6a85912d941997cb3f2bc8ae4fc74e32e9ac56b1501023ff8", delegate_address: "0x6d85963d424e44a6a85912d941997cb3f2bc8ae4fc74e32e9ac56b1501023ff8",kid: "1", timestamp: "1711037972"}, signature: ""}))],
            [dbi, "10", Buffer.from(JSON.stringify({type: "DelegateCreateEvent", event: {owner_address: "0x69c18fb0d693ec30118535e3852763034a595977daa6ebeead254e5f54a7bd1", object_address: "0x69c18fb0d693ec30118535e3852763034a595977daa6ebeead254e5f54a7bd1", delegate_address: "0x69c18fb0d693ec30118535e3852763034a595977daa6ebeead254e5f54a7bd1",kid: "1", timestamp: "1711037972"}, signature: ""}))],
            [dbi, "11", Buffer.from(JSON.stringify({type: "DelegateCreateEvent", event: {owner_address: "0x69c18fb0d693ec30118535e3852763034a595977daa6ebeead254e5f54a7bd1", object_address: "0x6d85963d424e44a6a85912d941997cb3f2bc8ae4fc74e32e9ac56b1501023ff8", delegate_address: "0x6d85963d424e44a6a85912d941997cb3f2bc8ae4fc74e32e9ac56b1501023ff8",kid: "1", timestamp: "1711037972"}, signature: ""}))],
            [dbi, "12", Buffer.from(JSON.stringify({type: "DelegateCreateEvent", event: {owner_address: "0x6d85963d424e44a6a85912d941997cb3f2bc8ae4fc74e32e9ac56b1501023ff8", object_address: "0x69c18fb0d693ec30118535e3852763034a595977daa6ebeead254e5f54a7bd1", delegate_address: "0x6d85963d424e44a6a85912d941997cb3f2bc8ae4fc74e32e9ac56b1501023ff8",kid: "1", timestamp: "1711037972"}, signature: ""}))],
            [dbi, "13", Buffer.from(JSON.stringify({type: "DelegateCreateEvent", event: {owner_address: "0x6d85963d424e44a6a85912d941997cb3f2bc8ae4fc74e32e9ac56b1501023ff8", object_address: "0x6d85963d424e44a6a85912d941997cb3f2bc8ae4fc74e32e9ac56b1501023ff8", delegate_address: "0x69c18fb0d693ec30118535e3852763034a595977daa6ebeead254e5f54a7bd1",kid: "1", timestamp: "1711037972"}, signature: ""}))],

            // delegate remove event with everything okay
            // owner_address and object_address and delegate_address wrong
            // only owner_address wrong
            // only object_address wrong
            // only delegate_address wrong
            [dbi, "14", Buffer.from(JSON.stringify({type: "DelegateRemoveEvent", event: {owner_address: "0x6d85963d424e44a6a85912d941997cb3f2bc8ae4fc74e32e9ac56b1501023ff8", object_address: "0x6d85963d424e44a6a85912d941997cb3f2bc8ae4fc74e32e9ac56b1501023ff8", delegate_address: "0x6d85963d424e44a6a85912d941997cb3f2bc8ae4fc74e32e9ac56b1501023ff8",kid: "1", timestamp: "1711037972"}, signature: ""}))],
            [dbi, "15", Buffer.from(JSON.stringify({type: "DelegateRemoveEvent", event: {owner_address: "0x69c18fb0d693ec30118535e3852763034a595977daa6ebeead254e5f54a7bd1", object_address: "0x69c18fb0d693ec30118535e3852763034a595977daa6ebeead254e5f54a7bd1", delegate_address: "0x69c18fb0d693ec30118535e3852763034a595977daa6ebeead254e5f54a7bd1",kid: "1", timestamp: "1711037972"}, signature: ""}))],
            [dbi, "16", Buffer.from(JSON.stringify({type: "DelegateRemoveEvent", event: {owner_address: "0x69c18fb0d693ec30118535e3852763034a595977daa6ebeead254e5f54a7bd1", object_address: "0x6d85963d424e44a6a85912d941997cb3f2bc8ae4fc74e32e9ac56b1501023ff8", delegate_address: "0x6d85963d424e44a6a85912d941997cb3f2bc8ae4fc74e32e9ac56b1501023ff8",kid: "1", timestamp: "1711037972"}, signature: ""}))],
            [dbi, "17", Buffer.from(JSON.stringify({type: "DelegateRemoveEvent", event: {owner_address: "0x6d85963d424e44a6a85912d941997cb3f2bc8ae4fc74e32e9ac56b1501023ff8", object_address: "0x69c18fb0d693ec30118535e3852763034a595977daa6ebeead254e5f54a7bd1", delegate_address: "0x6d85963d424e44a6a85912d941997cb3f2bc8ae4fc74e32e9ac56b1501023ff8",kid: "1", timestamp: "1711037972"}, signature: ""}))],
            [dbi, "18", Buffer.from(JSON.stringify({type: "DelegateRemoveEvent", event: {owner_address: "0x6d85963d424e44a6a85912d941997cb3f2bc8ae4fc74e32e9ac56b1501023ff8", object_address: "0x6d85963d424e44a6a85912d941997cb3f2bc8ae4fc74e32e9ac56b1501023ff8", delegate_address: "0x69c18fb0d693ec30118535e3852763034a595977daa6ebeead254e5f54a7bd1",kid: "1", timestamp: "1711037972"}, signature: ""}))],

            // reaction create event with everyting okay
            // delegate wrong
            [dbi, "19", Buffer.from(JSON.stringify({type: "ReactionCreateEvent", event: {kid: "1", user_kid: "1", delegate: "0x6d85963d424e44a6a85912d941997cb3f2bc8ae4fc74e32e9ac56b1501023ff8", reaction: "o", reference_kid: "1", timestamp: "1711037972"}, signature: ""}))],
            [dbi, "20", Buffer.from(JSON.stringify({type: "ReactionCreateEvent", event: {kid: "1", user_kid: "1", delegate: "0x69c18fb0d693ec30118535e3852763034a595977daa6ebeead254e5f54a7bd1", reaction: "o", reference_kid: "1", timestamp: "1711037972"}, signature: ""}))],

            // reaction remove event with everything okay
            // delegate wrong
            [dbi, "21", Buffer.from(JSON.stringify({type: "ReactionRemoveEvent", event: {kid: "1", user_kid: "1", delegate: "0x6d85963d424e44a6a85912d941997cb3f2bc8ae4fc74e32e9ac56b1501023ff8", timestamp: "1711037972"}, signature: ""}))],
            [dbi, "22", Buffer.from(JSON.stringify({type: "ReactionRemoveEvent", event: {kid: "1", user_kid: "1", delegate: "0x69c18fb0d693ec30118535e3852763034a595977daa6ebeead254e5f54a7bd1", timestamp: "1711037972"}, signature: ""}))],

            // reaction create event with ref with everyting okay
            // delegate wrong
            [dbi, "23", Buffer.from(JSON.stringify({type: "ReactionCreateEventWithRef", event: {kid: "1", user_kid: "1", delegate: "0x6d85963d424e44a6a85912d941997cb3f2bc8ae4fc74e32e9ac56b1501023ff8", reaction: "o", publication_ref: "1", timestamp: "1711037972"}, signature: ""}))],
            [dbi, "24", Buffer.from(JSON.stringify({type: "ReactionCreateEventWithRef", event: {kid: "1", user_kid: "1", delegate: "0x69c18fb0d693ec30118535e3852763034a595977daa6ebeead254e5f54a7bd1", reaction: "o", publication_ref: "1", timestamp: "1711037972"}, signature: ""}))],

            // reaction remove event wit ref with everything okay
            // delegate wrong
            [dbi, "25", Buffer.from(JSON.stringify({type: "ReactionRemoveEventWithRef", event: {ref: "1", user_kid: "1", delegate: "0x6d85963d424e44a6a85912d941997cb3f2bc8ae4fc74e32e9ac56b1501023ff8", timestamp: "1711037972"}, signature: ""}))],
            [dbi, "26", Buffer.from(JSON.stringify({type: "ReactionRemoveEventWithRef", event: {ref: "1", user_kid: "1", delegate: "0x69c18fb0d693ec30118535e3852763034a595977daa6ebeead254e5f54a7bd1", timestamp: "1711037972"}, signature: ""}))],

            // publication create event with everyting okat
            // with wrong delegate
            [dbi, "27", Buffer.from(JSON.stringify({type: "PublicationCreateEvent", event: {kid: "1", payload: "1", user_kid: "1", delegate: "0x6d85963d424e44a6a85912d941997cb3f2bc8ae4fc74e32e9ac56b1501023ff8" , timestamp: "1711037972", type: "1", reference_kid: "1", publication_ref: "1"}, signature: "" }))],
            [dbi, "28", Buffer.from(JSON.stringify({type: "PublicationCreateEvent", event: {kid: "1", payload: "1", user_kid: "1", delegate: "0x69c18fb0d693ec30118535e3852763034a595977daa6ebeead254e5f54a7bd1" , timestamp: "1711037972", type: "1", reference_kid: "1", publication_ref: "1"}, signature: "" }))],

            // publication remove event with everything okay
            // with wrong delegate
            [dbi, "29", Buffer.from(JSON.stringify({type: "PublicationRemoveEvent", event: {kid: "1", user_kid: "1", delegate: "0x6d85963d424e44a6a85912d941997cb3f2bc8ae4fc74e32e9ac56b1501023ff8", timestamp: "1711037972"}, signature: ""}))],
            [dbi, "30", Buffer.from(JSON.stringify({type: "PublicationRemoveEvent", event: {kid: "1", user_kid: "1", delegate: "0x69c18fb0d693ec30118535e3852763034a595977daa6ebeead254e5f54a7bd1", timestamp: "1711037972"}, signature: ""}))],

            // publication create with ref event with everything okay
            // wrong delegate
            [dbi, "31", Buffer.from(JSON.stringify({type: "PublicationCreateWithRefEvent", event: {kid: "1", payload: "1", user_kid: "1", delegate: "0x6d85963d424e44a6a85912d941997cb3f2bc8ae4fc74e32e9ac56b1501023ff8" , timestamp: "1711037972", type: "1", publication_ref: "1", parent_ref: "1"}, signature: "" }))],
            [dbi, "32", Buffer.from(JSON.stringify({type: "PublicationCreateWithRefEvent", event: {kid: "1", payload: "1", user_kid: "1", delegate: "0x69c18fb0d693ec30118535e3852763034a595977daa6ebeead254e5f54a7bd1" , timestamp: "1711037972", type: "1", publication_ref: "1", parent_ref: "1"}, signature: "" }))],

            // publication remove with ref event with everythin okay
            // with wrong delegate
            [dbi, "33", Buffer.from(JSON.stringify({type: "PublicationRemoveWithRefEvent", event: {ref: "1", user_kid: "1", delegate: "0x6d85963d424e44a6a85912d941997cb3f2bc8ae4fc74e32e9ac56b1501023ff8", timestamp: "1711037972"}, signature: ""}))],
            [dbi, "34", Buffer.from(JSON.stringify({type: "PublicationRemoveWithRefEvent", event: {ref: "1", user_kid: "1", delegate: "0x69c18fb0d693ec30118535e3852763034a595977daa6ebeead254e5f54a7bd1", timestamp: "1711037972"}, signature: ""}))],

            // account follow ever with everything okay
            // with wrong delegate
            [dbi, "35", Buffer.from(JSON.stringify({type: "AccountFollowEvent", event: {follower_kid: "1", following_kid: "1", follower: "1", user_kid: "1", following: "1", kid: "1", delegate: "0x6d85963d424e44a6a85912d941997cb3f2bc8ae4fc74e32e9ac56b1501023ff8", timestamp: "1711037972"}, signature: ""}))],
            [dbi, "36", Buffer.from(JSON.stringify({type: "AccountFollowEvent", event: {follower_kid: "1", following_kid: "1", follower: "1", user_kid: "1", following: "1", kid: "1", delegate: "0x69c18fb0d693ec30118535e3852763034a595977daa6ebeead254e5f54a7bd1", timestamp: "1711037972"}, signature: ""}))],

            // account unfollow event with everything okat
            // with wrong delegate
            [dbi, "37", Buffer.from(JSON.stringify({type: "AccountUnfollowEvent", event: {unfollowing_kid: "1", user_kid: "1", delegate: "0x6d85963d424e44a6a85912d941997cb3f2bc8ae4fc74e32e9ac56b1501023ff8", timestamp: "1711037972"}, signature: ""}))],
            [dbi, "38", Buffer.from(JSON.stringify({type: "AccountUnfollowEvent", event: {unfollowing_kid: "1", user_kid: "1", delegate: "0x69c18fb0d693ec30118535e3852763034a595977daa6ebeead254e5f54a7bd1", timestamp: "1711037972"}, signature: ""}))],

            // username registeration event with everything okat
            // both owner_address and token_address wrong
            // only owner_address wrong
            // only token_address wrong
            [dbi, "39", Buffer.from(JSON.stringify({type: "UsernameRegistrationEvent", event: {username: "alice", owner_address: "0x6d85963d424e44a6a85912d941997cb3f2bc8ae4fc74e32e9ac56b1501023ff8", token_address: "0x6d85963d424e44a6a85912d941997cb3f2bc8ae4fc74e32e9ac56b1501023ff8", timestamp: "1711037972"}, signature: ""}))],
            [dbi, "40", Buffer.from(JSON.stringify({type: "UsernameRegistrationEvent", event: {username: "alice", owner_address: "0x69c18fb0d693ec30118535e3852763034a595977daa6ebeead254e5f54a7bd1", token_address: "0x69c18fb0d693ec30118535e3852763034a595977daa6ebeead254e5f54a7bd1", timestamp: "1711037972"}, signature: ""}))],
            [dbi, "41", Buffer.from(JSON.stringify({type: "UsernameRegistrationEvent", event: {username: "alice", owner_address: "0x69c18fb0d693ec30118535e3852763034a595977daa6ebeead254e5f54a7bd1", token_address: "0x6d85963d424e44a6a85912d941997cb3f2bc8ae4fc74e32e9ac56b1501023ff8", timestamp: "1711037972"}, signature: ""}))],
            [dbi, "42", Buffer.from(JSON.stringify({type: "UsernameRegistrationEvent", event: {username: "alice", owner_address: "0x6d85963d424e44a6a85912d941997cb3f2bc8ae4fc74e32e9ac56b1501023ff8", token_address: "0x69c18fb0d693ec30118535e3852763034a595977daa6ebeead254e5f54a7bd1", timestamp: "1711037972"}, signature: ""}))],

            // profile update event with everything okay
            // with only delegate wrong
            [dbi, "43", Buffer.from(JSON.stringify({type: "ProfileUpdateEvent", event: {user_kid: "1", delegate: "0x6d85963d424e44a6a85912d941997cb3f2bc8ae4fc74e32e9ac56b1501023ff8", pfp: "", bio: "", display_name: "", timestamp: "1711037972"}, signature: ""}))],
            [dbi, "44", Buffer.from(JSON.stringify({type: "ProfileUpdateEvent", event: {user_kid: "1", delegate: "0x69c18fb0d693ec30118535e3852763034a595977daa6ebeead254e5f54a7bd1", pfp: "", bio: "", display_name: "", timestamp: "1711037972"}, signature: ""}))],

            // community registered event with everything okay
            // with wrong creator
            [dbi, "45", Buffer.from(JSON.stringify({type: "CommunityRegisteredEvent", event: {name: "1", description: "1", image: "1", creator: "0x6d85963d424e44a6a85912d941997cb3f2bc8ae4fc74e32e9ac56b1501023ff8", bid: "1", user_kid: "1", timestamp: "1711037972"}, signature: ""}))],
            [dbi, "46", Buffer.from(JSON.stringify({type: "CommunityRegisteredEvent", event: {name: "1", description: "1", image: "1", creator: "0x69c18fb0d693ec30118535e3852763034a595977daa6ebeead254e5f54a7bd1", bid: "1", user_kid: "1", timestamp: "1711037972"}, signature: ""}))]
        ], {progress: (results) => {console.log(results)}}, (error, results) => {
            if(error) {
                console.log(error, "Could Not Insert Test Data");
                throw "Could Not Insert Test Data";
            } else {
                console.log("Insert Test Data Done");
            }
        })
    } catch(err) {
        console.log(err, "Could Not Fill Test Values");
    }
}

fillTestValues()
