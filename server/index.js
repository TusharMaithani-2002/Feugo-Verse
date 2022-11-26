// import { Express } from "express";
const Express = require('express')

const App = Express()
const port = 8888
const fs = require('fs')
const cors = require('cors')
const { log } = require('console')

App.use(Express.json())
let data = fs.readFileSync("data.json","utf-8")
data = JSON.parse(data)
console.log(data);
// log(data)

App.use(cors())

App.listen(port,()=>{
    console.log('listening');
})


App.get('/nft-data',(req,res) =>{
  if(data.length)  res.send(data)
  else res.send([]);
})

App.post('/post-nft',(req,res)=>{
    let tweet={
        url:req.body.post
    }
    // log(tweet)
    data.unshift(tweet);
    console.log(data);
    fs.writeFile("data.json",JSON.stringify(data),(err)=>{
     console.log(err);
    });
})