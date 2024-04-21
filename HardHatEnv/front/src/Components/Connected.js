import React from 'react'
import { useState } from "react";
import { ethers } from "ethers";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Card, CardBody, CardHeader } from 'react-bootstrap'
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';

const Connected = (props) => {
    const contract = props.contract;

    const [betAmount, setBetAmount] = useState('');
    const [betDes, setBetDes] = useState('');
    const [betPosition, setBetPosition] = useState('');
    const [betRecipient, setRecipient] = useState('');
    const [oracleAdress, setOracleAddress] = useState('');

    const [walletAddress, setWalletAddress] = useState('');
    const [BetID, setBetID] = useState('');
    const [BetIDOracle, setBetIDOracle] = useState('');
    const [BetResult, setBetResult] = useState('');

    const acceptBet = async () => {
        // check if it is a valid ID
        if (!BetID) {
            alert("Please enter a valid Bet ID.");
            return;
        }
        try {

            const options = {
                value: ethers.utils.parseEther(betAmount)
            }
            const txResponse = await contract.takeBet(BetID, options);
            await txResponse.wait();
            console.log('Bet accepted successfully.');

        } catch (error) {
            console.error("Failed to accept the bet:", error);
            alert("Transcation failded: " + error.message)
        }

    };
    const rejectBet = async () => {
        if (!BetID) {
            alert("Please enter a valid Bet ID.");
            return;
        }
        try {

            const txResponse = await contract.denyBet(BetID, {});
            await txResponse.wait();
            console.log('You have rejected the bet.');

        } catch (error) {
            console.error("Failed to reject the bet:", error);
            alert("Transcation failded: " + error.message)
        }

    };
    const postResult = async () => {
        try {
            const txResponse = await contract.setBetOutcome(BetID, BetResult)
            await txResponse.wait();
        } catch (error) {
            console.error('Failed to set the outcome:', error);
            alert(`Transaction failed: ${error.message}`);
        }
    };



    const placeBet = async () => {
        // handle the bet placement logic
        console.log(`Placing bet of ${betAmount}`);
        try {
            const options = {
                value: ethers.utils.parseEther(betAmount)
            }
            const txResponse = contract.createBet(parseInt(betPosition), oracleAdress, betDes, betRecipient, betAmount, options)
            await txResponse.wait();
        } catch (error) {
            console.error("Failed to create the bet", error);
            alert("Transcation failded: " + error.message)
        }

        // Reset bet amount after placing the bet
        setBetAmount('');
    };


    return (
        <Container>
            <h1>
                Your are connected to MetaMask!
            </h1>
            <p>Account address: {props.account}</p>
            <p> {props.betIndex}</p>

            <Row>
                <Col>
                    <Card>
                        <CardHeader>Create Bet</CardHeader>
                        <CardBody>
                            <div className="mb-1">
                                <input
                                    type="text"
                                    value={betAmount}
                                    onChange={(event) => setBetAmount(event.target.value)}
                                    placeholder="Enter bet amount"
                                />
                            </div>
                            <div className="mb-1">
                                <input
                                    type="text"
                                    value={betDes}
                                    onChange={(event) => setBetDes(event.target.value)}
                                    placeholder="Enter bet description"
                                />
                            </div>
                            <div className="mb-1">
                                <input
                                    type="text"
                                    value={betPosition}
                                    onChange={(event) => setBetPosition(event.target.value)}
                                    placeholder="Enter bet position"
                                />
                            </div>
                            <div class="mb-1">
                                <input
                                    type="text"
                                    value={betRecipient}
                                    onChange={(event) => setRecipient(event.target.value)}
                                    placeholder="Enter participant address"
                                />
                            </div>
                            <div className="mb-1">
                                <input
                                    type="text"
                                    value={oracleAdress}
                                    onChange={(event) => setOracleAddress(event.target.value)}
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
                                defaultActiveKey="Active"
                                id="Bet-list-tabs"
                                className="mb-3"
                            >
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
                                defaultActiveKey="Active"
                                id="Oracle-list-tabs"
                                className="mb-3"
                            >
                                <Tab eventKey="active" title="Active">
                                    <p>ID   Description                     Status</p>
                                    <p>65   Will I get an A in Microarch?   response needed</p>
                                    <p>23   Will this website work?         waiting</p>
                                    <p></p>
                                </Tab>
                                <Tab eventKey="complete" title="Complete">
                                    Tab content for Complete
                                </Tab>
                            </Tabs>

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
export default Connected