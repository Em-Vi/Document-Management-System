import fp from "fastify-plugin"
import fastifyCookie from "@fastify/cookie"

const cookiePlugin = fp(async (fastify)=>{
    fastify.register(fastifyCookie,{
        secret: process.env.COOKIE_SECRET,
        parseOptions:{}
    })
})

export default cookiePlugin