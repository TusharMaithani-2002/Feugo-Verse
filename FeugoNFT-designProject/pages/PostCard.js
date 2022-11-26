import React,{useEffect, useState} from 'react'
import Axios from 'axios'


function PostCard({nft}) {
  
  const [currNft, setcurrNft] = useState({})
  const [address,setAddress] = useState("")

  useEffect(()=>{
    getNftData();
  },[])

  async function getNftData() {
    const nftData = await Axios.get(nft);
    console.log(nftData.data);
    setcurrNft(nftData.data)
    // setAddress(nftData.account)
   
  }

  function dateForPost() {
    const date = currNft.date;
    const monthMapNumber = {
      '0' : "jan",
      '1' : "feb",
      '2' : "mar",
      '3' : 'apr',
      '4' : 'may',
      '5' : "jun",
      '6' : "jul",
      '7' : "aug",
      '8' : "sept",
      '9' : "oct",
      '10' : "nov",
      '11' : "dec"
    }
    const strDate = `${date.date} ${monthMapNumber[date.month]}`;
    return strDate;

  }

  return (
    <>
    {currNft && 
    <div className='flex flex-col justify-around items-center p-2 m-2  rounded-2xl' style={{
      heihgt:"400px",
      width:"400px",
      backgroundColor:"#4C3575",
      color:"white"
    }}>
       
        <div className='p-2'>{
          currNft.account
        }</div>
        <img src={currNft.image} alt="" height={350} width={350} className="rounded-xl"/>
        <div className='pt-2'>{currNft.description}</div>
        <div className='pt-2'>{currNft.date?dateForPost():""}</div>
        
    </div>
    }
    </>
  )
}

export default PostCard