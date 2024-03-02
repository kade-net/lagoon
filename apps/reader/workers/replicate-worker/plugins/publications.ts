import { ProcessorPlugin } from "../helpers"


export class PublicationCreateEventPlugin extends ProcessorPlugin {
    name(): string {
        return "PublicationCreate"
    }
    async process(event: Record<string, any>): Promise<void> {
        console.log(event)
    }
}

export class PublicationRemoveEventPlugin extends ProcessorPlugin {
    name(): string {
        return "PublicationRemoveEvent"
    }
    async process(event: Record<string, any>): Promise<void> {
        console.log(event)
    }
}

export class CommentCreateEventPlugin extends ProcessorPlugin {
    name(): string {
        return "CommentCreateEvent"
    }
    async process(event: Record<string, any>): Promise<void> {
        console.log(event)
    }
}

export class CommentRemoveEventPlugin extends ProcessorPlugin {
    name(): string {
        return "CommentRemoveEvent"
    }
    async process(event: Record<string, any>): Promise<void> {
        console.log(event)
    }
}

export class RepostCreateEventPlugin extends ProcessorPlugin {
    name(): string {
        return "RepostCreateEvent"
    }
    async process(event: Record<string, any>): Promise<void> {
        console.log(event)
    }
}

export class RepostRemoveEventPlugin extends ProcessorPlugin {
    name(): string {
        return "RepostRemoveEvent"
    }
    async process(event: Record<string, any>): Promise<void> {
        console.log(event)
    }
}

export class QuoteCreateEventPlugin extends ProcessorPlugin {
    name(): string {
        return "QuoteCreateEvent"
    }
    async process(event: Record<string, any>): Promise<void> {
        console.log(event)
    }
}

export class QuoteRemoveEventPlugin extends ProcessorPlugin {
    name(): string {
        return "QuoteRemoveEvent"
    }
    async process(event: Record<string, any>): Promise<void> {
        console.log(event)
    }
}

export class ReactionCreateEventPlugin extends ProcessorPlugin {
    name(): string {
        return "ReactionCreateEvent"
    }
    async process(event: Record<string, any>): Promise<void> {
        console.log(event)
    }
}

export class ReactionRemoveEventPlugin extends ProcessorPlugin {
    name(): string {
        return "ReactionRemoveEvent"
    }
    async process(event: Record<string, any>): Promise<void> {
        console.log(event)
    }
}