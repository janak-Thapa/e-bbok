import { config } from "./config";
import mongoose from "mongoose";

const connectDB = async ()=>{

 try{mongoose.connection.on("connected",()=>{
  console.log("connected to database sucessfully");
  
})

mongoose.connection.on("error",(err)=>{
  console.log("error in connecting to database",err);
})




  await mongoose.connect(config.databaseUrl as string);
  

 } catch(err){

  console.error("Failed to connect database",err);

  process.exit(1);
  

 }
}


export default connectDB;