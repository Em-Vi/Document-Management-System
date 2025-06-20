import fp from "fastify-plugin";
import fastifyStatic from "@fastify/static";
import path from "path";
import { FastifyInstance, FastifyPluginOptions } from "fastify";

const staticFilesPlugin = fp(async (fastify: FastifyInstance, options: FastifyPluginOptions) => {
  const uploadDir = path.join(process.cwd(), "dist/uploads");

  // fastify.register(fastifyStatic, {
  //   root: uploadDir,
  //   prefix: "/uploads/", // Files will be served at /uploads/filename
  // });

  fastify.log.info(`Serving static files from: ${uploadDir}`);
})

export default staticFilesPlugin;
