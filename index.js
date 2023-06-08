const express = require("express");
const app = express();
const mongoose = require("mongoose");
const {MONGO_DB_CONFIG} = require("./config/app.config");
const http = require("http");
const server = http.createServer(app);
const {initMeetingServer} = require('./meeting-server');

mongoose.Promise = global.Promise;
mongoose.connect(MONGO_DB_CONFIG.DB,{
    useNewUrlParser:true,
    useUnifiedTopology: true
}).then(()=>{
    console.log("Database connected");
},(err)=>{
    console.log("Database can't connect. Error: "+err);
});

app.use(express.json());
app.use("/api",require("./route/app.route"));

initMeetingServer(server);

server.listen(process.env.port || 3000,()=>{
    console.log("Server is running");
})