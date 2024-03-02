import { aptos } from "@aptos-labs/aptos-protos";
import { ChannelCredentials, Metadata } from "@grpc/grpc-js";
import { Timer } from "timer-node"
import { LevelDB } from "../../db";
import _ from "lodash"
const { isNull } = _
import { TransactionsProcessor } from "./read.processor";


export class Worker {

    token: string
    db: LevelDB
    processor: TransactionsProcessor

    constructor(token: string, db: LevelDB, processor: TransactionsProcessor) {
        this.token = token
        this.db = db
        this.processor = processor
    }

    async run(_startingVersion?: bigint) {
        const NET = process.env.APTOS_NET! || "testnet"
        const GRPC_HOST = NET === "mainnet" ? "grpc.mainnet.aptoslabs.com:443" : "grpc.testnet.aptoslabs.com:443"
        const client = new aptos.indexer.v1.RawDataClient(
            GRPC_HOST,
            ChannelCredentials.createSsl(),
            {
                "grpc.keepalive_time_ms": 1000,
                "grpc.default_compression_algorithm": 2,
                "grpc.default_compression_level": 3,
                "grpc.max_receive_message_length": -1,
                "grpc.max_send_message_length": -1,
            }
        )
        let startingVersion = BigInt(0) // pass in the starting version;
        let currentStartingVersion = await this.db.getLatestVersion()

        if (currentStartingVersion > startingVersion) {
            startingVersion = currentStartingVersion
        } else {
            if (_startingVersion) {
                startingVersion = _startingVersion
            }
            await this.db.putVersion(startingVersion)
        }

        const request: aptos.indexer.v1.GetTransactionsRequest = {
            startingVersion: startingVersion,
        }

        const metadata = new Metadata();

        metadata.set("Authorization", `Bearer ${this.token}`)

        const stream = client.getTransactions(request, metadata)

        let currentTxnVersion = startingVersion
        const timer = new Timer()
        timer.start()

        stream.on("data", async (response: aptos.indexer.v1.TransactionsResponse) => {
            console.log("Stream sent data")
            stream.pause()

            const transactions = response.transactions

            if (!transactions || isNull(transactions)) {
                return
            }

            const startVersion = transactions[0].version!;
            const endVersion = transactions[transactions.length - 1].version!;
            if (startVersion != currentTxnVersion) {
                throw new Error("Start version does not match")
            }

            const processingResult = await this.processor.processTransactions({
                transactions,
                startVersion,
                endVersion,
                db: this.db
            })

            const numProcessed = processingResult.endVersion - processingResult.startVersion

            currentTxnVersion = endVersion

            if (numProcessed) {
                await this.db.putVersion(currentTxnVersion + 1n)
            } else if (currentTxnVersion % 1000n == 0n) {
                await this.db.putVersion(currentTxnVersion + 1n)
                console.log({
                    message: "[Parser] Successfully processed transactions",
                    last_success_transaction_version: currentTxnVersion
                })
            }

            currentTxnVersion = currentTxnVersion + 1n




            stream.resume()
        })

        stream.on("error", async (error) => {
            if (error.message.includes("RST_STREAM")) {
                console.log("Stream was reset. Reconnecting...")
                await this.run()
                return
            }

            console.log("Error: ", error)
        })


        stream.on("status", (status) => {

            console.log("Status: ", status)

        })

    }
}