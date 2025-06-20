// src/plugins/multipart.ts
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import fastifyMultipart from '@fastify/multipart';
import fp from 'fastify-plugin';

const multiPartPlugin = fp(async (fastify: FastifyInstance, options: FastifyPluginOptions) => {
  fastify.register(fastifyMultipart, {
    limits: {
      fileSize: 3 * 1024 * 1024,
      files: 1, 
      fieldSize: 1024 * 1024 
    },
    
  });


});

export default multiPartPlugin;