import 'dotenv/config'
import { spawn } from "child_process"

class Writer {
  fail_count = new Map();

  WRITERS = [
    "./dist/processors/accounts/create/writer.js",
    "./dist/processors/delegates/create/writer.js",
    "./dist/processors/delegates/remove/writer.js",
    "./dist/processors/follow/writer.js",
    "./dist/processors/publications/create/writer.js",
    "./dist/processors/publications/remove/writer.js",
    "./dist/processors/quotes/create/writer.js",
    "./dist/processors/quotes/remove/writer.js",
    "./dist/processors/reactions/create/writer.js",
    "./dist/processors/reactions/remove/writer.js",
    "./dist/processors/reposts/create/writer.js",
    "./dist/processors/reposts/remove/writer.js",
    "./dist/processors/unfollows/writer.js",
    "./dist/processors/comments/create/writer.js",
    "./dist/processors/comments/remove/writer.js",
  ];

  constructor() {}

  async runProcess(process, count) {
    if (count > 5) {
      console.log(`TOO MANY FAILS FOR ${process}`);
      return;
    }

    try {
      const writer_process = spawn("node", [process]);

      writer_process.stdout.on("data", (data) => {
        console.log(`
                    ${process} stdout: ${data}
                `);
      });

      writer_process.stderr.on("data", (data) => {
        console.log(`
                    ${process} stderr: ${data}
                `);
      });

      writer_process.on("close", (code) => {
        console.log(`
                    ${process} exited with code ${code}
                `);
        if (code !== 0) {
          this.fail_count.set(process, count + 1);
          this.runProcess(process, count + 1);
        }
      });

      writer_process.on("error", (error) => {
        console.log(`
                    ${process} error: ${error}
                `);
      });

      writer_process.on("exit", (code) => {
        console.log(`
                    ${process} exited with code ${code}
                `);
      });
    } catch (e) {
      console.log(e);
    }
  }

  async run() {
    for (const writer of this.WRITERS) {
      try {
        await this.runProcess(writer, 0);
      } catch (e) {
        console.log(e);
      }
    }
  }
}

const writer = new Writer();

try {
  await writer.run();
} catch (e) {
  console.log("WRITER ERROR", e);
}