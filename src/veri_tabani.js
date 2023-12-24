const mongoose = require("mongoose")

mongoose.connect("mongodb://localhost:27017/girisKayitSayfa")
.then(()=>{
    console.log("veri tabanına bağlandı")
}).catch(()=>{
    console.log("hata meydana geldi")
})

const LogInSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    }
})

const collection = new mongoose.model("Collection1",LogInSchema)
module.exports = collection 