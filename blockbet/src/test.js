import React from "react"
import { useState } from "react";
const Test = () => {
    const [betAmount, setBetAmount] = useState('');
    const [walletAddress, setWalletAddress] = useState('');

    const handleBetAmountChange = (event) => {
        setBetAmount(event.target.value);
    };

    const placeBet = () => {
        // Here you would handle the bet placement logic
        console.log(`Placing bet of ${betAmount}`);
        // Reset bet amount after placing the bet
        setBetAmount('');
    };

    const connectMetaMask = async () => {
        if (window.ethereum) { // Check if MetaMask is installed
            try {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }); // Request account access
                setWalletAddress(accounts[0]); // Set the first account as the wallet address
                console.log(`Connected to wallet: ${accounts[0]}`);
            } catch (error) {
                console.error('Error connecting to MetaMask', error);
            }
        } else {
            alert('MetaMask is not installed. Please install it to use this feature.');
        }
    };

    return (
        <div>
            <h1>BLOCK BET :D</h1>
            <div>
                <button onClick={connectMetaMask}>Connect to MetaMask</button>
                {walletAddress && <p>Connected Wallet: {walletAddress}</p>}
            </div>
            <div>
                <input
                    type="text"
                    value={betAmount}
                    onChange={handleBetAmountChange}
                    placeholder="Enter bet amount"
                />
                <button onClick={placeBet}>Place Bet</button>
            </div>
            <div>
                <h3> Bet list</h3>
                <p>ID   Amount   Description               Position Status</p>
                <p>34   1000 w   Will this website work?   True     active</p>
                <p>23   1000 w   Will this website work?   True     waiting</p>
                <p></p>
                <input
                    type="text"
                    value={BetID}
                    placeholder="Enter bet ID"
                />
                <button onClick={acceptBet}>Accept Bet</button>
                <button onClick={rejectBet}>Reject Bet</button>
                <h3> Oracle list</h3>
                <p>ID   Description                     Status</p>
                <p>65   Will I get an A in Microarch?   response needed</p>
                <p>23   Will this website work?         waiting</p>
                <p></p>
                <input
                    type="text"
                    value={BetIDOracle}
                    placeholder="Enter bet ID"
                />
                <input
                    type="text"
                    value={BetResult}
                    placeholder="Enter bet result"
                />
                <button onClick={postResult}>postResult</button>
                <p></p>
            </div>
        </div>

    )
}

export default Test