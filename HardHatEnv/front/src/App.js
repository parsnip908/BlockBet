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
  const [contract, setContract] = useState("");
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [balance, setBalance] = useState("");



  const connectMetaMask = async () => {
    if (window.ethereum) { // Check if MetaMask is installed
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        setProvider(provider)
        await provider.send("eth_requestAccounts", [])
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        await setAccount(address);
        console.log(`Connected to wallet: ${address}`);
        await setIsConnected(true);
        console.log(`isConnected: ${isConnected}`);
        console.log(contractAbi);
        const balance = await provider.getBalance(address);
        setBalance(ethers.utils.formatEther(balance));

        const contract = new ethers.Contract(contractAddress, contractAbi, signer);
        setContract(contract);
      } catch (error) {
        console.error('Error connecting to MetaMask', error);
      }
    } else {
      alert('MetaMask is not installed. Please install it to use this feature.');
    }
  };

  const updateBalance = async () => {
    setBalance(ethers.utils.formatEther(await provider.getBalance(account)));
  }

  return (
    <div className="App bg-light">
      {isConnected ?
        (<Connected
          account={account}
          contract={contract}
          balance={balance}
          updateBalance={updateBalance}
        />)
        : (<Login connectWallet={connectMetaMask} />)}
    </div>
  );

}

export default App;
