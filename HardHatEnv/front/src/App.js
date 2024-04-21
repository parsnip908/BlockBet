import { useState, useEffect } from 'react'
import { ethers } from "ethers";
import { BrowserProvider, parseUnits } from "ethers";
import { contractAbi, contractAddress } from './Constant/constant'
import './App.css';

import Login from './Components/Login'
import Connected from './Components/Connected'
import './../node_modules/bootstrap/dist/css/bootstrap.min.css';
import 'react-bootstrap'


function App() {

  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [betInd, setBetInd] = useState(null)

  const connectMetaMask = async () => {
    if (window.ethereum) { // Check if MetaMask is installed
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        setProvider(provider)
        await provider.send("eth_requestAccounts", [])
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address)
        console.log(`Connected to wallet: ${address}`);
        setIsConnected(true);
        console.log(`isConnected: ${isConnected}`);
        console.log(contractAbi);
        const contract = new ethers.Contract(contractAddress, contractAbi, signer);
        setContract(contract);
        const betIndex = await contract.getBetInd(); // Correctly handle the Promise
        setBetInd(betIndex.toString());
      } catch (error) {
        console.error('Error connecting to MetaMask', error);
      }
    } else {
      alert('MetaMask is not installed. Please install it to use this feature.');
    }
  };
  return (
    <div className="App">
      {isConnected ?
        (<Connected
          account={account}
          contract={contract}
          betIndex={betInd ? betInd : "Loading..."}
        />)
        : (<Login connectWallet={connectMetaMask} />)}
    </div>
  );

}

export default App;
