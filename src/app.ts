import express from "express";
import golbalErrorHnadler from "./middlewares/globalErrorHndler";


const app = express();


app.get('/',(req,res)=>{
  res.json({message:"welcome to ebook api"})
})


app.use(golbalErrorHnadler)


export default app;
