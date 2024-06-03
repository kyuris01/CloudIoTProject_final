require('dotenv').config();
const { MongoClient } = require('mongodb');
const URI = process.env.CONNECTION_STRING;
const client = new MongoClient(URI);

exports.handler = async (event) => {
  const run = async () => {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        const requestData = JSON.parse(event.body);
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        const resultObject = await findOne(client, requestData.userId, requestData.date);
        return resultObject;
    } 
    catch (e) {
        console.error(e);
        return null;
    }
    finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
  }
  
  async function findOne(client, userId, date) {
    const result = await client.db().collection("user_info").findOne({ userId: userId , date: date });
    return result;
  }
  
  const result = await run();
  const response = {
    statusCode: 200,
    body: JSON.stringify(result)
  };
  return response;
};