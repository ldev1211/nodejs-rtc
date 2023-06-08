const { meetingUser } = require("../model/meeting-user.model")
const { meeting } = require("../model/meeting.model")

async function getAllMeetingUsers(meetId,callback){
    meetingUser.find({meetingId:meetId}).then((response)=>{
        return callback(null,response);
    }).catch((error) => {
        return callback(error);
    })
}

async function startMeeting(params,callback){
    const meetingSchema = new meetingUser(params);
    meetingSchema.save().then((response)=>{
        return callback(null,response);
    }).catch((err)=>{
        return callback(err);
    });
}

async function joinMeeting(params,callback){
    const meetingUserModel = new meetingUser(params);

    meetingUserModel.save().then(async (reponse)=>{
        await meeting.findOneAndUpdate({id:params.meetingId},{$addToSet: {"meetingUsers":meetingUserModel}});
        return callback(null,reponse);
    }).catch((error)=>{
        return callback(error);
    });
}

async function isMeetingPresent(meetingId,callback){
    meeting.findById(meetingId).populate("meetingUsers","MeetingUser").then((response)=>{
        if(!response) callback("Invalid meeting ID");
        else callback(null,true);
    }).catch((err)=>{
        return callback(err,false);
    })
}

async function checkMeetingExisits(meetingId,callback){
    meeting.findById(meetingId,"hostId,hostName,startTime").populate("meetingUsers","MeetingUser").then((response)=>{
        if(!response) callback("Invalid meeting ID");
        else callback(null,response);
    }).catch((err)=>{
        return callback(err,false);
    })
}

async function getMeetingUser(params,callback){
    const {meetingId,userId} = params;
    
    meetingUser.find({meetingId,userId})
        .then((response)=>{
            return callback(null,response[0]);
        })
        .catch((err)=>{
            return callback(err);
        });
}

async function updateMeetingUser(params,callback){
    meetingUser.updateOne({userId:params.userId},{$set: params},{new:true})
        .then((response)=>{
            return callback(null,response);
        }).catch((err)=>{
            return callback(err);
        });
}

async function getUserBySocketId(params,callback){
    const {meetingId,socketId} = params;

    meetingUser.find({meeting,socketId}).limit(1)
        .then((response)=>{
            return callback(null,response);
        }).catch((err)=>{
            return callback(err);
        });
}

module.exports = {
    startMeeting,
    joinMeeting,
    getAllMeetingUsers,
    isMeetingPresent,
    checkMeetingExisits,
    getUserBySocketId,
    updateMeetingUser,
    getMeetingUser
}