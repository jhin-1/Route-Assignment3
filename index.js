"use strict";
const http = require("http");
const fs = require('fs')
const save_data = (data)=>{fs.writeFileSync('./data.json',data)} // function to save date and chenged 
let users =  JSON.parse(fs.readFileSync('./data.json',"utf-8"))
// console.log(users.at(-1)) // for last index in array 


// part 1 

function readFileInChunks(filePath) {
  let readableStream = fs.createReadStream(filePath, {
    encoding: "utf-8",
    highWaterMark: 64*1024 
  });

  readableStream.on("data", (chunk) => {
    console.log(chunk);
  });

  readableStream.on("end", () => {
    console.log("Finished reading file");
  });
}
readFileInChunks('./data.json')
//**********************************************************************************     */
function writeStream(read,write){
    
let readStream = fs.createReadStream(read);
let writeStream = fs.createWriteStream(write);

readStream.on("data", (chunk) => {
  writeStream.write(chunk);
});

readStream.on("end", () => {
  writeStream.end();
  console.log("Done write ");
});
}
writeStream("./input.txt","./output.txt")





// part 2


const server = http.createServer((req,res)=>{
    let {url,method} = req
    if(url == '/users'&& method == "GET"){
        res.writeHead(200,{'Content-Type':'application/json'})
        res.write(JSON.stringify(users))
        res.end()
    }else if(url.startsWith("/get-user") && method == "GET"){
        let id = url.split("=")[1]
        let user = users.find((user)=>user.id == id)
        if(user){
            res.writeHead(200,{'Content-Type':'application/json'})
            res.write(JSON.stringify(user))
            res.end()
            return
        }else{
            res.writeHead(404,{'Content-Type':'application/json'})
            res.write(JSON.stringify({message:" Sorry user dont Found !"}))
            res.end()
            return
        }

    }else if(url == "/add-user"&& method == 'POST'){
        let id = users.length + 1
        let user_data;
        req.on('data',(data)=>{
            user_data = JSON.parse(data)
        })
        req.on("end",()=>{
            let email = users.find(user=>user.email == user_data.email)
            if(email){
                res.writeHead(400,{'content-type':'application:json'})
                res.write(JSON.stringify({message:" Sorry email already exist !"}))
                res.end()
               return
             }else{
                users.push({id,...user_data})
                save_data(JSON.stringify(users))
                res.writeHead(200,{'Content-Type':'application/json'})
                res.write(JSON.stringify({message:"user added successfully !",user:users.at(-1)}))
                res.end()
                return
             }
        })

    }else if (url.startsWith("/update-user/") && method == "PATCH"){
            let id = url.split("/")[2]
            console.log(id)
            let user = users.find(user=>user.id == id)
            let user_data;
            if(user){
                req.on('data',(data)=>{
                    user_data = JSON.parse(data)
                })
                req.on("end",()=>{
                    if(user_data.name !== undefined ) user.name = user_data.name
                    if(user_data.age !== undefined ) user.age = user_data.age
                    if(user_data.email !== undefined ) user.email = user_data.email
                    save_data(JSON.stringify(users))
                    res.writeHead(200,{'Content-Type':'application/json'})
                    res.write(JSON.stringify({message:"user updated successfully !",user}))
                    res.end()
                    return
                })
            }else{
                res.writeHead(404,{'Content-Type':'application/json'})
                res.write(JSON.stringify({message:" Sorry user dont Found !"}))
                res.end()
                return
            }


    } else if (url.startsWith("/delete-user/") && method == "DELETE"){
        let id = url.split("/")[2]
        console.log(id)
        let userindex = users.findIndex(user=>user.id == id)
        if (userindex != -1){
            users.splice(userindex,1)
            save_data(JSON.stringify(users))
            res.writeHead(200,{'Content-Type':'application/json'})
            res.write(JSON.stringify({message:"user deleted successfully !"}))
            res.end()
            return
        }else{
            res.writeHead(404,{'Content-Type':'application/json'})
            res.write(JSON.stringify({message:" Sorry user dont Found !"}))
            res.end()
            return
        }

    }
})

server.listen(3000,()=>console.log("server is running on port 3000"))

// let uurl = 'localhost:3000/get-user/1'
// let iid = uurl.split('/')
// console.log(iid)

// let ggg = "ahmed yosri ahmed "
// console.log(ggg.repeat(2000))