import React, { useEffect, useState } from "react"
import {
  Divider,
  Grid,
  Button,
  Header,
  Container,
  Input,
  Radio
} from 'semantic-ui-react'
const { Row, Column } = Grid

import { ethers } from "ethers"
import dynamic from 'next/dynamic'
import DynamicNFTRinkeby from "../artifacts/rinkeby/contracts/DynamicNFT.sol/DynamicNFT.json"
import DynamicNFTMainnet from "../artifacts/stgaing/contracts/DynamicNFT.sol/DynamicNFT.json"
const DynamicNFT = process.env.NETWORK == "matic" ? DynamicNFTMainnet : DynamicNFTRinkeby

import SketchColorPicker from "../components/SketchColorPicker"
import {
  base64,
  ShowSVGImage,
  baseSvgSrc
} from "../components/utils"

const CONTRACT_ADDRESS = process.env.NETWORK == "matic" ? "" : "0x6bd31a75Fe124FECc1Edc932aD722f4c42E72c10"

const ConnectWallet = ({setAcount}) => {
  return (
      <Button onClick={() => connectWallet(setAcount)}>
      connect wallet
      </Button>
  )
}

const setWalletAccountIfConnected = async (setAccount) => {
  const { ethereum } = window;

  if (!ethereum) {
    console.log("Install metamask")
  }

  const accounts = await ethereum.request({method: "eth_accounts"})
  setAccount(accounts[0])
}

const getDataURI = async (tokenId) => {
  try {
    const { ethereum } = window
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner()
      const contract = new ethers.Contract(CONTRACT_ADDRESS, DynamicNFT.abi, signer)
      const dataURI = await contract.tokenURI(tokenId)
      return dataURI
    }
  } catch (e) {
    console.log(e)
    return;
  }
}
const connectWallet = async (setAccount) => {
    try {
      const { ethereum } = window
      if (!ethereum) {
        alert("Install metamask")
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts"})
      setAccount(accounts[0])
    } catch (e) {
      console.error(e)
    }
}

const mintNft = async (ownersMsg, viewableMsg, textColor, backgroundColor, setLoading, setTokenId) => {
  if (!viewableMsg || !ownersMsg) {
    alert('enter messages')
    return
  }
  setLoading(true)
  console.log(viewableMsg, ownersMsg)
  try {
    const { ethereum } = window
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner()
      const contract = new ethers.Contract(CONTRACT_ADDRESS, DynamicNFT.abi, signer)

      let tx = await contract.makeDyamicNFT(ownersMsg, viewableMsg, textColor, backgroundColor)
      const logs = await tx.wait()
      setTokenId(logs.events[0].args.tokenId.toNumber())
      alert("Tada! 🎉 check your account in testnet opensea! https://testnets.opensea.io/ , it takes 5, 10min to dipct")
    }
  } catch (e) {
    console.log(e)
  }
  setLoading(false)
}

const Home = () => {
  const [account, setAcount] = useState()
  const [viewableMsg, setViewableMsg] = useState("")
  const [ownersMsg, setOwnersMsg] = useState("")
  const [loading, setLoading] = useState(false)
  const [tokenId, setTokenId] = useState()
  const [dataURI, setDataURI] = useState()
  const [textColor, setTextColor] = useState("rgb(256,256,256)")
  const [backgroundColor, setBackgroundColor] = useState("rgb(0,0,0)")
  const [preview, setPreviewImage] = useState()
  const [option, setOption] = useState('owner')

  useEffect(() => {
    setWalletAccountIfConnected(setAcount)
  }, [])

  useEffect(async() => {
    setDataURI(await getDataURI(tokenId))
  }, [tokenId])

  return (
    <Grid>
      <Row/>
      <Row/>
      <Row>
        <Column>
          <Container centered="true" text>
            <Header as='h1' icon='plug' content='Make and Mint your Original Dynamic NFT 🦄' />
            {account && <p>your wallet address: {account}</p>}
            { account == null ? (
              <ConnectWallet setAcount={setAcount}/>
            ) : (
              <>
              <div>
                <p>A message only owner of the NFT can see: </p>
                <Input placeholder='' row={100} onChange={({target}) => setOwnersMsg(target.value)} value={ownersMsg}/>
              </div>
              <div>
                <p>A message others can see: </p>
                <Input placeholder='' row={100} onChange={({target}) => setViewableMsg(target.value)} value={viewableMsg}/>
              </div>
              <div>
                <div style={{marginTop: '10px', paddingTop: "10px"}}>
                  <span>pick background color: </span>
                  <SketchColorPicker color={backgroundColor} setColor={setBackgroundColor}/>
                </div>
              </div>

              <div>
                <div style={{marginTop: '10px', paddingTop: "10px"}}>
                  <span>pick background color: </span>
                  <SketchColorPicker color={textColor} setColor={setTextColor}/>
                </div>
              </div>
              <div style={{marginTop: 15}} />
              <div>
                <p>preview by: {option}</p>
                 <Radio
                    label='owners message'
                    name='option'
                    value='owner'
                    checked={option === 'owner'}
                    onChange={(e, {value}) => setOption(value)}
                  />
                 <Radio
                    label='viewers message'
                    name='option'
                    value='viewer'
                    checked={option === 'viewer'}
                    onChange={(e, {value}) => setOption(value)}
                  />

                <img src={baseSvgSrc(option == 'owner' ? ownersMsg : viewableMsg, backgroundColor, textColor)} />
              </div>
              <Button onClick={() => mintNft(ownersMsg, viewableMsg, textColor, backgroundColor, setLoading, setTokenId)} color='teal' size="large" loading={loading} style={{marginTop: "10px"}}>
               mint it
              </Button>
              </>
            ) }

              <p style={{marginTop: "10px"}}>
                Build with❤️  by <a href="https://twitter.com/SamuraiT01">yasek</a>. Check out the code <a href="https://github.com/SamuraiT/dynamic-nft-sample">here</a>
              </p>
            <Divider horizontal>
              <Header as='h4'>
                Show Image of TokenId
              </Header>
            </Divider>
            <p>Enter Token ID (must be a number)</p>
            <input value={tokenId} onChange={({target}) => setTokenId(target.value)} />
            { tokenId && <p><a href={`https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId}`} target="_blank" rel="noreferrer"> Check NFT in Opeansea</a></p> }
            { tokenId && <p><a href={`https://rinkeby.rarible.com/search/collections/${CONTRACT_ADDRESS}:${tokenId}`} target="_blank" rel="noreferrer"> Check NFT in rarible</a></p> }
            { dataURI && <ShowSVGImage dataURI={dataURI} /> }
          </Container>
        </Column>
      </Row>
    </Grid>
  )
}

export default Home;
