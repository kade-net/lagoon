import db from "./db";
import { account, communities, delegate, sql, username } from "./src";

const addressSize = 66;

export const addressTransfomer = (p: string) => {
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

export async function selectAccountsRows(): Promise<{address: string, object_address: string}[]> {
    try {
        let results = await db.select({
            address: account.address,
            object_address: account.object_address
        }).from(account).where(sql`length(address) < ${addressSize} OR length(object_address) < ${addressSize}`);

        let addresses: {address: string, object_address: string}[] = [];
        for (let i = 0; i < results.length; i++) {
            let res = results[i];
            addresses.push({address: res['address'], object_address: res['object_address']});
        }

        return addresses;
    } catch(err) {
        throw "Could Not Get Accounts";
    }
}

export async function selectCommunitiesRows(): Promise<string[]> {
    try {
        let results = await db.select({
            creator_address: communities.creator_address
        }).from(communities).where(sql`length(creator_address) < ${addressSize}`);

        let addresses = [];
        for (let i = 0; i < results.length; i++) {
            let res = results[i];
            addresses.push(res['creator_address']);
        }

        return addresses;
    } catch(err) {
        throw "Could Not Get Communities";
    }
}

export async function selectDelegatesRows(): Promise<string[]> {
    try {
        let results = await db.select({
            address: delegate.address
        }).from(delegate).where(sql`length(address) < ${addressSize}`);

        let addresses = [];
        for (let i = 0; i < results.length; i++) {
            let res = results[i];
            addresses.push(res['address']);
        }

        return addresses;
    } catch(err) {
        throw "Could Not Get Delegates";
    }
}

export async function selectUsernameRows(): Promise<{owner_address: string; token_address: string}[]> {
    try {
        let results = await db.select({
            owner_address: username.owner_address,
            token_address: username.token_address
        }).from(username).where(sql`length(owner_address) < ${addressSize} OR length(token_address) < ${addressSize}`);

        let addresses:{owner_address: string; token_address: string}[] = [];
        for (let i = 0; i < results.length; i++) {
            let res = results[i];
            addresses.push({owner_address: res['owner_address'], token_address: res['token_address']});
        }

        return addresses;
    } catch(err) {
        throw "Could Not Get Usernames";
    }
}