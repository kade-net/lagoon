import client from "./posthog";

export function capture_event(id: string, event: string, properties: Record<string, any>) {
    client.capture({
        distinctId: id,
        event: event,
        properties: properties
    });

    client.shutdownAsync();
}

