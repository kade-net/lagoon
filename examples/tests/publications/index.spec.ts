import { CREATE_COMMENT, CREATE_PUBLICATION, CREATE_QUOTE, CREATE_REACTION, CREATE_REPOST, delegate_1, delegate_2, provider } from "../../constants"
import { sleep } from "../../lib"



describe.skip("TEST PUBLICATION FUNCTIONALITY", () => {


    it("ALICE CREATES 20 POSTS", async () => {
            
            for (let i = 0; i < 20; i++) {
                await sleep(5000)
                const transaction = await provider.generateTransaction(delegate_1.address(), {
                    arguments: [1, JSON.stringify({ content: `Testing ${i}`, tags: ["test"], media: [] }), 0, ""],
                    function: CREATE_PUBLICATION,
                    type_arguments: []
                })
        
                const hash = await provider.signAndSubmitTransaction(delegate_1,transaction)
        
                console.log("HASH: ", hash)
            }
    
            
    })

    it('BOB CREATES 20 POSTS', async () => {
        for (let i = 0; i < 20; i++) {
            await sleep(2000)
            const transaction = await provider.generateTransaction(delegate_2.address(), {
                arguments: [1, JSON.stringify({ content: `Testing ${i}`, tags: ["test"], media: [] }), 0, ""],
                function: CREATE_PUBLICATION,
                type_arguments: []
            })
    
            const hash = await provider.signAndSubmitTransaction(delegate_2,transaction)
    
            console.log("HASH: ", hash)
        }

        
    })

    it('ALICE REPOSTS BOBS FIRST 10 PUBLICATIONS', async () => {
        for (let i = 20; i < 30; i++) {
            await sleep(5000)
            const transaction = await provider.generateTransaction(delegate_1.address(), {
                arguments: [4, "", 100 + i, ""],
                function: CREATE_PUBLICATION,
                type_arguments: []
            })

            const hash = await provider.signAndSubmitTransaction(delegate_1,transaction)

            console.log("HASH: ", hash)
        }

        
    })

    it('BOB REPOSTS ALICES FIRST 10 PUBLICATIONS', async () => {
        for (let i = 0; i < 10; i++) {
            await sleep(5000)
            const transaction = await provider.generateTransaction(delegate_2.address(), {
                arguments: [4, "", 100 + i, ""],
                function: CREATE_PUBLICATION,
                type_arguments: []
            })

            const hash = await provider.signAndSubmitTransaction(delegate_2,transaction)

            console.log("HASH: ", hash)
        }

        
    })

    it("ALICE QUOTES BOBS FIRST 5 PUBLICATIONS", async () => {
        for (let i = 20; i <25; i++) {
            await sleep(3000)
            const transaction = await provider.generateTransaction(delegate_1.address(), {
                arguments: [2, JSON.stringify({ content: `Quoting ${i}`, tags: ["test"], media: [] }), 100 + i, ""],
                function: CREATE_PUBLICATION,
                type_arguments: []
            })

            const hash = await provider.signAndSubmitTransaction(delegate_1,transaction)

            console.log("HASH: ", hash)
        }

        
    })

    it("BOB REACTS TO ALICES FIRST 5 PUBLICATIONS", async () => {
        for (let i = 0; i < 5; i++) {
            await sleep(5000)
            const transaction = await provider.generateTransaction(delegate_2.address(), {
                arguments: [1, 100 + i],
                function: CREATE_REACTION,
                type_arguments: []
            })

            const hash = await provider.signAndSubmitTransaction(delegate_2,transaction)

            console.log("HASH: ", hash)
        }

        
    })

    it(" ALICE COMMENTS ON BOBS FIRST 5 PUBLICATIONS", async () => {
        for (let i = 20; i < 25; i++) {
            await sleep(5000)
            const transaction = await provider.generateTransaction(delegate_1.address(), {
                arguments: [3, JSON.stringify({ content: `Commenting on ${i}`, tags: ["test"], media: [] }), 100 + i, ""],
                function: CREATE_PUBLICATION,
                type_arguments: []
            })

            const hash = await provider.signAndSubmitTransaction(delegate_1,transaction)

            console.log("HASH: ", hash)
        }
    })

    it("BOB COMMENTS ON ALICES FIRST 5 PUBLICATIONS", async () => {
        for (let i = 0; i < 5; i++) {
            await sleep(5000)
            const transaction = await provider.generateTransaction(delegate_2.address(), {
                arguments: [3, JSON.stringify({ content: `Commenting on ${i}`, tags: ["test"], media: [] }), 100 + i, ""],
                function: CREATE_PUBLICATION,
                type_arguments: []
            })

            const hash = await provider.signAndSubmitTransaction(delegate_2,transaction)

            console.log("HASH: ", hash)
        }
    })

})