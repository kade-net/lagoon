import { ProcessorPlugin } from "../helpers";


export class RegisterUsernamePlugin extends ProcessorPlugin {
    name(): string {
        return "RegisterUsernameEvent"
    }
    async process(event: Record<string, any>): Promise<void> {
        console.log(event)
    }
}