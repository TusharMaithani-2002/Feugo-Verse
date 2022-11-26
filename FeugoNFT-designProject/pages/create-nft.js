import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import { useRouter } from 'next/router'
import Web3Modal from 'web3modal'


const projectId='2FnKfrWQLgNGvoAJdla6njvBtjL'
const projectSecret='1cd1acc4f7832bb3b8b3a8aec8e517ba';
const auth = 'Basic '+Buffer.from(projectId+":"+projectSecret).toString('base64')

const client = ipfsHttpClient({
  host:'ipfs.infura.io',
  port:5001,
  protocol:"https",
  headers:{
    authorization:auth
  }
})

import {
  marketplaceAddress
} from '../config'

import NFTMarketplace from '../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json'
import Image from 'next/image'

export default function CreateItem() {
  const [fileUrl, setFileUrl] = useState(null)
  const [formInput, updateFormInput] = useState({ price: '', name: '', description: '' })
 
  const router = useRouter()

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
    const { name, description, price } = formInput
    if (!name || !description || !price || !fileUrl) return
    /* first, upload to IPFS */
    const data = JSON.stringify({
      name, description, image: fileUrl
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

  async function listNFTForSale() {
    const url = await uploadToIPFS()
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    /* next, create the item */
    const price = ethers.utils.parseUnits(formInput.price, 'ether')
    let contract = new ethers.Contract(marketplaceAddress, NFTMarketplace.abi, signer)
    let listingPrice = await contract.getListingPrice()
    listingPrice = listingPrice.toString()
    let transaction = await contract.createToken(url, price, { value: listingPrice })
    await transaction.wait()
   
    router.push('/')
  }
  function myLoader(){
    return fileUrl;
  }

  function confirmBox() {
    const box = document.getElementById("confirm-box")
    box.classList.toggle("hidden")
    const container = document.getElementById("main-container")
    container.classList.toggle("hidden")
  }
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
  return (
    <>
    <div className="flex justify-center min-h-screen overflow-y-hidden" id="main-container" style={{ backgroundColor:'#343444'
    }}>
      <div className="w-1/2 flex flex-col pb-12" >
        <input 
          placeholder="Asset Name"
          className="mt-8 border-2 border-purple-600 rounded p-4 "
          onChange={e => updateFormInput({ ...formInput, name: e.target.value })}
        />
        <textarea
          placeholder="Asset Description"
          className="mt-2 border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, description: e.target.value })}
        />
        <input
          placeholder="Asset Price in Eth"
          className="mt-2 border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, price: e.target.value })}
        />
        <input
          type="file"
          name="Asset"
          id='file'          
          className='hidden mt-2'
          onChange={(e)=>onChange(e)}
        />
        <label className='mt-2 input-file cursor-pointer text-purple-500 h-6 w-40 bg-black text-center rounded-lg' htmlFor='file'>
          Choose photo
        
        </label>
        {
          fileUrl && (
            
            <Image loader={myLoader} className="rounded mt-4 object-contain" width="350" height="300" src={fileUrl} alt="nope"/>
            
          )
        }
        <button onClick={()=>{
          confirmBox()
          getWallet()
          }} className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg">
          Create NFT
        </button>
        {/* <button onClick={()=>listNFTForSale()} className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg">
          Create NFT
        </button> */}
      </div>
    </div>
        {/* <button onClick={()=>confirmBox()}>confirm box</button> */}
        <div className='h-screen w-100 flex justify-center items-center hidden' id="confirm-box">

         <div className='w-4/5 bg-gray-600 h-2/3 flex flex-col justify-evenly items-center'>
          <div id="info-container" className='w-full flex justify-evenly h-full text-white'>
          <div id="description-container" className=' w-1/2 flex flex-col justify-around items-center h-full font-bold text-2xl'>
          <div className='flex w-2/3'><span>name:</span>{" "+formInput.name}</div>
           <div className='flex w-2/3'><span>desc:</span>{formInput.description}</div>
           <div className='flex w-2/3'><span>price:</span>{formInput.price}</div>
           <div className='flex w-2/3'><span>account:</span>{account?(account.substring(0,4)+"..."+account.substring(35)):""}</div>
           </div>
           <div id="image-container" className=' w-1/2 flex justify-center items-center h-full'>{
          fileUrl && (
            
            <Image loader={myLoader} className="rounded mt-4 object-contain" width="500" height="450" src={fileUrl} alt="nope"/>
            
          )
        }
        </div>
        </div>
        <div className='flex w-full justify-around mb-4'>
        <button onClick={()=>confirmBox()} className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg">
          Go back
        </button>
          <button onClick={()=>listNFTForSale()} className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg">
          Create NFT
        </button>
        </div>
          
         </div>
        </div>
    </>
  )
}