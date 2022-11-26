/* pages/_app.js */
import '../styles/globals.css'
import Link from 'next/link'
import { AppContextProvider} from '../context/context'
import { useState,useEffect } from 'react'


function MyApp({ Component, pageProps }) {
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
    <AppContextProvider>
    <div className='flex flex-col justify-center'>
      <nav className=" p-6 flex justify-between" style={{
        backgroundColor:"#343444",
        borderBlockColor:"rebeccapurple",
        color:"#f4f0db"
      }}>
        <h2 className="text-4xl font-bold text-white pl-20">FeugoNFT</h2>
        <div className="flex mt-4">
          <Link href="/">
            <a className="mr-4 text-xl">
              Home
            </a>
          </Link>
          <Link href="/create-nft">
            <a className="mr-6 text-xl">
              Sell NFT
            </a>
          </Link>
          <Link href="/my-nfts">
            <a className="mr-6 text-xl">
              My NFTs
            </a>
          </Link>
          <Link href="/post-nft">
            <a className="mr-6  text-xl ">
              Post
            </a>
          </Link>
        </div>
        {account? (<button className='border rounded-lg h-3/3 w-40'
         onClick={getWallet}
        >{account.substring(0,4)}...{account.substring(account.length-4)}</button>
        ):(<button className='border rounded-lg h-3/3 w-40'  onClick={getWallet}>connect wallet</button>)
        }
      </nav>
      <Component {...pageProps} />
    </div>
    </AppContextProvider>
  )
}

export default MyApp

