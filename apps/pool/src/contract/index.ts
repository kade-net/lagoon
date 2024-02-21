import 'dotenv/config'
import { AptosClient, Network, Provider } from "aptos"

export const client = new AptosClient(process.env.DOCK_ENV! == 'prod' ? "https://fullnode.mainnet.aptoslabs.com" : 'https://fullnode.testnet.aptoslabs.com')
export const provider = new Provider(process.env.DOCK_ENV! == 'prod' ? Network.MAINNET : Network.TESTNET)