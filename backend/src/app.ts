import Fastify from "fastify";
import { config } from "dotenv";
import corsPlugin from "./plugins/cors";
import loggerPlugin from "./plugins/logger";
import appRouter from "./routes";
import cookiePlugin from "./plugins/cookie";
import multiPartPlugin from "./plugins/multiPart";
import staticFilesPlugin from "./plugins/static";
import mysqlplugin from "./plugins/mysql";


config();

const fastify = Fastify({logger:true})
  
// plugins
fastify.register(corsPlugin)
fastify.register(loggerPlugin)
fastify.register(cookiePlugin)
fastify.register(multiPartPlugin)
fastify.register(staticFilesPlugin);
fastify.register(mysqlplugin);

// main route
fastify.register(appRouter,{prefix:"/api"})

export default fastify