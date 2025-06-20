import { FastifyRequest } from "fastify";
import { FastifyInstance } from 'fastify';
import { Pool, PoolConnection } from 'mysql2/promise';


declare module "fastify" {
  interface FastifyRequest {
    user?: {
      id: string;
      role: string;
      name: string
    };
    jwtData?: {
      id: string;
      role: string;
      name:string
    };
  }
  interface FastifyInstance {
    mysql: {
      getConnection(): Promise<PoolConnection>;
      query: Pool['query'];
    }
  }
}

