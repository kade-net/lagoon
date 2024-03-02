import { ProcessorPlugin } from "../helpers";


export class AccountCreatePlugin extends ProcessorPlugin {
    name(): string {
        return "AccountCreateEvent"
    }
    async process(event: Record<string, any>): Promise<void> {
        console.log(event)
    }
}


export class DelegateCreatePlugin extends ProcessorPlugin {
    name(): string {
        return "DelegateCreateEvent"
    }
    async process(event: Record<string, any>): Promise<void> {
        console.log(event)
    }
}

export class DelegateRemovePlugin extends ProcessorPlugin {
    name(): string {
        return "DelegateRemoveEvent"
    }
    async process(event: Record<string, any>): Promise<void> {
        console.log(event)
    }
}

export class AccountFollowPlugin extends ProcessorPlugin {
    name(): string {
        return "AccountFollowEvent"
    }
    async process(event: Record<string, any>): Promise<void> {
        console.log(event)
    }
}

export class AccountUnFollowPlugin extends ProcessorPlugin {
    name(): string {
        return "AccountUnFollowEvent"
    }
    async process(event: Record<string, any>): Promise<void> {
        console.log(event)
    }
}

export class ProfileUpdatePlugin extends ProcessorPlugin {
    name(): string {
        return "ProfileUpdateEvent"
    }
    async process(event: Record<string, any>): Promise<void> {
        console.log(event)
    }
}