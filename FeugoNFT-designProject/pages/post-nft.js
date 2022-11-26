import { ethers } from 'ethers';
import Image from 'next/image';
import React, { useEffect } from 'react'
import { useState } from 'react'
import { create as ipfsHttpClient } from 'ipfs-http-client'
// const fs = require('fs')
import Axios from 'axios'
import PostCard from './PostCard';
const projectId=''
const projectSecret='';
const auth = 'Basic '+Buffer.from(projectId+":"+projectSecret).toString('base64')

const client = ipfsHttpClient({
  host:'ipfs.infura.io',
  port:5001,
  protocol:"https",
  headers:{
    authorization:auth
  }
})


function SocialMedia() {
 
  const [postData,setPostData] = useState([]);
  
  const [account, setAcccount] = useState(null)
  async function getWallet() {
    let accounts = await window.ethereum.request({
      method:'eth_requestAccounts'  
    })
    setAcccount(accounts[0]);
    window.ethereum.on('accountsChanged',async() => {
      getWallet();
    })

  }



  const [allPosts,setAllPosts] = useState([]);
  const [fileUrl,setFileUrl]  = useState(null);
  const [post, setPost] = useState({
    description:'',
    username:''
  })
  async function onChange(e) {
    const file = e.target.files[0]
    try {
      const added = await client.add(
        file,
        {
          progress: (prog) => console.log(`received: ${prog}`)
        }
      )
      const url = `https://fuego-marketplace.infura-ipfs.io/ipfs/${added.path}`
      setFileUrl(url)
    } catch (error) {
      console.log('Error uploading file: ', error)
    }  
  }
  async function uploadToIPFS() {
    const { description } = post
    if ( !description  || !fileUrl) return
    /* first, upload to IPFS */
    await getWallet();
    let time = new Date()

    let date = {
      month: time.getMonth(),
      date : time.getDate(),
      time : time.getTime()
    }
    // console.log();
    const data = JSON.stringify({
      account,description, image: fileUrl,date
    })
    try {
      const added = await client.add(data)
      const url = `https://fuego-marketplace.infura-ipfs.io/ipfs/${added.path}`
      /* after file is uploaded to IPFS, return the URL to use it in the transaction */
      return url
    } catch (error) {
      console.log('Error uploading file: ', error)
    }  
  }
 async function postTweet() {
     const url = await uploadToIPFS();
     console.log(url)
     Axios.post("http://localhost:8888/post-nft",{
      post:url
     }).then(function(response){
      console.log(response)
     }).catch(function(error){
      console.log(error);
     })
  }
   useEffect(()=>{
      getTweets()
    },[])
  async function getTweets() {
     const data = await Axios.get("http://localhost:8888/nft-data");
     console.log("nft data",data);
    setPostData(data.data)
    console.log(postData);
  }
  // getTweets()
  function myLoader(){
    return fileUrl;
  }

  return (
    <div className='flex flex-col justify-center items-center' style={{
      backgroundColor:"#343444"
    }}>
      <div className='flex flex-col w-1/2'>
        <textarea className='border-none rounded-sm' type="text" onChange={e=>setPost({...post,description:e.target.value})} placeholder="description here..."/>
        <input type="file" className='border hidden' id='file' onChange={(e)=>onChange(e)} />
        <label htmlFor="file" className='border rounded-md w-1/4 bg-purple-600 text-white text-center'
         
        >choose image</label> 
        {
          fileUrl && <Image loader = { myLoader} src={fileUrl} width={350} height={350} alt=""/>
        }
        <button className='border rounded-xl w-2/3 bg-purple-600 text-white' onClick={postTweet}>post</button>
      </div>
      <div className='w-100 flex flex-col justify-around items-center mb-3' style={{
   
      }}>
        { 
          postData.map((nft,i)=>(
            <PostCard nft={nft.url} key={i}/>
          ))
        }
       
      </div>
    </div>
  )
}

export default SocialMedia
