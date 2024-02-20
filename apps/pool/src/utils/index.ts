

export async function sleep(ms: number){
    console.log("SLEEPING")
    return new Promise(( resolve, _)=> setTimeout(()=>{
        console.log("WAKING UP")
        resolve(null)
    }, ms))
}