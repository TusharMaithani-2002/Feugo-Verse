import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from 'web3modal'
import Card from './nft-card'
import {
  marketplaceAddress
} from '../config'
import Link from 'next/link'
import NFTMarketplace from '../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json'

export default function Home() {
  const [nfts, setNfts] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')
  useEffect(() => {
    loadNFTs()
  }, [])
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
    setLoadingState('loaded') 
  }
  if (loadingState === 'loaded' && !nfts.length) return (<h1 className="px-20 py-10 text-3xl">No items in marketplace</h1>)
  return (
    <div className="flex justify-center min-h-screen p-4"style={{
      backgroundColor:'#343444'
    }} >
      <div className="px-4" style={{ maxWidth: '1600px' }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {
            nfts.map((nft, i) => (
              <div key={i} className="border-none shadow-2xl rounded-xl overflow-hidden flex flex-col p-5 justify-center items-center bg-gray-700 w-[350px] h-[400px]">
                <Card className="rounded-xl" nft={nft}/>
               
              </div>
              
            ))
          }
        </div>
      </div>
    </div>
  )
}

