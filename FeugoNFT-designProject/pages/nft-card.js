import Image from "next/image";
import Link from 'next/link'
function Card({nft}) {
  return (

    <div className="flex flex-col justify-around" style={{width:"300px"}}>
      <Image alt="" src={nft.image} width={"300px"} height={"250px"} className='rounded object-center'/>
      <div className="p-4 flex justify-between">
        <p className="text-xl font-bold text-white ">{nft.name}</p>
         
         <p className="text-xl font-bold text-white">{nft.price} ETH</p>

      </div>
          <Link href={`/nftInfo/${nft.tokenId}`} passHref>
              <button className="w-full bg-purple-700 text-white font-bold p-2 px-12 rounded-md mt-2">Details</button>
           </Link>
    </div>
    
  );
}

export default Card;

{/* <button className="w-full bg-pink-500 text-white font-bold py-2 px-12 rounded-md " onClick={() => buyNft(nft)}>Buy</button> */}