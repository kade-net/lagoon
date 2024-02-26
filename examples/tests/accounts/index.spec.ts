import { BCS, TransactionBuilder, TransactionBuilderRemoteABI, TxnBuilderTypes } from "aptos"
import { ADD_DELEGATE, CREATE_ACCOUNT, FOLLOW_ACCOUNT, UPDATE_PROFILE, client, delegate_1, delegate_2, provider, user_1, user_2 } from "../../constants"



const ALICE_IMAGE = "https://images.unsplash.com/photo-1613063322946-77d35809140c?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
const BOB_IMAGE = "https://images.unsplash.com/photo-1578681994506-b8f463449011?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"

describe("TEST ACCOUNT FUNCTIONALITY", ()=> {

    it("CREATE ACCOUNT FOR ALICE", async () => {
        const transaction = await provider.generateTransaction(user_1.address(), {
            arguments: ['alice'],
            function: CREATE_ACCOUNT,
            type_arguments: []
        })

        const hash = await provider.signAndSubmitTransaction(user_1,transaction)

        console.log("HASH: ", hash)

 
    })

    it("CREATE ACCOUNT FOR BOB", async () => {
        
        const transaction = await provider.generateTransaction(user_2.address(), {
            arguments: ['bob'],
            function: CREATE_ACCOUNT,
            type_arguments: []
        })

        const hash = await provider.signAndSubmitTransaction(user_2,transaction)

        const status = await provider.waitForTransaction(hash)
        console.log("HASH: ", status)


    })

    it("ADD DELEGATE TO ALICE'S ACCOUNT", async () => {
        try {
        const builder = new TransactionBuilderRemoteABI(client, {
            sender: user_1.address(),
        })
        const rawTx = await builder.build(
            ADD_DELEGATE,
            [],
            []
        )
        const multiagent = new TxnBuilderTypes.MultiAgentRawTransaction(rawTx, [TxnBuilderTypes.AccountAddress.fromHex(delegate_1.address().toString())])
        
        const senderSignature = new TxnBuilderTypes.Ed25519Signature(
            user_1.signBuffer(TransactionBuilder.getSigningMessage(multiagent)).toUint8Array()
        )
    
        const receiverSignature = new TxnBuilderTypes.Ed25519Signature(
            delegate_1.signBuffer(TransactionBuilder.getSigningMessage(multiagent)).toUint8Array()
        )
    
        const senderAuthenticator = new TxnBuilderTypes.AccountAuthenticatorEd25519(
            new TxnBuilderTypes.Ed25519PublicKey(user_1.signingKey.publicKey),
            senderSignature
        )
    
        const receiverAuthenticator = new TxnBuilderTypes.AccountAuthenticatorEd25519(
            new TxnBuilderTypes.Ed25519PublicKey(delegate_1.signingKey.publicKey),
            receiverSignature
        )
    
        const multiAgentAuthenticator = new TxnBuilderTypes.TransactionAuthenticatorMultiAgent(
            senderAuthenticator,
            [TxnBuilderTypes.AccountAddress.fromHex(delegate_1.address())],
            [receiverAuthenticator]
        )
    
        const bcsTxn = BCS.bcsToBytes(
            new TxnBuilderTypes.SignedTransaction(rawTx, multiAgentAuthenticator)
        )
    

            const transactionRes = await client.submitSignedBCSTransaction(bcsTxn)
            console.log("Transaction Response::", transactionRes)
        }
        catch (e) {
            console.log(e)
        }
        // const transactionRes = await client.submitSignedBCSTransaction(bcsTxn)

        // console.log("Transaction Response::", transactionRes)

      
    })

    it('ADD DELEGATE TO BOB ACCOUNT', async () => {
        const builder = new TransactionBuilderRemoteABI(client, {
            sender: user_2.address(),
        })
        const rawTx = await builder.build(
            ADD_DELEGATE,
            [],
            []
        )
        const multiagent = new TxnBuilderTypes.MultiAgentRawTransaction(rawTx, [TxnBuilderTypes.AccountAddress.fromHex(delegate_2.address().toString())])
        
        const senderSignature = new TxnBuilderTypes.Ed25519Signature(
            user_2.signBuffer(TransactionBuilder.getSigningMessage(multiagent)).toUint8Array()
        )
    
        const receiverSignature = new TxnBuilderTypes.Ed25519Signature(
            delegate_2.signBuffer(TransactionBuilder.getSigningMessage(multiagent)).toUint8Array()
        )
    
        const senderAuthenticator = new TxnBuilderTypes.AccountAuthenticatorEd25519(
            new TxnBuilderTypes.Ed25519PublicKey(user_2.signingKey.publicKey),
            senderSignature
        )
    
        const receiverAuthenticator = new TxnBuilderTypes.AccountAuthenticatorEd25519(
            new TxnBuilderTypes.Ed25519PublicKey(delegate_2.signingKey.publicKey),
            receiverSignature
        )
    
        const multiAgentAuthenticator = new TxnBuilderTypes.TransactionAuthenticatorMultiAgent(
            senderAuthenticator,
            [TxnBuilderTypes.AccountAddress.fromHex(delegate_2.address())],
            [receiverAuthenticator]
        )
    
        const bcsTxn = BCS.bcsToBytes(
            new TxnBuilderTypes.SignedTransaction(rawTx, multiAgentAuthenticator)
        )
    
        const transactionRes = await client.submitSignedBCSTransaction(bcsTxn)

        console.log("Transaction Response::", transactionRes)
        
    

    })

    it('ALICE FOLLOWS BOB', async () => {
        const transaction = await provider.generateTransaction(delegate_1.address(), {
            arguments: [user_2.address().toString()],
            function: FOLLOW_ACCOUNT,
            type_arguments: []
        })

        const hash = await provider.signAndSubmitTransaction(delegate_1,transaction)

        console.log("HASH: ", hash)


    })

    it('BOB FOLLOWS ALICE', async () => {
        const transaction = await provider.generateTransaction(delegate_2.address(), {
            arguments: [user_1.address().toString()],
            function: FOLLOW_ACCOUNT,
            type_arguments: []
        })

        const hash = await provider.signAndSubmitTransaction(delegate_2,transaction)

        console.log("HASH: ", hash)

    })

    it("ALICE UPDATES HER PROFILE", async () => {
        const transaction = await provider.generateTransaction(delegate_1.address(), {
            arguments: [ALICE_IMAGE, "Hi, this is Alice", "Alice"],
            function: UPDATE_PROFILE,
            type_arguments: []
        })

        const hash = await provider.signAndSubmitTransaction(delegate_1, transaction)

        console.log("HASH: ", hash)
    })

    it("BOB UPDATES HIS PROFILE", async () => {
        const transaction = await provider.generateTransaction(delegate_2.address(), {
            arguments: [BOB_IMAGE, "Hi, this is Bob", "Bob"],
            function: UPDATE_PROFILE,
            type_arguments: []
        })

        const hash = await provider.signAndSubmitTransaction(delegate_2, transaction)

        console.log("HASH: ", hash)
    })

})