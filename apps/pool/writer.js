import 'dotenv/config'
import { spawn } from "child_process"

class Writer {
    
    WRITERS = [
        './dist/accounts/create/writer.js',
        './dist/delegates/create/writer.js',
        './dist/delegates/remove/writer.js',
        './dist/follow/writer.js',
        './dist/publications/create/writer.js',
        './dist/publications/remove/writer.js',
        './dist/quotes/create/writer.js',
        './dist/quotes/remove/writer.js',
        './dist/reactions/create/writer.js',
        './dist/reactions/remove/writer.js',
        './dist/reposts/create/writer.js',
        './dist/reposts/remove/writer.js',
        './dist/unfollows/writer.js',
        './dist/comments/create/writer.js',
        './dist/comments/remove/writer.js',
    ]

    constructor() {  
    }

    async runProcess(process, count){
        if(count > 5){
            console.log(`TOO MANY FAILS FOR ${process}`)
            return
        }

        try {
            const writer_process = spawn('node', [process])

            writer_process.stdout.on('data', (data)=>{
                console.log(`
                    ${process} stdout: ${data}
                `)
            })

            writer_process.stderr.on('data', (data)=>{
                console.log(`
                    ${process} stderr: ${data}
                `)
            })

            writer_process.on('close', (code)=>{
                console.log(`
                    ${process} exited with code ${code}
                `)
                if(code !== 0){
                    this.fail_count.set(process, count + 1)
                    this.runProcess(process, count + 1)
                }
            })

            writer_process.on('error', (error)=>{
                console.log(`
                    ${process} error: ${error}
                `)
            })

            writer_process.on('exit', (code)=>{
                console.log(`
                    ${process} exited with code ${code}
                `)
            })

        }
        catch (e)
        {
            console.log(e)
        }
    }

    async run() {
        for (const writer of this.WRITERS){
            try {
                await this.runProcess(writer, 0)
            }
            catch (e)
            {
                console.log(e)
            }
        }
    }

}

const writer = new Writer()

writer.run()

process.exit(0)