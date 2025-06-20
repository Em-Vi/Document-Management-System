import fp from "fastify-plugin"

const loggerPlugin = fp(async(fastify)=>{
    fastify.log.info("logger initialized")
})

export default loggerPlugin