import 'dotenv/config'
import { parserConfig } from "."


try {
    const currentConfig = await parserConfig.findOne()
    if (currentConfig) {
        console.log("PARSER CONFIG ALREADY INITIALIZED")
        process.exit(0)
    }
    await parserConfig.insertOne({
        account_create_last_sequence_number: 0,
        delegate_create_last_sequence_number: 0,
        delegate_remove_last_sequence_number: 0,
        account_follow_last_sequence_number: 0,
        account_unfollow_last_sequence_number: 0,
        reaction_create_last_sequence_number: 0,
        reaction_remove_last_sequence_number: 0,
        quote_create_last_sequence_number: 0,
        quote_remove_last_sequence_number: 0,
        repost_create_last_sequence_number: 0,
        repost_remove_last_sequence_number: 0,
        comment_create_last_sequence_number: 0,
        comment_remove_last_sequence_number: 0,
        publication_create_last_sequence_number: 0,
        publication_remove_last_sequence_number: 0,
        profile_update_last_sequence_number: 0,
        username_registration_last_sequence_number: 0,
    })

    console.log("PARSER CONFIG INITIALIZED")
}
catch(e)
{
    console.log(`FAILED INITIALIZE PARSER CONFIG: ${e}`)
}

process.exit(0)