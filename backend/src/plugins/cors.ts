import fp from "fastify-plugin";
import cors from "@fastify/cors";

const corsPlugin = fp(async (fastify) => {
  fastify.register(cors, {
    origin: ["http://localhost:3000", "http://127.0.0.1:3000", "https://saildms.vercel.app"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true
  });
});

export default corsPlugin;
