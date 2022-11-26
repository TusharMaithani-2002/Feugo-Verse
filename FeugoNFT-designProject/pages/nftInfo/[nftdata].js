import React from 'react'
import { useAppContext } from '../../context/context'
import Card from '../nft-card';
import {useRouter} from 'next/router'
import Image from 'next/image';
import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from 'web3modal'
// import Card from './nft-card'
import {
  marketplaceAddress
} from '../../config'

import NFTMarketplace from '../../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json'

function InfoNft(children) {
  
  const router = useRouter();
  const {nftdata} = router.query
  const {nfts,setNfts} = useAppContext();
  
  async function loadNFTs() {
    /* create a generic provider and query for unsold market items */
    const provider = new ethers.providers.JsonRpcProvider()
    const contract = new ethers.Contract(marketplaceAddress, NFTMarketplace.abi, provider)
    const data = await contract.fetchMarketItems()

    /*
    *  map over items returned from smart contract and format 
    *  them as well as fetch their token metadata
    */
   console.log(data);
    const items = await Promise.all(data?.map(async i => {
      const tokenUri = await contract.tokenURI(i.tokenId)
      // const tokenUri = await data.tokenUri
      const {data: { image, name, description}} = await axios.get(tokenUri)
      let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
      let item = {
        price,
        tokenId: i.tokenId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        image,
        name,
        description,
        tokenUri
      }
      return item
    }))
    console.log(items);
    setNfts(items);
    console.log(nfts);
    // setLoadingState('loaded') 
  }
  async function buyNft(nft) {
    /* needs the user to sign the transaction, so will use Web3Provider and sign it */
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(marketplaceAddress, NFTMarketplace.abi, signer)

    /* user will be prompted to pay the asking proces to complete the transaction */
    const price = ethers.utils.parseUnits(nft.price.toString(), 'ether')   
    const transaction = await contract.createMarketSale(nft.tokenId, {
      value: price
    })
    await transaction.wait()
    loadNFTs()
  }
  
  const requiredNft = nfts.find(nft=> nft.tokenId === +nftdata)
  console.log(requiredNft);
  return (
   <div className='flex  justify-center' style={{
    backgroundColor:'#343444'
   }}>
    <div className='flex h-screen justify-between w-2/3'>
    <div>
    <Image src={!requiredNft?.image ? "https://via.placeholder.com/1500" : requiredNft?.image} alt="" height={500} width={560}
    className="rounded-2xl shadow-white"
    style={{
      boxShadow:"5px 10px white",
    }}
    ></Image>
    </div>
    <div className='flex flex-col justify-around items-center h-2/3 text-white'>
      <p className=''><span >Description :</span>{requiredNft?.description}</p>
 
      <p className=''><span >Owner :</span>{requiredNft?.seller}</p>
      <p className=''><span >Price :</span>{requiredNft?.price}</p>

     <div>
       <button className=" bg-pink-500 text-white font-bold rounded-md h-10 w-40 text-center" onClick={() => buyNft(requiredNft)}>Buy</button>
     </div>
    </div>
    </div>
   </div>
  )
}

export default InfoNft


