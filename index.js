const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

//use middleware
app.use(cors());
app.use(express.json());

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ massage: "Sorry Unauthorized" });
    }

    jwt.verify(
        authHeader,
        process.env.ACCESS_TOKEN_SECRET,
        function (err, decoded) {
            if (err) {
                return res
                    .status(403)
                    .send({ massage: " Forbidden, does not have access " });
            }

            req.decoded = decoded;
            next();
        }
    );
}


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wb781.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
// client.connect(err => {
//     const itemCollection = client.db("eleventhAssignment").collection("item");
//     // perform actions on the collection object
//     console.log('connected')
//     client.close();
// });


async function run() {
    try {
        await client.connect();
        const itemCollection = client.db("eleventhAssignment").collection("item");
        const supplierCollection = client.db("eleventhAssignment").collection("supplier");


        app.post('/signIn', async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1d'
            });
            res.send({ accessToken });
        })

        app.get('/item', async (req, res) => {
            const query = {};
            const cursor = itemCollection.find(query);
            const items = await cursor.toArray();
            res.send(items);
        })

        app.post("/item", async (req, res) => {
            const doc = req.body;
            const result = await itemCollection.insertOne(doc);
            res.send(result);
        });


        app.get('/item/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await itemCollection.findOne(query);
            res.send(result);

        })

        app.put('/item/:id', async (req, res) => {
            const id = req.params.id;
            const updatedItem = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    quantity: updatedItem.quantity
                }
            }
            const result = await itemCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        })

        app.put('/item/:id', async (req, res) => {
            const id = req.params.id;
            const updatedItem = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    quantity: quantityMinus
                }
            }
            const result = await itemCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        })

        app.get("/myItem", verifyJWT, async (req, res) => {
            const decodedEmail = req?.decoded?.email;
            const email = req?.query?.email;

            if (email === decodedEmail) {
                const query = { email };
                const cursor = itemCollection.find(query);
                const myItem = await cursor.toArray();

                res.send(myItem);
            } else {
                res.status(403).send({ massage: " Forbidden, does not have access " });
            }
        });


        app.delete("/myItem/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await itemCollection.deleteOne(query);
            res.send(result);
        });

        app.get("/supplier", async (req, res) => {
            const query = {};
            const cursor = supplierCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });



    }

    finally { }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Running My Eleventh Assignment Server');
});
app.listen(port, () => {
    console.log('Eleventh Assignment Server is running on port :', port)
})