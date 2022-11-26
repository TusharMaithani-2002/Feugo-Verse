import { createContext, useContext,useState,useEffect } from 'react';
import axios from 'axios';
import { ethers } from 'ethers'
import NFTMarketplace from '../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json'
import {
  marketplaceAddress
} from '../config'

const AppContext = createContext();


export function AppContextProvider({ children }) {
  const [nfts, setNfts] = useState([])


  async function loadNFTs() {
    /* create a generic provider and query for unsold market items */
    const provider = new ethers.providers.JsonRpcProvider()
    const contract = new ethers.Contract(marketplaceAddress, NFTMarketplace.abi, provider)
    const data = await contract.fetchMarketItems()

    /*
    *  map over items returned from smart contract and format 
    *  them as well as fetch their token metadata
    */
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
    // console.log(items);
    setNfts(items);
  }
  useEffect(()=>{

    loadNFTs();
  },[])

  
  return (
    <AppContext.Provider value={{nfts,setNfts,loadNFTs}}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}