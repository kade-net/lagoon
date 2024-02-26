import { CLAIM_USERNAME, provider, user_1, user_2 } from "../../constants"



describe("USERNAME CONTRACT", () => {

    it("CLAIM USERNAME FOR ALICE", async () => {
        const transaction = await provider.generateTransaction(user_1.address(), {
            arguments: ['alice'],
            function: CLAIM_USERNAME,
            type_arguments: []
        })

        const hash = await provider.signAndSubmitTransaction(user_1, transaction)

        console.log("HASH: ", hash)
    })

    it("CLAIM USERNAME FOR BOB", async () => {
        const transaction = await provider.generateTransaction(user_2.address(), {
            arguments: ['bob'],
            function: CLAIM_USERNAME,
            type_arguments: []
        })

        const hash = await provider.signAndSubmitTransaction(user_2, transaction)

        console.log("HASH: ", hash)
    })
})