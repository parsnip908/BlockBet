import React from "react"
import { useState } from "react";
import './../node_modules/bootstrap/dist/css/bootstrap.min.css';
import { Card, CardBody, CardHeader } from 'react-bootstrap'
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';


const Test = () => {
    const [betAmount, setBetAmount] = useState('');
    const [betDes, setBetDes] = useState('');
    const [betRecipient, setRecipient] = useState('');
    const [oracleAdress, setOracleAddress] = useState('');

    const [walletAddress, setWalletAddress] = useState('');
    const [BetID, setBetID] = useState('');
    const [BetIDOracle, setBetIDOracle] = useState('');
    const [BetResult, setBetResult] = useState('');


    const handleBetAmountChange = (event) => {
        setBetAmount(event.target.value);
    };
    const handleBetDesChange = (event) => {
        setBetDes(event.target.value);
    };
    const handleBetRecipientChange = (event) => {
        setRecipient(event.target.value);
    };
    const handleOracleAddressChange = (event) => {
        setOracleAddress(event.target.value);
    };

    const acceptBet = () => {
    };
    const rejectBet = () => {
    };
    const postResult = () => {
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
        <Container>

            <Row>
                <Col>
                    {/* Your connect to MetaMask button and Create Bet form */}
                    <button variant="warning" size="sm" onClick={connectMetaMask}>Connect to MetaMask</button>
                    {walletAddress && <p>Connected Wallet: {walletAddress}</p>}

                </Col>
            </Row>

            <Row>
                <Col>
                    <Card>
                        <CardHeader>Create Bet</CardHeader>
                        <CardBody>
                            <div class="mb-1">
                                <input
                                    type="text"
                                    value={betAmount}
                                    onChange={handleBetAmountChange}
                                    placeholder="Enter bet amount"
                                />
                            </div>
                            <div class="mb-1">
                                <input
                                    type="text"
                                    value={betDes}
                                    onChange={handleBetDesChange}
                                    placeholder="Enter bet description"
                                />
                            </div>
                            <div class="mb-1">
                                <input
                                    type="text"
                                    value={betRecipient}
                                    onChange={handleBetRecipientChange}
                                    placeholder="Enter participant address"
                                />
                            </div>
                            <div class="mb-1">
                                <input
                                    type="text"
                                    value={oracleAdress}
                                    onChange={handleOracleAddressChange}
                                    placeholder="Enter oracle address"
                                />
                            </div>
                            <button type="button" class="btn btn-secondary  btn-sm" onClick={placeBet}>Place Bet</button>
                        </CardBody>

                    </Card>
                </Col>
            </Row>

            <Row className="my-4">
                <Col>
                    <Card>
                        <Card.Header>Bet List</Card.Header>
                        <Card.Body>
                            <Tabs
                                defaultActiveKey="Pending"
                                id="uncontrolled-tab-example"
                                className="mb-3"
                            >
                                <Tab eventKey="all" title="All">
                                    Tab content for All
                                </Tab>
                                <Tab eventKey="pending" title="Pending">
                                    <p>ID   Amount &nbsp;Description Position Status</p>
                                    <p>34   1000 w   Will this website work?   True     active</p>
                                    <p>23   1000 w   Will this website work?   True     waiting</p>
                                    <p></p>
                                </Tab>
                                <Tab eventKey="active" title="Active">
                                    Tab content for Active
                                </Tab>
                                <Tab eventKey="complete" title="Complete">
                                    Tab content for Complete
                                </Tab>
                            </Tabs>
                            <input
                                type="text"
                                value={BetID}
                                placeholder="Enter bet ID"
                            />
                            <button type="button" className="my-custom-button" onClick={acceptBet}>Accept Bet</button>
                            <button type="button" className="my-custom-button" onClick={rejectBet}>Reject Bet</button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Card>
                        <Card.Header>Oracle List</Card.Header>
                        <Card.Body>
                            <Tabs
                                defaultActiveKey="Pending"
                                id="uncontrolled-tab-example"
                                className="mb-3"
                            >
                                <Tab eventKey="all" title="All">
                                    Tab content for All
                                </Tab>
                                <Tab eventKey="pending" title="Pending">
                                    <p>ID   Amount &nbsp;Description Position Status</p>
                                    <p>34   1000 w   Will this website work?   True     active</p>
                                    <p>23   1000 w   Will this website work?   True     waiting</p>
                                    <p></p>
                                </Tab>
                                <Tab eventKey="active" title="Active">
                                    Tab content for Active
                                </Tab>
                                <Tab eventKey="complete" title="Complete">
                                    Tab content for Complete
                                </Tab>
                            </Tabs>
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
                            <button class="btn btn-secondary  btn-sm" onClick={postResult}>postResult</button>
                            <p></p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    )
}
export default Test