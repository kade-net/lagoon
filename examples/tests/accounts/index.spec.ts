import { BCS, TransactionBuilder, TransactionBuilderRemoteABI, TxnBuilderTypes } from "aptos"
import { ADD_DELEGATE, CREATE_ACCOUNT, FOLLOW_ACCOUNT, client, delegate_1, delegate_2, provider, user_1, user_2 } from "../../constants"





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

        console.log("HASH: ", hash)


    })

    it("ADD DELEGATE TO ALICE'S ACCOUNT", async () => {
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

})