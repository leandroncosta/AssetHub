import { User } from './../types/user/user';
import { date, z } from "zod"
import { FastifyTypedInstance } from "../types"
import { randomUUID } from 'node:crypto';
import jwt from 'jsonwebtoken'

const SECRET_KEY = "teste"

const users: User[] = []
const base = "api"
export const routes = async (app: FastifyTypedInstance) => {
  app.get(`/users`, {
    schema: {
      tags: ['users'],
      description: "List users",
      response: {
        200: z.array(z.object({
          id: z.string(),
          name: z.string(),
          email: z.email()
        }))
      }
    },
  }, async (_, reply) => {
    return reply.send(users)
  })

  app.post(`/register`, {
    schema: {
      description: "create a new user",
      tags: ['users'],
      body: z.object({
        name: z.string(),
        email: z.email(),
        password: z.string()
      }),
      response: {
        201: z.null().describe("User created")
      }
    },

  }, async (req, reply) => {
    const { name, email, password } = req.body

    users.push({
      id: randomUUID(),
      name,
      email,
      password
    })

    reply.status(201).send()
  })

  app.post(`/login`, {
    schema: {
      tags: ["login"],
      body: z.object({
        email: z.email(),
        password: z.string()
      }),
      response: {
        401: z.null().describe("invalid credentials"),
        200: z.string()
      }
    }
  }, async (req, reply) => {
    const { email, password } = req.body

    const user = users.find(u => u.email == email)

    if (user?.email == email && password == user.password) {
      const payload = {
        name: user.name,
        email: user.email,
      }
      const token = await jwt.sign(payload, SECRET_KEY, {
        expiresIn: "1h"
      })
      return reply.status(200).send(token)
    } else {
      return reply.status(401);
    }
  })

}