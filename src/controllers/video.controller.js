import { User } from '../models/user.model.js';
import { apiError } from '../utils/apiError.js';
import { AsyncHandler } from '../utils/AsyncHandler.js';
import fs from 'fs'
import { savetoCloudinary } from '../utils/cloudinary.js';
import { Video } from '../models/video.model.js';
import { apiResponse } from '../utils/apiResponse.js';

const addVideo = AsyncHandler(async (req, res) => {

    try {
        const {title,description} = req.body;

        if(!title || !description){
         throw new apiError(401,"Enter title and description")
        } 
    
        const userId = req.user._id;

        const user = await User.findById(userId)

        if(!user){
            throw new apiError(401,"User not found")
        }
    
        const videoLocalPath = req.files?.videoFile[0]?.path

        if(!videoLocalPath){
            throw new apiError(401,"Video file is required")
        }

        const thumbnailLoaclPath = req.files?.thumbnail[0].path

        if(!thumbnailLoaclPath){
            throw new apiError(401,"Thumbnail is required")
        }

        const video = await savetoCloudinary(videoLocalPath)

        if(!video.url){
            req.files && fs.unlinkSync(req.files?.videoFile[0]?.path)  ;
            throw new apiError(500,"Error uploading video")
        }

       const thumbnail = await savetoCloudinary(thumbnailLoaclPath)

        if(!thumbnail.url){
            req.files && fs.unlinkSync(req.files?.thumbnail[0].path)
            throw new apiError(500,"Error uploading thumbnail")
        }

        const newVideo = await Video.create({
            videoFile : video.url,
            thumbnail:thumbnail.url,
            title,
            description,
            duration:video.duration,
            owner:user._id
        })

      
        return res.status(200).json(new apiResponse(201,"video added successfully",newVideo))



        


    } catch (error) {

     
       
       
        throw new apiError(500,error.message);
        
    }


 });

const deleteVideo = AsyncHandler(async (req, res) => {});

const getAllvideos = AsyncHandler(async (req, res) => {});

const updateVideo = AsyncHandler(async (req, res) => {});

const getVideoById = AsyncHandler(async (req, res) => {});

const togglePublishStatus = AsyncHandler(async (req, res) => {});

export { addVideo, deleteVideo, getAllvideos, updateVideo, getVideoById,togglePublishStatus };
