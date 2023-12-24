const express = require("express")
const app = express()
const path = require("path")
const hbs = require("hbs")
const tasarimYolu = path.join(__dirname,'../tasarim')
const collection = require("./veri_tabani")
const port = process.env.PORT || 3000
const { Client } = require('pg');


const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'Alemdar.12',
    port: 5432, 
});
client.connect()
    .then(() => console.log('PostgreSQL veritabanına bağlandı'))
    .catch(err => console.error('Bağlantı hatası', err));

app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')));

app.set("view engine","hbs")
app.set("views",tasarimYolu)
app.use(express.urlencoded({
  extended:false
}))


app.get("/",(req,res) => {
    res.render("giris_sayfa")
})

app.get("/kayit_sayfa",(req,res) => {
    res.render("kayit_sayfa")
})

app.post("/kayit_sayfa", async (req, res) => {
  try {
      const { name, password } = req.body;

      const existingUser = await collection.findOne({ name });

      if (existingUser) {
          res.send("Kullanıcı zaten var");
      } else {
        await collection.insertMany({ name, password });
          res.render("ana_sayfa",{
            name:req.body.name  
          }); 
      }
  } catch (error) {
      res.send(error);
  }
});

app.post("/giris_sayfa", async (req, res) => {
  try {
      const { name, password } = req.body;

      const user = await collection.findOne({ name,password });
      
      if (!user || user.password !== password) {
          res.send("Kullanıcı bulunamadı veya şifre yanlış");
      } else {
        
        const user = await client.query('SELECT sehir, ulke, cepno, adres FROM postgres WHERE name = $1', [name]);
        
          res.render("ana_sayfa_giris",{
            name:req.body.name,
            sehir: user.rows[0].sehir,
            ulke:user.rows[0].ulke,
            cepno : user.rows[0].cepno,
            adres: user.rows[0].adres

          });
      }
  } catch (error) {
      console.log(error)
      res.send("Bir hata oluştu, lütfen tekrar deneyin.");
  }
});

app.post('/ana_sayfa', async (req, res) => {
  try {
      const { sehir, ulke, cepno, adres,name } = req.body;
      
      const query = 'INSERT INTO postgres (sehir, ulke, cepno, adres, name) VALUES ($1, $2, $3, $4, $5)';
      const values = [sehir, ulke, cepno, adres, name];

      await client.query(query, values);
      res.send("işlem başarılı")
  } catch (error) {
     console.error(error);
      res.send('Bir hata oluştu, lütfen tekrar deneyin.');
  }
});

app.get('/ana_sayfa_giris/:name', async (req, res) => {
    const { name } = req.params;
     console.log(name)
    try {
      
      const user = await client.query('SELECT sehir, ulke, cepno, adres FROM postgres WHERE name = $5', [name]);
      
      
    } catch (error) {
      res.status(500).send('Bir hata oluştu');
    }
  });

app.listen(port, () => {
    console.log('port başarılı');
})



