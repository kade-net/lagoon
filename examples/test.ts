import "dotenv/config";
import {
  TransactionBuilder,
  TransactionBuilderRemoteABI,
  TxnBuilderTypes,
} from "aptos";
import { ADD_DELEGATE, client, delegate_1, user_1 } from "./constants";

const builder = new TransactionBuilderRemoteABI(client, {
  sender: user_1.address(),
});
const rawTx = await builder.build(ADD_DELEGATE, [], []);
const multiagent = new TxnBuilderTypes.MultiAgentRawTransaction(rawTx, [
  TxnBuilderTypes.AccountAddress.fromHex(delegate_1.address().toString()),
]);

const senderSignature = new TxnBuilderTypes.Ed25519Signature(
  user_1
    .signBuffer(TransactionBuilder.getSigningMessage(multiagent))
    .toUint8Array()
);

console.log("SENDER SIGNATURE::", senderSignature);
