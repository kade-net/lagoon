import 'dotenv/config'
import { spawn } from "child_process"
class Reader {

    fail_count = new Map()

    READERS = [
        './dist/accounts/create/reader.js',
        './dist/delegates/create/reader.js',
        './dist/delegates/remove/reader.js',
        './dist/follow/reader.js',
        './dist/publications/create/reader.js',
        './dist/publications/remove/reader.js',
        './dist/quotes/create/reader.js',
        './dist/quotes/remove/reader.js',
        './dist/reactions/create/reader.js',
        './dist/reactions/remove/reader.js',
        './dist/reposts/create/reader.js',
        './dist/reposts/remove/reader.js',
        './dist/unfollows/reader.js',
        './dist/comments/create/reader.js',
        './dist/comments/remove/reader.js',
    ]
    constructor() {  
    }

    async runProcess(process, count){
        if(count > 5){
            console.log(`TOO MANY FAILS FOR ${process}`)
            return
        }

        try {
            const reader_process = spawn('node', [process])

            reader_process.stdout.on('data', (data)=>{
                console.log(`
                    ${process} stdout: ${data}
                `)
            })

            reader_process.stderr.on('data', (data)=>{
                console.log(`
                    ${process} stderr: ${data}
                `)
            })

            reader_process.on('close', (code)=>{
                console.log(`
                    ${process} exited with code ${code}
                `)
                if(code !== 0){
                    this.fail_count.set(process, count + 1)
                    this.runProcess(process, count + 1)
                }
            })

            reader_process.on('error', (error)=>{
                console.log(`
                    ${process} error: ${error}
                `)
            })

            reader_process.on('exit', (code)=>{
                console.log(`
                    ${process} exited with code ${code}
                `)
            })

        }
        catch (e)
        {
            console.log(`SOMETHING WENT WRONG WHILE RUNNING ${process}`)
            this.fail_count.set(process, count + 1)
            this.runProcess(process, count + 1)
        }
    }

    async run(filter) {
        for (const reader of this.READERS){
            if(filter && !reader.includes(filter)){
                continue
            }
            await this.runProcess(reader, 0)
        }
    }
}

const reader = new Reader()

const args = process.argv.slice(2)

let filter = "" 
if(args.length > 0){
    const tag = args.findIndex((arg)=> arg === "--filter") 

    if(tag !== -1){
        filter = args[tag + 1]
    }
    
}

reader.run(filter)

process.exit(0)