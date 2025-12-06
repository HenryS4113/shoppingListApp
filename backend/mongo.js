const mongoose = require("mongoose");

if (process.argv.length < 3) {
  console.log("give password as argument");
  process.exit(1);
}

const password = process.argv[2];

const url = `mongodb+srv://fullstack:${password}@cluster0.a5qfl.mongodb.net/noteApp?retryWrites=true&w=majority&appName=Cluster0`;

mongoose.set("strictQuery", false);
mongoose.connect(url);

const itemSchema = new mongoose.Schema({
  content: String,
  important: Number,
  quantity: Number,
  purchased: Boolean,
});

const Item = mongoose.model("Item", itemSchema);

Item.find({}).then((result) => {
  result.forEach((item) => {
    console.log(item);
  });
  mongoose.connection.close();
});
