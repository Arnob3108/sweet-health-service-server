const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.esqm07b.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const servicesCollection = client.db("sweetHealth").collection("services");
    const reviewsCollection = client.db("sweetHealth").collection("reviews");

    app.get("/services", async (req, res) => {
      const query = {};
      const cursor = servicesCollection.find(query);
      const services = await cursor.toArray();
      res.send(services);
    });

    app.get("/threeservices", async (req, res) => {
      const query = {};
      const cursor = servicesCollection.find(query);
      const threeServices = await cursor.limit(3).toArray();
      res.send(threeServices);
    });

    app.get("/service/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await servicesCollection.findOne(query);
      res.send(service);
    });

    // reviews-----

    app.get("/reviews", async (req, res) => {
      let query = {};
      if (req.query.service) {
        query = {
          "reviews.service": req.query.service,
        };
      }
      const cursor = reviewsCollection.find(query).sort({ time: -1 });
      const reviews = await cursor.toArray();
      res.send(reviews);
    });

    app.post("/reviews", async (req, res) => {
      const reviews = req.body;
      const result = await reviewsCollection.insertMany([
        { reviews: reviews, time: new Date() },
      ]);
      res.send(result);
    });
  } finally {
  }
}

run().catch((error) => console.error(error));

app.get("/", (req, res) => {
  res.send("review server is running");
});

app.listen(port, () => {
  console.log(`server running on ${port}`);
});
