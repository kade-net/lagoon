export abstract class ProcessorPlugin {
    abstract name(): string
    abstract process(event: Record<string, any>): Promise<void>
}

export function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}