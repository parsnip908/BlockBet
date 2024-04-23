import React from 'react'
import { useState, useEffect } from "react";
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

    const [orignBetAmount, setOrignBetAmount] = useState('');
    const [takerBetAmount, setTakerBetAmount] = useState('');
    const [betDes, setBetDes] = useState('');
    const [betPosition, setBetPosition] = useState('');
    const [betRecipient, setRecipient] = useState('');
    const [oracleAdress, setOracleAddress] = useState('');

    // const [walletAddress, setWalletAddress] = useState('');
    const [BetID, setBetID] = useState('');
    const [BetIDOracle, setBetIDOracle] = useState('');
    const [BetResult, setBetResult] = useState('');

    const [betInd, setBetInd_] = useState(0);
    const [PendingList, setPendingList] = useState([]);
    const [ActiveList, setActiveList] = useState([]);
    const [CompleteList, setCompleteList] = useState([]);
    const [OracleActiveList, setOracleActiveList] = useState([]);
    const [OracleCompleteList, setOracleCompleteList] = useState([]);

    const PendingHeader = ["ID", "Taker bet amount", "Originator bet amount ", "Description", "Position", "Status"];
    const ActiveHeader = ["ID", "Amount", "Description", "Position"];
    const CompleteHeader = ["ID", "Amount", "Description", "Result", "W/L"];
    const OracleActiveHeader = ["ID", "Description", "Status"];
    const OracleCompleteHeader = ["ID", "Description", "Result"];
    const completeHeader = ["ID", "Amount", "Description", "Position", "Result"];


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
            const txResponse = await contract.setBetOutcome(BetIDOracle, BetResult)
            await txResponse.wait();
            const txResponse2 = await contract.payout(BetIDOracle)
            await txResponse2.wait();
        } catch (error) {
            console.error('Failed to set the outcome:', error);
            alert(`Transaction failed: ${error.message}`);
        }
    };

    const placeBet = async () => {
        // handle the bet placement logic

        try {
            const options = {
                value: ethers.utils.parseEther(orignBetAmount)
            }
            const txResponse = await contract.createBet(parseInt(betPosition), oracleAdress, betDes, betRecipient, ethers.utils.parseEther(takerBetAmount), options)
            await txResponse.wait();
        } catch (error) {
            console.error("Failed to create the bet", error);
            alert("Transcation failded: " + error.message)
        }

        // Reset bet amount after placing the bet
        setTakerBetAmount('');
        setOrignBetAmount('');
    };

    const updateLists = async () => {
        console.log(props.account);
        const betIndex = await contract.getBetInd();
        setBetInd_(betIndex.toNumber());
        console.log(betIndex.toNumber());

        // reset lists
        setPendingList([]);
        setActiveList([]);
        setCompleteList([]);
        setOracleActiveList([]);
        setOracleCompleteList([]);

        for (var i = 0; i < betIndex; i++) {

            try {
                var gameStatus = (await contract.getGameStatus(i)).toNumber();
            }
            catch
            {
                continue;
            }
            console.log(gameStatus);
            if (gameStatus == GameStatus.VOIDED) continue;
            const OracleAddr = await contract.getOracleAddress(i);
            const OriginAddr = await contract.getOriginatorAddress(i);
            const TakerAddr = await contract.getTakerAddress(i);
            const des = await contract.getBetDescription(i);

            console.log(OracleAddr);
            console.log(OriginAddr);
            console.log(TakerAddr);
            console.log(des);

            if (OracleAddr == props.account) {
                console.log("oracle parse")
                if (gameStatus == GameStatus.NOT_STARTED) {
                    var listObj = [i, des, "Waiting"];
                    await setOracleActiveList(BetList => [...BetList, listObj]);
                }
                else if (gameStatus == GameStatus.STARTED) {
                    var listObj = [i, des, "Resp Req"];
                    await setOracleActiveList(BetList => [...BetList, listObj]);
                }
                else if (gameStatus == GameStatus.COMPLETE) {
                    var result = (await contract.getOutcome(i)).toNumber();
                    result = (result == BetOutcome.TRUE) ? "True" : "False";
                    var listObj = [i, des, result];
                    await setOracleCompleteList(BetList => [...BetList, listObj]);
                }
            }

            if (OriginAddr == props.account) {
                var guess = await contract.getOriginatorGuess(i);
                guess = (guess == 1) ? "True" : "False";
                var amount = ethers.utils.formatEther(await contract.getOriginatorBetAmount(i));
                var userStatus = (await contract.getOriginatorStatus(i)).toNumber();
                var status = "Waiting";
            }
            else if (TakerAddr == props.account) {
                var guess = await contract.getOriginatorGuess(i);
                guess = (guess == 1) ? "False" : "True";
                var amount = ethers.utils.formatEther(await contract.getTakerBetAmount(i));
                var userStatus = (await contract.getTakerStatus(i)).toNumber();
                var status = "Resp Req";
            }
            else continue;

            console.log(amount);
            console.log(userStatus);

            if (gameStatus == GameStatus.NOT_STARTED) {
                var listObj = [i, amount.toString(), des, guess, status];
                console.log(listObj);
                // ?
                setPendingList(BetList => [...BetList, listObj]);
            }
            else if (gameStatus == GameStatus.STARTED) {
                var listObj = [i, amount.toString(), des, guess];
                console.log(listObj);
                await setActiveList(BetList => [...BetList, listObj]);
            }
            else if (gameStatus == GameStatus.COMPLETE) {
                status = (userStatus == BetterStatus.WIN) ? "Win" : "Lose";
                var result = (await contract.getOutcome(i)).toNumber();
                result = (result == BetOutcome.TRUE) ? "True" : "False";
                var listObj = [i, amount, des, result, status];
                console.log(listObj);
                await setCompleteList(BetList => [...BetList, listObj]);
            }
        }

        console.log(PendingList);
        console.log(ActiveList);
        console.log(CompleteList);
        console.log(OracleActiveList);
        console.log(OracleCompleteList);
    };

    return (
        <Container>
            <h1>
                BlockBet
            </h1>
            <p>MetaMask account address: {props.account}</p>
            <p>Bet Count: {betInd} / 65536</p>
            <button type="button" class="btn btn-secondary  btn-sm" style={{ marginBottom: '10px' }} onClick={updateLists}>Refresh</button>

            <Row>
                <Col>
                    <Card>
                        <CardHeader>Create Bet</CardHeader>
                        <CardBody>
                            <div className="mb-1">
                                <input
                                    type="text"
                                    value={orignBetAmount}
                                    onChange={(event) => setOrignBetAmount(event.target.value)}
                                    placeholder="Enter bet amount"
                                />
                            </div>
                            <div className="mb-1">
                                <input
                                    type="text"
                                    value={takerBetAmount}
                                    onChange={(event) => setTakerBetAmount(event.target.value)}
                                    placeholder="Enter taker bet amount"
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
                            <div className="mb-1">
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
                            <button type="button" className="btn btn-secondary  btn-sm" style={{ marginTop: '10px' }} onClick={placeBet}>Place Bet</button>
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
                                                    <th key={index} className='px-3'>{header}</th>
                                                ))}
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {PendingList.map((row, rowIndex) => (
                                                <tr key={rowIndex}>
                                                    {row.map((cell, cellIndex) => (
                                                        <td key={cellIndex} className='px-3'>{cell}</td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <div class='col-md-4 mt-4'>
                                        <input
                                            className='input-box '
                                            type="text"
                                            value={BetID}
                                            onChange={(event) => setBetID(event.target.value)}
                                            placeholder="Enter bet ID"
                                            style={{ marginRight: '10px' }}
                                        />
                                        <button type="button" className=" btn btn-secondary  btn-sm" style={{ marginRight: '10px' }} onClick={acceptBet}>Accept Bet</button>
                                        <button type="button" className=" btn btn-secondary  btn-sm" onClick={rejectBet}>Reject Bet</button>
                                    </div>

                                </Tab>
                                <Tab eventKey="active" title="Active">
                                    <table>
                                        <thead>
                                            <tr>
                                                {ActiveHeader.map((header, index) => (
                                                    <th key={index} className='px-3'>{header}</th>
                                                ))}
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {ActiveList.map((row, rowIndex) => (
                                                <tr key={rowIndex}>
                                                    {row.map((cell, cellIndex) => (
                                                        <td key={cellIndex} className='px-3'>{cell}</td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </Tab>
                                <Tab eventKey="complete" title="Complete">
                                    <table>
                                        <thead>
                                            <tr>
                                                {CompleteHeader.map((header, index) => (
                                                    <th key={index} className='px-3'>{header}</th>
                                                ))}
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {CompleteList.map((row, rowIndex) => (
                                                <tr key={rowIndex}>
                                                    {row.map((cell, cellIndex) => (
                                                        <td key={cellIndex} className='px-3'>{cell}</td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </Tab>
                            </Tabs>

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
                                    <table>
                                        <thead>
                                            <tr>
                                                {OracleActiveHeader.map((header, index) => (
                                                    <th key={index} className='px-3'>{header}</th>
                                                ))}
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {OracleActiveList.map((row, rowIndex) => (
                                                <tr key={rowIndex}>
                                                    {row.map((cell, cellIndex) => (
                                                        <td key={cellIndex} className='px-3'>{cell}</td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <div class='col-md-5 mt-4'>
                                        <input
                                            type="text"
                                            value={BetIDOracle}
                                            onChange={(event) => setBetIDOracle(event.target.value)}
                                            placeholder="Enter bet ID"
                                            style={{ marginRight: '7px' }}
                                        />
                                        <input
                                            type="text"
                                            value={BetResult}
                                            onChange={(event) => setBetResult(event.target.value)}
                                            placeholder="Enter bet result"
                                        />
                                        <button class="btn btn-secondary  btn-sm" style={{ marginLeft: '7px' }} onClick={postResult}>postResult</button>
                                    </div>
                                </Tab>
                                <Tab eventKey="complete" title="Complete">
                                    <table>
                                        <thead>
                                            <tr>
                                                {OracleCompleteHeader.map((header, index) => (
                                                    <th key={index} className='px-3'>{header}</th>
                                                ))}
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {OracleCompleteList.map((row, rowIndex) => (
                                                <tr key={rowIndex}>
                                                    {row.map((cell, cellIndex) => (
                                                        <td key={cellIndex} className='px-3'>{cell}</td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </Tab>
                            </Tabs>


                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    )

}
export default Connected