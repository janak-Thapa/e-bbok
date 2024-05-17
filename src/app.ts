import express from "express";
import golbalErrorHnadler from "./middlewares/globalErrorHndler";
import userRouter from "./user/userRouter";


const app = express();

app.use(express.json())


app.get('/',(req,res)=>{
  res.json({message:"welcome to ebook api"})
})


app.use("/api/users", userRouter)

app.use(golbalErrorHnadler)


export default app;
