import  { FastifyInstance, FastifyPluginOptions } from "fastify";
import fp from 'fastify-plugin';
import fastifyMySQL from "@fastify/mysql";

const mysqlplugin = fp(async (fastify: FastifyInstance, options: FastifyPluginOptions) => {
    fastify.register(fastifyMySQL, {
        promise:true,
        connectionString: `mysql://${process.env.MYSQL_USER}:${process.env.MYSQL_PASS}@${process.env.MYSQL_HOST}/${process.env.MYSQL_DB}`,
    });
})

export default mysqlplugin;