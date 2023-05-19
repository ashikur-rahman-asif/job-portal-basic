const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
// asif
// wBiTyKhExmCOL4Uh

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zu5djt5.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const jobsCollection = client.db("job-post").collection("jobs");
    // creating index on two fields
    const indexKeys = { title: 1, category: 1 }; // Replace field1 and field2 with your actual field names
    const indexOptions = { name: "titleCategory" }; // Replace index_name with the desired index name
    const result = await jobsCollection.createIndex(indexKeys, indexOptions);

    app.post("/postJob", async (req, res) => {
      const body = req.body;
      body.createdAt = new Date();
      if (!body) {
        return res.status(404).send({ message: "body data not found" });
      }
      const result = await jobsCollection.insertOne(body);
      res.send(result);
      console.log(result);
    });
    app.get("/alljobs/:id", async (req, res) => {
      if (req.params.id == "remote" || req.params.id == "offline") {
        const result = await jobsCollection
          .find({ status: req.params.id })
          .sort({ createdAt: -1 })
          .toArray();

        return res.send(result);
      }
      const result = await jobsCollection
        .find({})
        .sort({ createdAt: -1 })
        .toArray();
      res.send(result);
    });
    app.get("/myJobs/:email", async (req, res) => {
      console.log(req.params.email);
      const result = await jobsCollection
        .find({ postedBy: req.params.email })
        .toArray();
      res.send(result);
    });
    app.get("/getJobsByText/:text", async (req, res) => {
      const searchText = req.params.text;
      const result = await jobsCollection
        .find({
          $or: [
            { title: { $regex: searchText, $options: "i" } },
            { category: { $regex: searchText, $options: "i" } },
          ],
        })
        .toArray();
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Job portal is running");
});

app.listen(port, () => {
  console.log(`Job portal is runnning on ${port}`);
});
