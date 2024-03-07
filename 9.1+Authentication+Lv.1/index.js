import express from "express";
import bodyParser from "body-parser";
import pg from "pg"

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "LoginSignup",
  password: "Arinjay@04",
  port: 5432,
});
db.connect();


const app = express();
const port = 3000;





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
    await db.query("INSERT INTO arinjay(name, password) VALUES ($1, $2)", [email, password]);
    res.redirect('/login');
  } catch (err) {
    console.error("Error executing query", err);
    res.status(500).send("Error registering user");
  }
});

app.post("/login", async (req, res) => {  

  const email = req.body.username;
  const password = req.body.password;

  try{
    const result = await db.query("SELECT * FROM arinjay WHERE name = $1", [email]);

    if(result.rows.length>0){
        const  searchpass = result.rows[0].password;

         if( password === searchpass){
             res.render("secrets.ejs");
         }
         else{
          res.send("Incorrect password");
         }
    }
    else{
      res.send("User not found");
    }

  }catch(err){
    console.error(err);
    res.status(500).send("Internal Server Error");
  }

  

});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
