"use strict";
const http = require("http");
const fs = require('fs')
const zlib = require("zlib");
const { pipeline } = require("stream");
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
//**************************************************************************     */

function hub(file1, file2) {
  pipeline(
    fs.createReadStream(file1),
    zlib.createGzip(),
    fs.createWriteStream(file2),
    (err) => {
      if (err) {
        console.error("error:", err);
      } else {
        console.log("done pipline!");
      }
    }
  );
}

hub("./input.txt", "./input.txt.gz");

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

// Part 3 

//1 هي عبارة عن while (true) بتاخد عمليت كتير وبتنفذها باولويه في المثال التالي سوف اوضح 
/*
setTimeout(()=>{
  console.log("Hello frome settime out 5000")
  },5000)
fs.readFile("./data.txt",utf-8,(err,data)=>{

    setimmidite(()=>console.log("hello from set immidite"))

    setTimeout(()=>{
      console.log("hello from set timeout 0")
      },0)
  })

cost server = http.createserver((req,res)=>{
  })
server.listen(3000,()=>console.log("server is running on port 3000"))
**** the event loop will do this prosess 
1- check Timeropertion if there is is any settimeout || setInterval ready for executed 
2- check the longRunningopertion and osopertion 
3- wait 
4- check if there is setimmidite to execute it
5- check if there is any close server service 
6- next tick 
if folow this setps will out put will be like this 

output 
1- server is running on port 3000
2 - hello from set immidite
3- hello from set timeout 0
4- hello from settime out 5000
توضيح السيرفر حيرجع الاول لان الفيل سيستم حياخد وقت لانه بيرن علي الرام مش عارف لو كانت علي الاستريم كان ايه اللي حيحصل هل حيتنفذ الاول ولاه السيرفر 
*/

// 2- libuv 
/*
هي مكتبة كل وظائف اللو ليفل زي os fs stream 
جافا اسكريبت مش بتقراء الملفات علي الفيل سيستم لكن بتقدر يقراها علي السيرفر  فقط بيتحول الكود بتعها ل c++ واقدر استخدم الزظائف بتعتها 
*/

// 3- 
/*

 */

// 4 - 

// 5- 
/*
libuv 
نود عندها اربع ثريدات تقدر تشتغل علي اكثر من عملية 
علشان اعرف حجم الثريد بستخدم 
set UV_THREADPOOL_SIZE = 6 or 4 
والافضل ملعبش فيهم 
*/  

// 6 
/*
مثال لو عندي ملف بقراءه حياخد وقت لو معومل بكود اسنكرونس حيتبعت ليفنت لوب ويكمل بقيت الاكواد التانيه عن طريق الثريدات التانيه لحد لما يخلص وبعد كده يرجعه لما يخلص 
fs.readFile("./data.txt","utf-8",()=>{
  console.log("async code") ده حيروح للكول ستاك يقعد لحد لما يخلص ويرجع بالسلامه 
  })
console.log("hi")
output 
1- hi 
2- async code 
fs.readFileSync("data.txt","utf-8",(data)=>{
  console.log(data)
  })
console.log("sync code") حيفضل واقف لحد لما العملية اللي فوق تخلص علشان مستني الثريد الوحيد 
*/