import { AsyncHandler } from "../utils/AsyncHandler.js";
import { apiError} from '../utils/apiError.js';
import { Playlist } from "../models/playlist.model.js";
import {apiResponse} from '../utils/apiResponse.js';
 
const createPlaylist = AsyncHandler(async (req,res)=>{

    const {title,description} = req.body;

    // Validate inputs
    if(!title ||!description){
        throw new apiError(401,'Title and description are required');
    }

    const playlistExists = await Playlist.find({title})

    if(playlistExists){
        throw new apiError(401,'Playlist with the same title already exists');
    }
 
    const newplaylist = await Playlist.create({
        title,
        description,
        owner: req.user._id
    })

    if(!newplaylist) {
        throw new apiError(500,'Failed to create playlist');
    }

    return res.status(201).json(new apiResponse(201,"playlist created successfully",newplaylist))





})

const getPlaylists = AsyncHandler( async (req,res)=>{

    const playlists = await Playlist.find({owner: req.user._id});

    if(!playlists){
        throw new apiError(404,"No playlists found");
    }

    return res.status(200).json(new apiResponse(201,"Playlists fetched successfully",playlists))

})

const getPlaylistById = AsyncHandler( async (req,res)=>{
    const playlist = await Playlist.find({_id:req.params.playlistId})
    if(!playlist) {
        throw new apiError(404,"Playlist not found");
    }
    return res.status(200).json(new apiResponse(201,"Playlist fetched successfully",playlist))
})

const addVideoToPlaylist = AsyncHandler( async (req,res)=>{

    const playlist = await Playlist.findByIdAndUpdate(req.params.playlistId,{$push:{videos:req.params.videoId}},{new:true})

    if(!playlist){
        throw new apiError(404,"Playlist not found");
    }
    return res.status(200).json(new apiResponse(201,"Video added to playlist successfully",playlist))
    
})

const deleteVideoFromPlaylist = AsyncHandler( async (req,res)=>{

    const playlist = await Playlist.findByIdAndUpdate(req.params.playlistId,{$pull:{videos:req.params.videoId}},{new:true})
    
    if(!playlist){
        throw new apiError(404,"Playlist not found");
    }
    return res.status(200).json(new apiResponse(201,"Video removed from playlist successfully",playlist))
    
})

const updatePlaylist = AsyncHandler( async (req,res)=>{
    const {title,description} = req.body;
    
    const playlist = await Playlist.findByIdAndUpdate(req.params.playlistId,{title,description},{new:true})
    
    if(!playlist){
        throw new apiError(404,"Playlist not found");
    }
    return res.status(200).json(new apiResponse(201,"Playlist updated successfully",playlist))

    
})

const deletePlaylist = AsyncHandler( async (req,res)=>{

    const playlist = await Playlist.findByIdAndDelete(req.params.playlistId)
    
  
    return res.status(200).json(new apiResponse(201,"Playlist deleted successfully",playlist))
    
})

export {createPlaylist, getPlaylists, getPlaylistById, addVideoToPlaylist, deleteVideoFromPlaylist, updatePlaylist, deletePlaylist}
