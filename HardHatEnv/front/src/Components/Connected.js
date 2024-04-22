import React from 'react'
import { useState, useEffect  } from "react";
import { ethers } from "ethers";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Card, CardBody, CardHeader } from 'react-bootstrap'
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';

import { BetterStatus, GameStatus, BetOutcome } from './../Constant/constant.js'

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

    const [betInd, setBetInd_] = useState(0);
    const [BetList, setBetList] = useState([]);
    const [PendingList, setPendingList] = useState([]);
    const [ActiveList, setActiveList] = useState([]);
    const [CompleteList, setCompleteList] = useState([]);
    const [OracleActiveList, setOracleActiveList] = useState([]);
    const [OracleCompleteList, setOracleCompleteList] = useState([]);

    const PendingHeader = ["ID", "Amount", "Description", "Position", "Status"];
    const ActiveHeader = ["ID", "Amount", "Description", "Position"];
    
    // const setBetInd = async () => {
    //     const betIndex = await contract.getBetInd();
    //     setBetInd_(betIndex.toNumber());
    // };

    const acceptBet = async () => {
        // check if it is a valid ID
        if (!BetID) {
            alert("Please enter a valid Bet ID.");
            return;
        }
        try {

            const amount = await contract.getTakerBetAmount(BetID);
            const options = {
                value: amount,
                gasLimit: 100000
            }

            const txResponse = await contract.takeBet(BetID, options);
            await txResponse.wait();
            console.log('Bet accepted successfully.');

        } catch (error) {
            // const { reason } = await errorDecoder.decode(error);
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
            const txResponse = contract.createBet(parseInt(betPosition), oracleAdress, betDes, betRecipient, ethers.utils.parseEther(betAmount), options)
            await txResponse.wait();
        } catch (error) {
            console.error("Failed to create the bet", error);
            alert("Transcation failded: " + error.message)
        }

        // Reset bet amount after placing the bet
        setBetAmount('');
    };

    const updateLists = async () => {
        console.log(props.account);
        const betIndex = await contract.getBetInd();
        setBetInd_(betIndex.toNumber());
        console.log(betIndex.toNumber());

        // reset lists
        await setBetList([]);
        await setPendingList([]);
        await setActiveList([]);

        for (var i = 0; i < betIndex; i++)
        {

            const gameStatus = (await contract.getGameStatus(i)).toNumber();
            console.log(gameStatus);

            if(gameStatus == GameStatus.VOIDED) continue;

            const OracleAddr = await contract.getOracleAddress(i);
            console.log(OracleAddr);
            if(OracleAddr == props.account)
            {
                console.log("oracle parse")
                // oracle parse
            }

            const OriginAddr = await contract.getOriginatorAddress(i);
            const TakerAddr = await contract.getTakerAddress(i);
            console.log(OriginAddr);
            console.log(TakerAddr);

            var guess = null;
            var amount
            if (OriginAddr == props.account)
            {
                guess = await contract.getOriginatorGuess(i);
                guess = (guess == 1) ? "True" : "False";
                amount = ethers.utils.formatEther(await contract.getOriginatorBetAmount(i));
                var status = "Waiting";
            }
            else if(TakerAddr == props.account)
            {
                guess = await contract.getOriginatorGuess(i);
                guess = (guess == 1) ? "False" : "True";
                amount = ethers.utils.formatEther(await contract.getTakerBetAmount(i));
                var status = "Resp Req";
            }
            else continue;

            const des = await contract.getBetDescription(i);
            const takerStatus = (await contract.getTakerStatus(i)).toNumber();
            console.log(des);
            console.log(amount);
            console.log(takerStatus);

            if(gameStatus == GameStatus.NOT_STARTED)
            {
                var listObj = [i, amount.toString(), des, guess, status];
                console.log(listObj);
                await setPendingList(BetList => [...BetList, listObj]);
            }
            else if(gameStatus == GameStatus.STARTED)
            {
                var listObj = [i, amount.toString(), des, guess];
                await setActiveList(BetList => [...BetList, listObj]);
                console.log(listObj);
            }
            else if(gameStatus == GameStatus.COMPLETE)
            {
                // var listObj = [i, amount, des, result, winLoss];
            }

            await setBetList(BetList => [...BetList, des]);
        }
        console.log(BetList);
        console.log(PendingList);

    };

    return (
        <Container>
            <h1>
                Your are connected to MetaMask!
            </h1>
            <p>Account address: {props.account}</p>
            <p>Bet Count: {betInd}</p>
{/*            <ul>
                {BetList.map((item, index) => (
                    <li key={index}>{item}</li>
                ))}
            </ul>
*/}            <button type="button" class="btn btn-secondary  btn-sm" onClick={updateLists}>Refresh</button>

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
                                defaultActiveKey="pending"
                                id="Bet-list-tabs"
                                className="mb-3"
                            >
                                <Tab eventKey="pending" title="Pending">
                                    <table>
                                        <thead>
                                            <tr>
                                                {PendingHeader.map((header, index) => (
                                                    <th key={index}>{header}</th>
                                                ))}
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {PendingList.map((row, rowIndex) => (
                                                <tr key={rowIndex}>
                                                    {row.map((cell, cellIndex) => (
                                                        <td key={cellIndex}>{cell}</td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </Tab>
                                <Tab eventKey="active" title="Active">
                                    <table>
                                        <thead>
                                            <tr>
                                                {ActiveHeader.map((header, index) => (
                                                    <th key={index}>{header}</th>
                                                ))}
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {ActiveList.map((row, rowIndex) => (
                                                <tr key={rowIndex}>
                                                    {row.map((cell, cellIndex) => (
                                                        <td key={cellIndex}>{cell}</td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </Tab>
                                <Tab eventKey="complete" title="Complete">
                                    Tab content for Complete
                                </Tab>
                            </Tabs>
                            <input
                                type="text"
                                value={BetID}
                                onChange={(event) => setBetID(event.target.value)}
                                placeholder="Enter bet ID"
                            />
                            <button type="button" className="btn btn-secondary  btn-sm" onClick={acceptBet}>Accept Bet</button>
                            <button type="button" className="btn btn-secondary  btn-sm" onClick={rejectBet}>Reject Bet</button>
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
                                defaultActiveKey="active"
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