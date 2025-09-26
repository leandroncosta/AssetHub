import { User } from './types/user/user';
import { fastifySwaggerUi } from '@fastify/swagger-ui';
import { fastify } from "fastify";
import { fastifyCors } from "@fastify/cors";
import { routes } from "./routes/routes";
import { validatorCompiler, serializerCompiler, jsonSchemaTransform } from 'fastify-type-provider-zod'
import { fastifySwagger } from "@fastify/swagger";
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import jwt from 'jsonwebtoken';
const SECRET_KEY = "teste"
export const app = fastify({ logger: true })
  .withTypeProvider<ZodTypeProvider>()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.register(fastifyCors, { origin: '*' })
app.addHook("onRequest", async (req, reply) => {
  const openRoutes = ["/login", "/register"];

  console.log(req.originalUrl, req.url)
  if (openRoutes.includes(req.originalUrl)) {
    return; // pula a checagem de token
  }

  const authHeader = req.headers.authorization
  if (!authHeader) {
    reply.status(401).send("Nao autorizado")
    return
  }

  const token = authHeader.split(" ")[1]
  console.log("token", token)
  if (!token) {
    reply.code(401).send({ error: "Token nao informado" });
    return;
  }
  await jwt.verify(token, SECRET_KEY, async (err, decoded) => {
    if (err) {
      console.log(decoded)
      reply.status(403).send("nao autorizado2")
    }
  })

})

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: "API Y",
      version: "1.0.0"
    }
  },
  transform: jsonSchemaTransform
})

app.register(fastifySwaggerUi, {
  routePrefix:
    "/docs"
})

app.register(routes)


