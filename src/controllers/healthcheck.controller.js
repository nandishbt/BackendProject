import { AsyncHandler } from "../utils/AsyncHandler.js";

const healthcheck = AsyncHandler(async (req,res)=>{
    res.status(200).json({message:"Server is running"})
})


export {healthcheck}