import "./preload.cjs";
import { env } from "./config/env.js";
import { app } from "./app.js";
import connectDB from "./config/database.js";

const port = process.env.PORT || 8000;

connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.log("EXPRESS SERVER ERROR :", error);
    });

    app.listen(port, () => {
      console.log(`server is running at port : ${port}`);
    });
  })
  .catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
  });