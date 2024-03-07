import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from"bcrypt";

const app = express();
const port = 3000;
const saltrounds = 10;


const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "LoginSignup",
  password: "Arinjay@04",
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.get("/register", (req, res) => {
  res.render("register.ejs");
});

app.post("/register", async (req, res) => {
  const email = req.body.username;
  const password = req.body.password;

  try {
    const checkResult = await db.query("SELECT * FROM arinjay WHERE name = $1", [
      email,
    ]);

    if (checkResult.rows.length > 0) {
      res.send("Email already exists. Try logging in.");
    } else {

      bcrypt.hash(password , saltrounds , async (err , hash) => {

        if(err){
          console.log("errors in hashing " ,err);
        }
        else{
          const result = await db.query(
            "INSERT INTO arinjay (name , password) VALUES ($1, $2)",
            [email, hash]
          );
          console.log(result);
          res.render("secrets.ejs");
          }
      });
      
    }
  } catch (err) {
    console.log(err);
  }
});

app.post("/login", async (req, res) => {
  const email = req.body.username;
  const password = req.body.password;

  try {
    const result = await db.query("SELECT * FROM arinjay WHERE name = $1", [
      email,
    ]);

    if (result.rows.length > 0) {
      const user = result.rows[0];
      const storedPassword = user.password;

      // Compare the provided password with the stored hashed password
      bcrypt.compare(password, storedPassword, (err, result) => {
        if (err) {
          console.error("Error comparing passwords:", err);
          res.status(500).send("Internal Server Error");
          return;
        }

        if (result) {
          // Passwords match, render the secrets page
          res.render("secrets.ejs");
        } else {
          // Incorrect password
          res.status(401).send("Incorrect Password");
        }
      });
    } else {
      // User not found
      res.status(404).send("User not found");
    }
  } catch (err) {
    console.error("Error executing database query:", err);
    res.status(500).send("Internal Server Error");
  }
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
