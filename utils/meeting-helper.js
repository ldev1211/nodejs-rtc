const meetingService = require("../services/meeting-service");

const MeetingPayLoadEnum = require('../utils/meeting-payload.enum');

async function joinMeeting(meetingId,socket,meetingServer,payload){
    const {userId,name} = payload;

    meetingService.isMeetingPresent(meetingId,async(err,result)=>{
        if(err && !result){
            sendMessage(socket,{
                type:MeetingPayLoadEnum.NOT_FOUND
            });
        }
        if(result){
            addUser(socket,{meetingId,userId,name}).then((result)=>{
                if(result){
                    sendMessage(socket,{type:MeetingPayLoadEnum.JOINED_MEETING,data:{
                        userId
                    }});
                    broadcastUsers(meetingId,socket,meetingServer,{
                        type:MeetingPayLoadEnum.USER_JOINED,
                        data:{
                            userId,
                            name,
                            ...payload.data
                        }
                    })
                }
            },(err)=>{
                console.log(err);
            })
        }
    });
}

function forwardConnectionRequest(meetingId,socket,meetingServer,payload){
    const {userId,ortherUserId,name} = payload.data;

    var model = {
        meetingId:meetingId,
        userId: ortherUserId,
    };
    meetingService.getMeetingUser(model,(err,result)=>{
        if(result){
            var sendPayLoad = JSON.stringify({
                type:MeetingPayLoadEnum.CONNECTION_REQUEST,
                data:{
                    userId,
                    name,
                    ...payload.data
                }
            });
            meetingServer.to(result.socketId).emit('message',sendPayLoad);
        }
    })
}

function forwardIceCandidate(meetingId,socket,meetingServer,payload){
    const {userId,ortherUserId,candidate} = payload.data;

    var model = {
        meetingId:meetingId,
        userId: ortherUserId,
    };
    meetingService.getMeetingUser(model,(err,result)=>{
        if(result){
            var sendPayLoad = JSON.stringify({
                type:MeetingPayLoadEnum.ICECANDIDATE,
                data:{
                    userId,
                    candidate
                }
            });
            meetingServer.to(result.socketId).emit('message',sendPayLoad);
        }
    })
}

function forwardOfferSDP(meetingId,socket,meetingServer,payload){
    const {userId,ortherUserId,sdp} = payload.data;

    var model = {
        meetingId:meetingId,
        userId: ortherUserId,
    };
    meetingService.getMeetingUser(model,(err,result)=>{
        if(result){
            var sendPayLoad = JSON.stringify({
                type:MeetingPayLoadEnum.OFFER_SDP,
                data:{
                    userId,
                    sdp
                }
            });
            meetingServer.to(result.socketId).emit('message',sendPayLoad);
        }
    })
}
function forwardAnswerSDP(meetingId,socket,meetingServer,payload){
    const {userId,ortherUserId,sdp} = payload.data;

    var model = {
        meetingId:meetingId,
        userId: ortherUserId,
    };
    meetingService.getMeetingUser(model,(err,result)=>{
        if(result){
            var sendPayLoad = JSON.stringify({
                type:MeetingPayLoadEnum.ANSWER_SDP,
                data:{
                    userId,
                    sdp
                }
            });
            meetingServer.to(result.socketId).emit('message',sendPayLoad);
        }
    })
}

function userLeft(meetingId,socket,meetingServer,payload){
    const {userId} = payload.data;
    broadcastUsers(meetingId,socket,meetingServer,{
        type: MeetingPayLoadEnum.USER_LEFT,
        data:{
            userId:userId
        }
    });

    meetingService.getAllMeetingUsers(meetingId,(err,result)=>{
        for(let i=0;i<result.length;++i){
            const meetingUser = result[i];
            meetingServer.socket.connected[meetingUser.socketId].disconnect();
        }
    });
}

function forwardEvent(meetingId,socket,meetingServer,payload){
    const {userId} = payload.data;
    broadcastUsers(meetingId,socket,meetingServer,{
        type: payload.type,
        data:{
            userId:userId,
            ...payload.data
        }
    });
}

function endMeeting(meetingId,socket,meetingServer,payload){
    const {userId} = payload.data;
    broadcastUsers(meetingId,socket,meetingServer,{
        type: MeetingPayLoadEnum.USER_LEFT,
        data:{
            userId:userId
        }
    });
}

function sendMessage(socket,payload){
    socket.send(JSON.stringify(payload));
}

function addUser(socket,{meetingId,userId,name}){
    let promise = new Promise(function(resolve,reject){
        meetingService.getMeetingUser({meetingId,userId},(err,result)=>{
            if(!result){
                var model = {
                    socketId:socket.id,
                    meetingId: meetingId,
                    userId: userId,
                    joined: true,
                    name: name,
                    isAlive:true
                };

                meetingService.joinMeeting(model,(err,result)=>{
                    if(result){
                        resolve(true);
                    }
                    if(err) {
                        reject(err);
                    }
                })
            } else {
                meetingService.updateMeetingUser({
                    userId:userId,
                    socketId:socket.id,
                },(err,result)=>{
                    if(result) resolve(true);
                    if(err) reject(err);
                });
            }
        });
    });
    return promise;
}

function broadcastUsers(meetingId,socket,meetingServer,payload){
    socket.broadcast.emit("message",JSON.stringify(payload))
}

module.exports = {
    joinMeeting,
    forwardAnswerSDP,
    forwardOfferSDP,
    forwardConnectionRequest,
    forwardEvent,
    forwardIceCandidate,
    userLeft,
    endMeeting
}