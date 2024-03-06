import 'dotenv/config'
import { AptosAccount, AptosClient, BCS, HexString, Network, Provider, TransactionBuilder, TransactionBuilderRemoteABI, TxnBuilderTypes } from "aptos";
import { Aptos } from "@aptos-labs/ts-sdk"

export const MODULE_ADDRESS = '0xe519b74fd94be761a4879e5db5e6e1ea113697c69be5664eb053123a00a03334'

export const ACCOUNTS_RESOURCE_ADDRESS = '0x3859907505843da95c7171838d9233c29268140c26ef4c9c487af52847fe58b9';

export const PUBLICATIONS_RESOURCE_ADDRESS = '0x5ea08b646aae75a8512b78e6a163dda14da8eb89c5ed4cc63e43b6c84e86b64c'

export const USERNAMES_RESOURCE_ADDRESS = '0xd996c8fa72572b43f809d46f372adf738c8c9b644c970d8e1f92b7652ef5983b'

export const ACCOUNT_CONTRACT = `${MODULE_ADDRESS}::accounts`

export const PUBLICATION_CONTRACT = `${MODULE_ADDRESS}::publications`

export const USERNAME_CONTRACT = `${MODULE_ADDRESS}::usernames`



export const CREATE_ACCOUNT = `${ACCOUNT_CONTRACT}::create_account`
export const ADD_DELEGATE = `${ACCOUNT_CONTRACT}::add_account_delegate`
export const REMOVE_DELEGATE = `${ACCOUNT_CONTRACT}::remove_delegate`
export const FOLLOW_ACCOUNT = `${ACCOUNT_CONTRACT}::follow_account`
export const UNFOLLOW_ACCOUNT = `${ACCOUNT_CONTRACT}::unfollow_account`
export const UPDATE_PROFILE = `${ACCOUNT_CONTRACT}::update_profile`

export const CLAIM_USERNAME = `${USERNAME_CONTRACT}::claim_username`

export const CREATE_PUBLICATION = `${PUBLICATION_CONTRACT}::create_publication`
export const REMOVE_PUBLICATION = `${PUBLICATION_CONTRACT}::remove_publication`
export const CREATE_REPOST = `${PUBLICATION_CONTRACT}::create_repost`
export const REMOVE_REPOST = `${PUBLICATION_CONTRACT}::remove_repost`
export const CREATE_QUOTE = `${PUBLICATION_CONTRACT}::create_quote`
export const REMOVE_QUOTE = `${PUBLICATION_CONTRACT}::remove_quote`
export const CREATE_REACTION = `${PUBLICATION_CONTRACT}::create_reaction`
export const REMOVE_REACTION = `${PUBLICATION_CONTRACT}::remove_reaction`

export const CREATE_COMMENT = `${PUBLICATION_CONTRACT}::create_comment`

// @ts-ignore
export const USER_2 = process.env.USER_2! // alice
// @ts-ignore
export const DELEGATE_1 = process.env.DELEGATE_1! // alices delegate
// @ts-ignore
export const USER_1 = process.env.USER_1! // bob
// @ts-ignore
export const DELEGATE_2 = process.env.DELEGATE_2! // bobs delegate

export const user_1 = new AptosAccount(
  new HexString(USER_1 as any).toUint8Array()
);
export const delegate_1 = new AptosAccount(
  new HexString(DELEGATE_1 as any).toUint8Array()
);
export const user_2 = new AptosAccount(
  new HexString(USER_2 as any).toUint8Array()
);
export const delegate_2 = new AptosAccount(
  new HexString(DELEGATE_2 as any).toUint8Array()
);




export const client = new AptosClient('https://fullnode.testnet.aptoslabs.com')
export const provider = new Provider(Network.TESTNET)
const aptos = new Aptos()