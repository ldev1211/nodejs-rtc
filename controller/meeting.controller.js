const meetingService = require("../services/meeting-service");

exports.startMeeting = (req,res,next) =>{
    const {hostId,hostName} = req.body;
    var model = {
        hostId: hostId,
        hostName: hostName,
        startTime:Date.now()
    };
    meetingService.startMeeting(model,(err,result)=>{
        if(err) return next(err);
        return res.status(200).send({
            message:"Success",
            data:result.id
        })
    })
}

exports.checkMeetingExists = (req,res,next) =>{
    const {meetingId} = req.query;
    meetingService.checkMeetingExisits(meetingId,(err,result)=>{
        if(err) return next(err);
        return res.status(200).send({
            message:"Success",
            data:result
        });
    });
}

exports.getAllMeetingUsers = (req,res,next) =>{
    const {meetingId} = req.query;
    meetingService.getAllMeetingUsers(meetingId,(err,result)=>{
        if(err) return next(result);
        return res.status(200).send({
            message:"Success",
            data:result
        })
    });
}