import fastify from "./app"

const PORT = process.env.PORT || 5000
const HOST = process.env.HOST || '0.0.0.0'

fastify.listen({port:Number(PORT),host: HOST},(err,address)=>{
    if(err){
        console.error(err);
        process.exit(1)
    }
    console.log(`server is running successfully at port ${address}`)
})