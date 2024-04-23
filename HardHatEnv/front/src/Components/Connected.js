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
import './Connected.css'

const Connected = (props) => {
    const contract = props.contract;

    const [OriginWager, setOriginWager] = useState('');
    const [TakerWager, setTakerWager] = useState('');
    const [OrignUnit, setOrignUnit] = useState('ether');
    const [TakerUnit, setTakerUnit] = useState('ether');
    const [betDes, setBetDes] = useState('');
    const [betPosition, setBetPosition] = useState(true);
    const [betRecipient, setRecipient] = useState('');
    const [oracleAdress, setOracleAddress] = useState('');

    // const [walletAddress, setWalletAddress] = useState('');
    const [BetID, setBetID] = useState('');
    const [BetIDOracle, setBetIDOracle] = useState('');
    const [BetResult, setBetResult] = useState(true);

    const [betInd, setBetInd_] = useState(0);
    const [PendingList, setPendingList] = useState([]);
    const [ActiveList, setActiveList] = useState([]);
    const [CompleteList, setCompleteList] = useState([]);
    const [OracleActiveList, setOracleActiveList] = useState([]);
    const [OracleCompleteList, setOracleCompleteList] = useState([]);

    const PendingHeader = ["ID", "My Wager", "Opponent Wager", "Description", "Position", "Status", "Opponent Address", "Oracle Address"];
    const ActiveHeader = ["ID", "My Wager", "Opponent Wager", "Description", "Position", "Opponent Address", "Oracle Address"];
    const CompleteHeader = ["ID", "My Wager", "Opponent Wager", "Description", "Result", "W/L", "Opponent Address", "Oracle Address"];
    const OracleActiveHeader = ["ID", "Description", "Status"];
    const OracleCompleteHeader = ["ID", "Description", "Result"];

    const pow15 = (ethers.BigNumber.from(10)).pow(15);
    const pow6 = (ethers.BigNumber.from(10)).pow(6);

    const acceptBet = async () => {
        // check if it is a valid ID
        if (!BetID) {
            alert("Please enter a valid Bet ID.");
            return;
        }
        try {

            const wager = await contract.getTakerBetAmount(BetID);
            const options = {
                value: wager,
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
        const trResult = BetResult ? BetOutcome.TRUE : BetOutcome.FALSE;
        try {
            const txResponse = await contract.setBetOutcome(BetIDOracle, trResult)
            await txResponse.wait();
        } catch (error) {
            console.error('Failed to set the outcome:', error);
            alert(`Transaction failed: ${error.message}`);
        }

        try {
            const txResponse2 = await contract.payout(BetIDOracle)
            await txResponse2.wait();
        } catch (error) {
            console.error('Failed to payout:', error);
            alert(`Transaction failed: ${error.message}`);
        }
    };

    const placeBet = async () => {
        // handle the bet placement logic
        const trPosition = betPosition ? BetOutcome.TRUE : BetOutcome.FALSE;
        try {
            const options = {
                value: ethers.utils.parseUnits(OriginWager, OrignUnit)
            }
            const txResponse = await contract.createBet(trPosition, oracleAdress, betDes, betRecipient, ethers.utils.parseUnits(TakerWager, TakerUnit), options)
            await txResponse.wait();
        } catch (error) {
            console.error("Failed to create the bet", error);
            alert("Transcation failded: " + error.message)
            return;
        }

        // Reset wager after placing the bet
        setTakerWager('');
        setOriginWager('');
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
                await contract.checkPermissions(i, props.account);
            } catch {
                continue;
            }

            var gameStatus = (await contract.getGameStatus(i)).toNumber();
            console.log(gameStatus);
            if (gameStatus == GameStatus.VOIDED) continue;

            var OracleAddr = await contract.getOracleAddress(i);
            const OriginAddr = await contract.getOriginatorAddress(i);
            const TakerAddr = await contract.getTakerAddress(i);
            const des = await contract.getBetDescription(i);

            console.log(OracleAddr);
            console.log(OriginAddr);
            console.log(TakerAddr);
            console.log(des);

            if (OracleAddr == props.account) {
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
                var userWager = parseWei(await contract.getOriginatorBetAmount(i));
                var oppWager = parseWei(await contract.getTakerBetAmount(i));
                var userStatus = (await contract.getOriginatorStatus(i)).toNumber();
                var oppAddr = ethers.utils.base64.encode(TakerAddr);
                var status = "Waiting";
            }
            else if (TakerAddr == props.account) {
                var guess = await contract.getOriginatorGuess(i);
                guess = (guess == 1) ? "False" : "True";
                var userWager = parseWei(await contract.getTakerBetAmount(i));
                var oppWager = parseWei(await contract.getOriginatorBetAmount(i));
                var userStatus = (await contract.getTakerStatus(i)).toNumber();
                var oppAddr = ethers.utils.base64.encode(OriginAddr);
                var status = "Resp Req";
            }
            else continue;

            console.log(userWager);
            console.log(userStatus);
            OracleAddr = ethers.utils.base64.encode(OracleAddr)

            if (gameStatus == GameStatus.NOT_STARTED) {
                var listObj = [i, userWager, oppWager, des, guess, status, oppAddr, OracleAddr];
                console.log(listObj);
                setPendingList(BetList => [...BetList, listObj]);
            }
            else if (gameStatus == GameStatus.STARTED) {
                var listObj = [i, userWager, oppWager, des, guess, oppAddr, OracleAddr];
                console.log(listObj);
                await setActiveList(BetList => [...BetList, listObj]);
            }
            else if (gameStatus == GameStatus.COMPLETE) {
                status = (userStatus == BetterStatus.WIN) ? "Win" : "Lose";
                var result = (await contract.getOutcome(i)).toNumber();
                result = (result == BetOutcome.TRUE) ? "True" : "False";
                var listObj = [i, userWager, des, result, status, oppAddr, OracleAddr];
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

    function parseWei(wei)
    {
        if(wei >= pow15)
            return ethers.utils.formatUnits(wei, 18) + ' eth';
        else if(wei >= pow6)
            return ethers.utils.formatUnits(wei, 9) + ' gwei';
        else
            return wei.toString() + ' wei';
    };

    return (
        <Container>
            <h1>
                BlockBet
            </h1>
            <p> MetaMask account address <br/>
                {props.account} <br/>
                {ethers.utils.base64.encode(props.account)} <br/>
                <br/>
                Bet Count: {betInd} / 65536
            </p>
            <button type="button" className="btn btn-secondary  btn-sm" style={{ marginBottom: '10px' }} onClick={updateLists}>Refresh</button>

            <Row>
                <Col>
                    <Card>
                        <CardHeader>Create Bet</CardHeader>
                        <CardBody>
                            <div className="mb-1">
                                <input
                                    type="number"
                                    value={OriginWager}
                                    onChange={(event) => setOriginWager(event.target.value)}
                                    placeholder="Enter your wager"
                                    style={{ marginRight: '5px' }}
                                />
                                <select value={OrignUnit} onChange={(event) => setOrignUnit(event.target.value)}>
                                    <option value='ether'>eth</option>
                                    <option value='gwei'>gwei</option>
                                    <option value='wei'>wei</option>
                                </select>
                            </div>
                            <div className="mb-1">
                                <input
                                    type="number"
                                    value={TakerWager}
                                    onChange={(event) => setTakerWager(event.target.value)}
                                    placeholder="Enter opponent wager"
                                    style={{ marginRight: '5px' }}
                                />
                                <select value={TakerUnit} onChange={(event) => setTakerUnit(event.target.value)}>
                                    <option value='ether'>eth</option>
                                    <option value='gwei'>gwei</option>
                                    <option value='wei'>wei</option>
                                </select>
                            </div>
                            <div className="mb-1">
                                <input
                                    type="text"
                                    value={betDes}
                                    onChange={(event) => setBetDes(event.target.value)}
                                    placeholder="Enter bet description"
                                />
                            </div>
                            <div className="mb-2">
                                <label>Result:</label>
                                <input 
                                    type="radio"
                                    id="BetPositionTrue"
                                    checked={betPosition === true}
                                    onChange={(event) => setBetPosition(true)}
                                    className='radio'
                                />
                                <label>True</label>
                                <input
                                    type="radio"
                                    id="BetPositionFalse"
                                    checked={betPosition === false}
                                    onChange={(event) => setBetPosition(false)}
                                    className='radio'
                                />
                                <label>False</label><br/>
                            </div>
                            <div className="mb-1">
                                <input
                                    type="text"
                                    value={betRecipient}
                                    onChange={(event) => setRecipient(event.target.value)}
                                    placeholder="Enter opponent address"
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
                                className="tabs"
                            >
                                <Tab eventKey="pending" title="Pending">
                                    <table className='betTable mt-3'>
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
                                    <div className='mt-4'>
                                        <input
                                            className='input-box '
                                            type="text"
                                            value={BetID}
                                            onChange={(event) => setBetID(event.target.value)}
                                            placeholder="Enter bet ID"
                                            // style={{ marginRight: '10px' }}
                                        />
                                    </div>
                                    <div className='mt-2'>
                                        <button type="button" className=" btn btn-secondary  btn-sm" style={{ marginRight: '5px' }} onClick={acceptBet}>Accept Bet</button>
                                        <button type="button" className=" btn btn-secondary  btn-sm" style={{ marginLeft: '5px' }} onClick={rejectBet}>Reject Bet</button>
                                    </div>

                                </Tab>
                                <Tab eventKey="active" title="Active">
                                    <table className='betTable mt-3'>
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
                                    <table className='betTable mt-3'>
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
            <Row className="mb-5">
                <Col>
                    <Card>
                        <Card.Header>Oracle List</Card.Header>
                        <Card.Body>
                            <Tabs
                                defaultActiveKey="active"
                                id="Oracle-list-tabs"
                                className="tabs"
                            >
                                <Tab eventKey="active" title="Active">
                                    <table className='betTable mt-3'>
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
                                    <div className='mt-4'>
                                        <input
                                            type="number"
                                            value={BetIDOracle}
                                            onChange={(event) => setBetIDOracle(event.target.value)}
                                            placeholder="Enter bet ID"
                                        />
                                    </div>
                                    <div className='mt-1'>
                                        <label>Result:</label>
                                        <input 
                                            type="radio"
                                            id="BetResultTrue"
                                            checked={BetResult === true}
                                            onChange={(event) => setBetResult(true)}
                                            className='radio'
                                        />
                                        <label>True</label>
                                        <input
                                            type="radio"
                                            id="BetResultFalse"
                                            checked={BetResult === false}
                                            onChange={(event) => setBetResult(false)}
                                            className='radio'
                                        />
                                        <label>False</label><br/>

                                    </div>
                                    <div className='mt-2'>
                                        <button className="btn btn-secondary  btn-sm" onClick={postResult}>postResult</button>
                                    </div>
                                </Tab>
                                <Tab eventKey="complete" title="Complete">
                                    <table className='betTable mt-3'>
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