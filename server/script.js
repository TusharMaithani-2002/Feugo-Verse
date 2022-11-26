async function getData() {
  let data = await fetch("localhost:8888/nft-data");
  console.log(data);
}

getData()