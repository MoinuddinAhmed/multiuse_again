const mongoose = require("mongoose");

mongoose.set("strictQuery", false);
mongoose
  .connect("mongodb+srv://mahmed03:56768712@cluster0.zrso8by.mongodb.net/UserDB?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useCreateIndex: true,
  })
  .then(() => console.log("Connection Successfully...."))
  .catch((err) => console.log(err));

// mongoose.connect("mongodb+srv://abhijeet2000:abhi1234@cluster0.fo948ol.mongodb.net/?retryWrites=true&w=majority", { useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex:true }).then(()=>{
//     console.log('connection successfully');
// }).catch((e)=>{
//     console.log("no connection");
// })