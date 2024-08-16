const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;

const app = express();

const corsOptions = {
  origin: ["http://localhost:5173", "https://taskonesearching.vercel.app"],
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.6xa5uzm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    const userCollection = client.db("taskOne").collection("users");
    const productCollection = client.db("taskOne").collection("products");
    const brandCollection = client.db("taskOne").collection("brands");
    const categoryCollection = client.db("taskOne").collection("category");
    // running
    app.get("/", (req, res) => {
      res.send("running");
    });

    // post user data in database
    app.post("/users", async (req, res) => {
      const userData = req.body;
      const result = await userCollection.insertOne(userData);
      res.send(result);
    });

    // get all users
    app.get("/users", async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });

    // get a user by email id
    app.get("/user/:email", async (req, res) => {
      const email = req.params.email;
      const result = await userCollection.findOne({ email });
      res.send(result);
    });

    // get all products
    app.get("/products", async (req, res) => {
      const {
        max,
        min,
        singleBrand,
        singleCategory,
        sorted,
        page = 1,
        perPage = 10,
      } = req.query;
      const query = {};
      if (singleCategory) query.category = singleCategory;
      if (singleBrand) query.brand = singleBrand;
      if (min || max) {
        query.price = {};
        if (min) query.price.$gte = parseFloat(min);
        if (max) query.price.$lte = parseFloat(max);
      }
      const sort = {};
      if (sorted === "lowToHigh") sort.price = 1;
      else if (sorted === "HighToLow") sort.price = -1;
      else if (sorted === "Newest") sort.creationDateTime = -1;
      const options = { sort };
      const result = await productCollection.find(query, options).toArray();
      const first = (parseInt(page) - 1) * parseInt(perPage);
      const document = result.slice(first, first + parseInt(perPage));
      res.send(document);
    });

    // get product count from backend
    app.get("/productCount", async (req, res) => {
      const count = await productCollection.estimatedDocumentCount();
      res.send({ count });
    });

    // get brand name
    app.get("/brands", async (req, res) => {
      const result = await brandCollection.find().toArray();
      res.send(result);
    });

    app.get("/category", async (req, res) => {
      const result = await categoryCollection.find().toArray();
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.listen(port, () => console.log("ok"));
