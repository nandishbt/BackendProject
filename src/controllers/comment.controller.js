import { apiError } from "../utils/apiError.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import {Video} from '../models/video.model.js';
import { Comment } from "../models/comment.model.js";
import {apiResponse} from '../utils/apiResponse.js'
import mongoose from "mongoose";


const addComment = AsyncHandler(async (req,res)=>{

    const {comment} = req.body;
    const {videoId} = req.params;

    const userId = req.user._id;

    if(!userId){
        throw new apiError(404,"User not logged in")
    }

    if(!comment){
        throw new apiError(404,"Comment is required")
    }

    const video = await Video.findById(videoId)

   
    

    if(!video){
        throw new apiError("Video not found")
    }

    const newComment  = await Comment.create({
        comment,
        video: video._id,
        owner: userId
    })

    const createdcomment = await Comment.findById(newComment._id);

    if(!createdcomment){
        throw new apiError("Failed to create comment")
    }

    return res.status(200)
    .json(new apiResponse(201,'comment added',createdcomment))


})

const getAllComments = AsyncHandler(async (req,res)=>{

    try {
        const {videoId} = req.params;
    
        const video = await Video.findById(videoId)
    
        if(!video){
            throw new apiError("Video not found")
        }
    
    
        const comments = await Comment.aggregate([
            {
                $match:{
                    video: new mongoose.Types.ObjectId(videoId)
                }
            },
    
            {
                $lookup:{
                    from:'users',
                    localField:'owner',
                    foreignField:'_id',
                    as:'owner',
                    pipeline:[{
                        $project:{
                            username:1,
                            fullName:1
                        }
                    }],
    
                    
                },
                
                
            },

            {
                $addFields:{
                    owner:{
                        $first:"$owner"
                    }
                }
            },

           {
            $project:{
                comment:1,
                owner:1
            }
           }
            
    
        ])


        if(comments.length === 0){
            throw new apiError(404,"No comments found for this video")
        }
    
    
      
       
    
        return res.status(200)
       .json(new apiResponse(200,'comments retrieved',comments))
    } catch (error) {
        
        throw new apiError(500, error.message)
        
    }



}) 

const deleteComment = AsyncHandler(async (req,res)=>{

    const {commentId} = req.params;



    const comment = await Comment.findByIdAndDelete(commentId);

    // if(!comment){
    //     throw new apiError(404,"Comment not found")
    // }
    return res.status(200).json(new apiResponse(201,"deleted successfully"))
  



})

const updateComment = AsyncHandler(async (req,res)=>{

    const {commentId} = req.params;
    const {comment} = req.body;

    const updatedComment = await Comment.findByIdAndUpdate(commentId,{comment},{new:true});
    return res.status(200).json(new apiResponse(200,"updated successfully",updatedComment))

})


export {addComment,getAllComments,deleteComment,updateComment}