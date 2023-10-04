import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { prisma } from "./lib/db";

async function init() {
  const app = express();
  const port = Number(process.env.PORT) || 8000;

  app.use(express.json());

  // create graphql server

  const server = new ApolloServer({
    // Schema
    typeDefs: `type Query{
      hello: String
      say(name:String): String
    }
    type Mutation {
      createUser( firstName: String!, lastName: String!,email: String!, password: String! ): Boolean
    }
    `,
    // function
    resolvers: {
      Query: {
        hello: () => `Hello there!`,
        say: (_, { name }: { name: string }) => `Hey ${name}, How are you!`,
      },
      Mutation: {
        createUser: async (
          _,
          {
            firstName,
            lastName,
            email,
            password,
          }: {
            firstName: string;
            lastName: string;
            email: string;
            password: string;
          }
        ) => {
          await prisma.user.create({
            data: { firstName, lastName, email, password, salt: "my_salt" },
          });
          return true;
        },
      },
    },
  });

  // start graphql server

  await server.start();

  app.get("/", (req, res) => {
    res.send("Hello World!");
  });

  app.use("/graphql", expressMiddleware(server));

  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
}

init();
