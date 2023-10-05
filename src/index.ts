import express from "express";
import { expressMiddleware } from "@apollo/server/express4";
import createApolloGraphqlServer from "./graphql";
async function init() {
  const app = express();
  const port = Number(process.env.PORT) || 8000;

  app.use(express.json());


  app.get("/", (req, res) => {
    res.send("Hello World!");
  });

  app.use("/graphql", expressMiddleware(await createApolloGraphqlServer()));

  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
}

init();

