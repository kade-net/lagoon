import { ProcessMonitor } from "./monitor";

export abstract class ProcessorPlugin {
    abstract name(): string
    abstract process(event: Record<string, any>, monitor: ProcessMonitor, sequence_number: string): Promise<void>
}

export function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}