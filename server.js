/********************************************************************************
*  WEB422 – Assignment 1 
*  
*  I declare that this assignment is my own work in accordance with Seneca's 
*  Academic Integrity Policy: 
*  
*  https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html 
*  
*  Name: Seung Hoon Han 
*  Student ID: 108302233 
*  Date: 
* 
*  Published URL: ___________________________________________________________ 
********************************************************************************/

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const ListingsDB = require("./modules/listingsDB");

dotenv.config();
const app = express();
const HTTP_PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

const db = new ListingsDB();
db.initialize(process.env.MONGODB_CONN_STRING)
  .then(() => {
    app.listen(HTTP_PORT, () => {
      console.log(`Server running on http://localhost:${HTTP_PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect MongoDB:", err);
  });

app.get("/", (req, res) => {
  res.json({ message: "API Listening" });
});

app.post("/api/listings", async (req, res) => {
  try {
    const listing = await db.addNewListing(req.body);
    res.status(201).json(listing);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/api/listings", async (req, res) => {
  try {
    const { page = 1, perPage = 10, name = "" } = req.query;
    const listings = await db.getAllListings(
      parseInt(page),
      parseInt(perPage),
      name
    );
    res.status(200).json(listings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/api/listings/:id", async (req, res) => {
  try {
    const listing = await db.getListingById(req.params.id);
    if (listing) {
      res.status(200).json(listing);
    } else {
      res.status(404).json({ message: "Listings not founded" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put("/api/listings/:id", async (req, res) => {
  try {
    const result = await db.updateListingById(req.body, req.params.id);
    if (result.modifiedCount > 0) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: "Listings not founded or not modified" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete("/api/listings/:id", async (req, res) => {
  try {
    const result = await db.deleteListingById(req.params.id);
    if (result.deletedCount > 0) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: "Listing not founded" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.use((req, res) => {
  res.status(404).json({ message: "Route not founded" });
});
