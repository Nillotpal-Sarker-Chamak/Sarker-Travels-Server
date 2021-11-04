const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vrvht.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('tourism');
        const spotsCollection = database.collection("places");
        const orderCollection = database.collection('requests');

        app.get('/touristSpots', async (req, res) => {
            await spotsCollection.find({}).toArray((err, result) => {
                if (err) throw err;
                else res.send(result)
            });

        });
        // add tourist spot
        app.post('/touristSpots', async (req, res) => {
            const spot = req.body;
            console.log('hitted', spot);
            const result = await spotsCollection.insertOne(spot);
            console.log(result);
            res.send(result)
        })

        // Get single spot
        app.get('/touristSpots/:id', async (req, res) => {

            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            await spotsCollection.find(query).toArray((err, result) => {
                if (err) throw err;
                else res.send(result)
            });
        })
        app.post('/interested', async (req, res) => {
            const data = req.body;

            const result = await orderCollection.insertOne(data);
            res.send(data);

        })

        //get particular list
        app.post('/mylists', async (req, res) => {
            const email = req.body.email;
            const query = { email: email };
            await orderCollection.find(query).toArray((err, result) => {
                if (err) throw err;
                else
                    res.send(result);

            });

        })

        // get all list
        app.get('/requestlists', async (req, res) => {
            await orderCollection.find({}).toArray((err, result) => {
                if (err) throw err;
                else
                    res.send(result);

            });

        })





        app.post('/acceptrequest', async (req, res) => {
            const id = req.body.id;
            const query = { _id: ObjectId(id) };
            const update = { $set: { request: 1 } };
            const orderCollection = client.db("tourism");
            const table = orderCollection.collection('requests');
            await table.updateOne(query, update, (err, result) => {
                if (err) throw err;
                else res.send(result);
            });
        })

        // })

        //delete request
        app.post('/deleterequest', async (req, res) => {
            const id = req.body.id;
            const query = { _id: ObjectId(id) };
            await orderCollection.deleteOne(query, (err, result) => {
                if (err) throw err;
                else res.send(result);
            });

        })

        app.post('/deleteplace', async (req, res) => {
            const id = req.body.id;
            const query = { _id: ObjectId(id) };
            await spotsCollection.deleteOne(query, (err, result) => {
                if (err) throw err;
                else res.send(result);
            });

        })



    }
    finally {
        // await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Running travel server');
})

app.listen(port, () => {
    console.log('Running genius server on port', port);
})