import { parserConfig } from "."


try {
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
    })

    console.log("PARSER CONFIG INITIALIZED")
}
catch(e)
{
    console.log(`FAILED INITIALIZE PARSER CONFIG: ${e}`)
}

process.exit(0)