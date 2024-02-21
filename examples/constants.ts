import 'dotenv/config'
import { AptosAccount, AptosClient, BCS, HexString, Network, Provider, TransactionBuilder, TransactionBuilderRemoteABI, TxnBuilderTypes } from "aptos";
import { Aptos } from "@aptos-labs/ts-sdk"

export const MODULE_ADDRESS = '0xcf00cd2fc17a06f9bf95a50c65d61e8d2f8f826eefa8d95dd68dbebf1bcaa432'

export const ACCOUNTS_RESOURCE_ADDRESS = '0x9ff291c4a30c608e61464c54d2e5d33f0422271e2ca7caa15b29b27e67d3acae';

export const PUBLICATIONS_RESOURCE_ADDRESS = '0x9170f6470eea658d006d48afbcff05f49dc9a6d0fb3ecccabbb84c085a220ceb'

export const ACCOUNT_CONTRACT = `${MODULE_ADDRESS}::accounts`

export const PUBLICATION_CONTRACT = `${MODULE_ADDRESS}::publications`

export const CREATE_ACCOUNT = `${ACCOUNT_CONTRACT}::create_account`
export const ADD_DELEGATE = `${ACCOUNT_CONTRACT}::add_account_delegate`
export const REMOVE_DELEGATE = `${ACCOUNT_CONTRACT}::remove_delegate`
export const FOLLOW_ACCOUNT = `${ACCOUNT_CONTRACT}::follow_account`
export const UNFOLLOW_ACCOUNT = `${ACCOUNT_CONTRACT}::unfollow_account`

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