import db from "./db";
import { account, communities, delegate, username } from "./db/schema";

async function fillTestValues() {
    try {
        // first account has short address and object address
        // Second has only short address
        // Third has only short object address
        // the rest are good
        await db.insert(account).values([{
            id: 142,
            address: "0x777b6eb4104e231694b2cff97d8316faa4513d2e5df7cde43d97f6a5b1932df",
            object_address: "0x838db127fe05785814a9ed3defa6b3b1def1b129f67dd8758bfcf1f8e0621a1",
            timestamp: new Date()
        }, {
            id: 143,
            address: "0x777b6eb4104e231694b2cff97d8316faa4513d2e5df7cde43d97f6a5b1932df",
            object_address: "0x395ddfe36477b72c08225c2d28d3e1670f7e7392d657263bc8fb0ea45d9214e7",
            timestamp: new Date()
        }, {
            id: 144,
            address: "0x7b7e5e26666fa82b9445ab6284a92883e0e4e3c453c9d5098115b2af75757fa9",
            object_address: "0x1ed1178680dbbded9ebdd10b30f888778bcca8ca6a1d13bbb99ee4ca1ffb04e",
            timestamp: new Date()
        }, {
            id: 145,
            address: "0x7b7e5e26666fa82b9445ab6284a92883e0e4e3c453c9d5098115b2af75757fa9",
            object_address: "0x395ddfe36477b72c08225c2d28d3e1670f7e7392d657263bc8fb0ea45d9214e7",
            timestamp: new Date()
        }]);

        // First community has short creator_address
        // Rest are good
        await db.insert(communities).values([{
            id: 100,
            name: "origin",
            description: "original ocmmunity",
            image: "image.com",
            creator_address: "0x777b6eb4104e231694b2cff97d8316faa4513d2e5df7cde43d97f6a5b1932df",
            user_kid: 142,
            timestamp: new Date(),
            display_name: "origin"
        }, {
            id: 101,
            name: "origin2",
            description: "original ocmmunity2",
            image: "image2.com",
            creator_address: "0x7b7e5e26666fa82b9445ab6284a92883e0e4e3c453c9d5098115b2af75757fa9",
            user_kid: 145,
            timestamp: new Date(),
            display_name: "origin2"
        }, {
            id: 102,
            name: "origin3",
            description: "original ocmmunity3",
            image: "image3.com",
            creator_address: "0x395ddfe36477b72c08225c2d28d3e1670f7e7392d657263bc8fb0ea45d9214e7",
            user_kid: 144,
            timestamp: new Date(),
            display_name: "origin3"
        }]);

        // First delegate has short address, rest are good
        await db.insert(delegate).values([{
            id: 100,
            address: "0x777b6eb4104e231694b2cff97d8316faa4513d2e5df7cde43d97f6a5b1932df",
            owner_id: 142,
            timestamp: new Date()
        }, {
            id: 101,
            address: "0x63f06f04b0c72ba64a9ff70042983903c8ad8e8decaa60aebd8a1cbb02bed018",
            owner_id: 143,
            timestamp: new Date()
        }, {
            id: 102,
            address: "0x376454caac95e72093ccd6ba128553906201c334bde2cb79145f1c6670515fa7",
            owner_id: 144,
            timestamp: new Date()
        }]);

        // First has short owner and token address
        // Second has short owner address
        // Third has short token address
        // Final is good
        await db.insert(username).values([{
            username: "alice",
            owner_address: "0x777b6eb4104e231694b2cff97d8316faa4513d2e5df7cde43d97f6a5b1932df",
            token_address: "0xf3f042968993f4b166f236e8929724e011dab73f211ba1b811619940b36f63b",
            timestamp: new Date()
        }, {
            username: "bob",
            owner_address: "0x777b6eb4104e231694b2cff97d8316faa4513d2e5df7cde43d97f6a5b1932df",
            token_address: "0x7018dced7ffe1da19b1229e4aeeb5db6d51efcb53c958a78e056fe12c40f3cfc",
            timestamp: new Date()
        }, {
            username: "ted",
            owner_address: "0x63f06f04b0c72ba64a9ff70042983903c8ad8e8decaa60aebd8a1cbb02bed018",
            token_address: "0xf3f042968993f4b166f236e8929724e011dab73f211ba1b811619940b36f63b",
            timestamp: new Date()
        }, {
            username: "karl",
            owner_address: "0x7b7e5e26666fa82b9445ab6284a92883e0e4e3c453c9d5098115b2af75757fa9",
            token_address: "0x7153cd74eaa5614ad4f51cfca4aa728276d6c172ea6e2a84bd534e2461ae0485",
            timestamp: new Date()
        }]);

        console.log("Inputting test values done!");
    } catch(err) {
        console.log(err);
        throw "Could Not Create Test Data";
    }
}

fillTestValues();