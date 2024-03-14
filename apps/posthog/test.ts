import { capture_event } from "./src/capture-event";

try {
    capture_event(
        'me',
        'test-event',
        {
            test: "This better work"
        }
    );
} catch(err) {
    console.log(`\n############################OHH SHIT!##########################\n`);
    console.log(err);
}