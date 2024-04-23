import React from 'react'

const Login = (props) => {
    return (
        <div className='login-container'>
            <div className="col text-center" style={{ paddingTop: '200px', paddingBottom: '20px' }}>
                <h1>
                    Welcome to BlockBet
                    {props.isConnected}
                </h1>
            </div>

            <button variant="warning" size="sm" onClick={props.connectWallet}>Connect to MetaMask</button>
        </div>
    )
}
export default Login