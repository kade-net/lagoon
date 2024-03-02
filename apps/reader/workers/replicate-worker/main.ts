import 'dotenv/config'
import dataProcessor from "."


try {
    await dataProcessor.process()
}
catch (e) {
    console.log("Something went wrong while processing data:", e)
}