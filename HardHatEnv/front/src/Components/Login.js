import React from 'react'

const Login = (props) => {
    return (
        <div className='login-container'>
            <h1>
                Welcome to BlockBet
                {props.isConnected}
            </h1>
            <button variant="warning" size="sm" onClick={props.connectWallet}>Connect to MetaMask</button>
        </div>
    )
}
export default Login