import db from "./db";
import { addressTransfomer, selectAccountsRows, selectCommunitiesRows, selectDelegatesRows, selectUsernameRows } from "./select-rows";
import { account, communities, ConsoleLogWriter, delegate, sql, username } from "./src";

async function updateTables() {
    try {
        await updateAccounts();
        await updateCommunities();
        await updateDelegates();
        await updateUsernames();

        console.log("Update Tables Complete");
    } catch(err) {
        console.log("Could Not Update tables", err);
        throw "Could not update tables"
    }
}

async function updateAccounts() {
    try {
        // Get accounts to change
        let addresses = await selectAccountsRows();

        // Log accounts that are to be updated
        console.log("Accounts to be updated", addresses);

        for (let i = 0; i < addresses.length; i++) {
            var addr = addresses[i];
            var goodAddr = addressTransfomer(addr['address']);
            var goodObjAdr = addressTransfomer(addr['object_address'])

            await db.update(account).set({address: goodAddr, object_address: goodObjAdr}).where(sql`address = ${addr['address']} AND object_address = ${addr['object_address']}`);
        }
    } catch(err) {
        console.log("Could Not Update Accounts", err);
        throw "Could Not Update Accounts";
    }
}

async function updateCommunities() {
    try {
        // Get accounts to change
        let addresses = await selectCommunitiesRows();

        // Log communities to be changed
        console.log("Communities to be changed have the following addresses", addresses);

        for (let i = 0; i < addresses.length; i++) {
            var addr = addresses[i];
            var goodAddr = addressTransfomer(addr);

            await db.update(communities).set({creator_address: goodAddr}).where(sql`creator_address = ${addr}`);
        }
    } catch(err) {
        console.log("Could Not Update Communities", err);
        throw "Could Not Update Communities";
    }
}

async function updateDelegates() {
    try {
        // Get accounts to change
        let addresses = await selectDelegatesRows();

        // Log communities to be changed
        console.log("Delegates to be changed have the following addresses", addresses);

        for (let i = 0; i < addresses.length; i++) {
            var addr = addresses[i];
            var goodAddr = addressTransfomer(addr);

            await db.update(delegate).set({address: goodAddr}).where(sql`address = ${addr}`);
        }
    } catch(err) {
        console.log("Could Not Update Communities", err);
        throw "Could Not Update Communities";
    }
}

async function updateUsernames() {
    try {
        // Get accounts to change
        let addresses = await selectUsernameRows();

        // Log communities to be changed
        console.log("Usernames to be changed have the following addresses", addresses);

        for (let i = 0; i < addresses.length; i++) {
            var addr = addresses[i];
            var goodOwnerAddr = addressTransfomer(addr['owner_address']);
            var goodTokenAddr = addressTransfomer(addr['token_address']);

            await db.update(username).set({owner_address: goodOwnerAddr, token_address: goodTokenAddr}).where(sql`owner_address = ${addr['owner_address']} AND token_address = ${addr['token_address']}`);
        }
    } catch(err) {
        console.log("Could Not Update Usernames", err);
        throw "Could Not Update Usernames";
    }
}

updateTables()