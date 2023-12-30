const redis = require('redis');
const express = require("express")
const app = express()
const path = require("path")
const tasarimYolu = path.join(__dirname,'../tasarim')
const collection = require("./veri_tabani")
app.engine('html', require('ejs').renderFile);
const port = process.env.PORT || 3000
const { Client } = require('pg');
const { name } = require('ejs');
const baglan = redis.createClient();


baglan.connect();

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
app.use(express.static(path.join(__dirname, '/public')));
app.use(express.static(__dirname + '/public/giris_sayfa.css'));
app.set("view engine","ejs")
app.set("views",tasarimYolu)
app.use(express.urlencoded({
  extended:false
}))


baglan.on('connect', async function () {
  
    console.log('Redis client bağlandı');
});
baglan.on('error', function (error) {
  console.log(error);
});


app.get("/", (req, res) => {
  
  res.render(path.join(__dirname, '..', 'tasarim', 'giris_sayfa.ejs')); 
});

app.get("/kayit_sayfa", (req, res) => {
  res.render(path.join(__dirname, '..', 'tasarim', 'kayit_sayfa.ejs')); 
});
app.get('/ana_sayfa', (req, res) => {
  res.render(path.join(__dirname, '..', 'tasarim', 'ana_sayfa.ejs'));
});
app.get('/ana_sayfa_giris',async (req, res) => {

  res.render(path.join(__dirname, '..', 'tasarim', 'ana_sayfa_giris.ejs'));
  
});
app.get('/search_sayfa',async (req, res) => {

  res.render(path.join(__dirname, '..', 'tasarim', 'search_sayfa.ejs'));
  
});

app.post('/kayit_sayfa', async (req, res) => {
  try {
    const { name, password } = req.body;

    const existingUser = await collection.findOne({ name });
    if (existingUser) {
      res.send("Kullanıcı zaten var");
    } else {
      await collection.insertMany({ name, password });
      
     // res.redirect(`/ana_sayfa?name=${name}`);
     res.send("kullnıcı kaydedildi")
    }
  } catch (error) {
    console.log(error)
    res.status(500).send('Bir hata oluştu');
  }
});


app.post("/giris_sayfa", async (req, res) => {
  try {
      const { name, password } = req.body;

      const user = await collection.findOne({ name, password });
      
      
      if (!user || user.password !== password) {
          res.send("Kullanıcı bulunamadı veya şifre yanlış");
      } else {
        
       /* const user1 = await client.query('SELECT sehir, ulke, cepno, adres FROM postgres WHERE name = $1', [name]);
        console.log(user1.rows[0])
       
        const key = `kullanici-${name}`;
        const value = {
          name: name,
          sehir: user1.rows[0].sehir, 
          ulke: user1.rows[0].ulke,
          cepno: user1.rows[0].cepno,
          adres: user1.rows[0].adres,
        };
        await baglan.set(key, JSON.stringify(value));
         
        const data = await baglan.get(key);
        console.log(data)*/
        
        res.render('ana_sayfa_giris', {name});
      
      }
  } catch (error) {
      console.log(error);
      res.send("Bir hata oluştu, lütfen tekrar deneyin.");
  }
});


app.post('/ana_sayfa', async (req, res) => {
  try {
      const { sehir, ulke, cepno, adres, name } = req.body;

      const query = 'INSERT INTO postgres (sehir, ulke, cepno, adres, name) VALUES ($1, $2, $3, $4, $5)';
      const values = [sehir, ulke, cepno, adres, name];

      await client.query(query, values);
      res.send("İşlem başarılı");
  } catch (error) {
      console.error(error);
      res.send('Bir hata oluştu, lütfen tekrar deneyin.');
  }
});

/*app.post("/search_sayfa", async (req, res) => {
  const userName = req.body.searchInput;
    console.log(userName);
  try {
    
    const result = await client.query('SELECT sehir, ulke, cepno, adres FROM postgres WHERE name = $1', [userName]);
    const user = result.rows[0];
   
    res.render('search_sayfa', {
      sehir: user ? user.sehir : null,
      ulke: user ? user.ulke : null,
      cepno: user ? user.cepno : null,
      adres: user ? user.adres : null
    });

  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});*/
app.post("/search_sayfa", async (req, res) => {
  const userName = req.body.searchInput;
  console.log(userName);

  try {
      const result = await client.query('SELECT sehir, ulke, cepno, adres FROM postgres WHERE name = $1', [userName]);
      const user = result.rows[0];

      const html = `
          <div id="user-info">
              <p>Şehir: ${user ? user.sehir : "Bulunamadı"}</p>
              <p>Ülke: ${user ? user.ulke : "Bulunamadı"}</p>
              <p>Cep No: ${user ? user.cepno : "Bulunamadı"}</p>
              <p>Adres: ${user ? user.adres : "Bulunamadı"}</p>
          </div>
      `;

      res.render('search_sayfa', {
        sehir: user ? user.sehir : null,
        ulke: user ? user.ulke : null,
        cepno: user ? user.cepno : null,
        adres: user ? user.adres : null
      });
      
  } catch (error) {
      console.error(error);
      res.status(500).send(error);
  }
});


app.listen(port, () => {
  console.log('Port başarılı');
});
