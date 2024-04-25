import React from 'react'
import { useState, useEffect } from "react";
import { FaCopy } from "react-icons/fa";
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
    const [SentList, setSentList] = useState([]);
    const [ActiveList, setActiveList] = useState([]);
    const [CompleteList, setCompleteList] = useState([]);
    const [OracleActiveList, setOracleActiveList] = useState([]);
    const [OracleCompleteList, setOracleCompleteList] = useState([]);

    const [Refreshing, setRefreshing] = useState(false);

    const PendingHeader = ["ID", "My Wager", "Opponent Wager", "Description", "Position", "Opponent Address", "Oracle Address"];
    const SentHeader = ["ID", "My Wager", "Opponent Wager", "Description", "Position", "Opponent Address", "Oracle Address"];
    const ActiveHeader = ["ID", "My Wager", "Opponent Wager", "Description", "Position", "Opponent Address", "Oracle Address"];
    const CompleteHeader = ["ID", "My Wager", "Opponent Wager", "Description", "Result", "W/L", "Opponent Address", "Oracle Address"];
    const OracleActiveHeader = ["ID", "Description"];
    const OracleCompleteHeader = ["ID", "Description", "Result"];
    const portfolioHeader = ["MetaMask Account", "Current Balance", "Bet count"]

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
            setBetID('');

        } catch (error) {
            console.error("Failed to accept the bet:", error);
            alert("Transcation failed: " + error.message)
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
            setBetID('');

        } catch (error) {
            console.error("Failed to reject the bet:", error);
            alert("Transcation failded: " + error.message)
        }
    };

    const postResult = async () => {
        const trResult = BetResult ? BetOutcome.TRUE : BetOutcome.FALSE;
        // try {
        //     const txResponse = await contract.setBetOutcome(BetIDOracle, trResult)
        //     await txResponse.wait();
        // } catch (error) {
        //     console.error('Failed to set the outcome:', error);
        //     alert(`Transaction failed: ${error.message}`);
        // }

        try {
            const txResponse2 = await contract.payout(BetIDOracle, trResult)
            await txResponse2.wait();
        } catch (error) {
            console.error('Failed to payout:', error);
            alert(`Transaction failed: ${error.message}`);
        }
    };

    const placeBet = async () => {
        // handle the bet placement logic
        if (props.account == betRecipient) {
            console.error("opponent is same as user");
            alert("Cannot make a bet with yourself.")
            return
        }
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
        setBetDes('');
        setOracleAddress('');
        setRecipient('');
        setSentList('');
    };

    const updateLists = async () => {

        while (Refreshing);
        await setRefreshing(true);

        console.log("Refreshing");

        console.log(props.account);
        const betIndex = (await contract.getBetInd()).toNumber();
        setBetInd_(betIndex);
        console.log(betIndex);

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
                    // var listObj = [i, des, "Waiting"];
                    // await setOracleActiveList(BetList => [...BetList, listObj]);
                }
                else if (gameStatus == GameStatus.STARTED) {
                    var listObj = [i, des]; // , "Resp Req"
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
                var oppAddr = TakerAddr;
                var status = false;
            }
            else if (TakerAddr == props.account) {
                var guess = await contract.getOriginatorGuess(i);
                guess = (guess == 1) ? "False" : "True";
                var userWager = parseWei(await contract.getTakerBetAmount(i));
                var oppWager = parseWei(await contract.getOriginatorBetAmount(i));
                var userStatus = (await contract.getTakerStatus(i)).toNumber();
                var oppAddr = OriginAddr;
                var status = true;
            }
            else continue;

            console.log(userWager);
            console.log(userStatus);
            // OracleAddr = truncateAddress(OracleAddr);

            if (gameStatus == GameStatus.NOT_STARTED) {

                var listObj = [i, userWager, oppWager, des, guess, oppAddr, OracleAddr];
                console.log(listObj);
                if (status)
                    await setPendingList(BetList => [...BetList, listObj]);
                else
                    await setSentList(BetList => [...BetList, listObj]);
            }
            else if (gameStatus == GameStatus.STARTED) {
                var listObj = [i, userWager, oppWager, des, guess, oppAddr, OracleAddr];
                console.log(listObj);
                await setActiveList(BetList => [...BetList, listObj]);
            }
            else if (gameStatus == GameStatus.COMPLETE) {
                var winLoss = (userStatus == BetterStatus.WIN) ? "Win" : "Lose";
                var result = (await contract.getOutcome(i)).toNumber();
                result = (result == BetOutcome.TRUE) ? "True" : "False";
                var listObj = [i, userWager, oppWager, des, result, winLoss, oppAddr, OracleAddr];
                console.log(listObj);
                await setCompleteList(BetList => [...BetList, listObj]);
            }
        }

        console.log(PendingList);
        console.log(ActiveList);
        console.log(CompleteList);
        console.log(OracleActiveList);
        console.log(OracleCompleteList);

        setRefreshing(false);
    };

    function parseWei(wei) {
        if (pow15.lte(wei))
            return ethers.utils.formatUnits(wei, 18) + ' eth';
        else if (pow6.lte(wei))
            return ethers.utils.formatUnits(wei, 9) + ' gwei';
        else
            return wei.toString() + ' wei';
    };

    const truncateAddress = (address) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    const copyToClipboard = (account) => {
        navigator.clipboard.writeText(account).then(() => {
            // Handle the success case - show a message or change the state.
            console.log('Address copied to clipboard!', account);
        }).catch(err => {
            // Handle the error case
            console.error('Failed to copy address: ', err);
        });
    };
    return (
        <Container style={{ paddingTop: '30px', paddingBottom: '30px' }}>
            <h1>
                BlockBet
            </h1>
            {/* <p>
                MetaMask account address: {truncateAddress(props.account)}
                <span role="button" onClick={copyToClipboard(props.account)}><FaCopy /></span>
            </p>
            <p>MetaMask Balance: {props.balance} MIS </p>
            <p>Bet Count: {betInd} / 65536</p> */}
            <button
                type="button"
                className="btn btn-secondary  btn-sm"
                style={{ marginBottom: '10px' }}
                onClick={() => updateLists()}
                disabled={Refreshing}
            >
                Refresh
            </button>

            <Row>
                <Col>
                    <Card className='mb-4'>
                        <CardHeader as="h5">Portfolio</CardHeader>
                        <CardBody>
                            <table className='betTable mt-3'>
                                <thead>
                                    <tr>
                                        {portfolioHeader.map((header, index) => (
                                            <th key={index} className='px-3'>{header}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>{truncateAddress(props.account)}
                                            <span role="button" className='copyButton' onClick={() => copyToClipboard(props.account)}><FaCopy /></span></td>
                                        <td>{props.balance} MIS </td>
                                        <td>{betInd} / 65536</td>
                                    </tr>
                                </tbody>
                            </table>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Card className='mb-4'>
                        <CardHeader as="h5">Create Bet</CardHeader>
                        <CardBody className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
                            <form>
                                <div className="row mb-1">
                                    <div className="col-8">
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={OriginWager}
                                            onChange={(event) => setOriginWager(event.target.value)}
                                            placeholder="Enter your wager"
                                        />
                                    </div>
                                    <div className="col-auto">
                                        <select
                                            className="form-select"
                                            value={OrignUnit}
                                            onChange={(event) => setOrignUnit(event.target.value)}
                                        >
                                            <option value='ether'>eth</option>
                                            <option value='gwei'>gwei</option>
                                            <option value='wei'>wei</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="row mb-1">
                                    <div className="col-8">
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={TakerWager}
                                            onChange={(event) => setTakerWager(event.target.value)}
                                            placeholder="Enter opponent wager"
                                        />
                                    </div>
                                    <div className="col-auto">
                                        <select
                                            className="form-select"
                                            value={TakerUnit}
                                            onChange={(event) => setTakerUnit(event.target.value)}
                                        >
                                            <option value='ether'>eth</option>
                                            <option value='gwei'>gwei</option>
                                            <option value='wei'>wei</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="mb-1 col-14">
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={betDes}
                                        onChange={(event) => setBetDes(event.target.value)}
                                        placeholder="Enter bet description"
                                    />
                                </div>
                                <div className="mb-1">
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={betRecipient}
                                        onChange={(event) => setRecipient(event.target.value)}
                                        placeholder="Enter opponent address"
                                    />
                                </div>
                                <div className="mb-1">
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={oracleAdress}
                                        onChange={(event) => setOracleAddress(event.target.value)}
                                        placeholder="Enter oracle address"
                                    />
                                </div>
                                <div className="mb-2">
                                    <div>
                                        <label>Result:</label>
                                        <div className="form-check form-check-inline">
                                            <input
                                                type="radio"
                                                id="BetPositionTrue"
                                                className="form-check-input"
                                                checked={betPosition === true}
                                                onChange={(event) => setBetPosition(true)}
                                            />
                                            <label className="form-check-label" htmlFor="BetPositionTrue">True</label>
                                        </div>
                                        <div className="form-check form-check-inline">
                                            <input
                                                type="radio"
                                                id="BetPositionFalse"
                                                className="form-check-input"
                                                checked={betPosition === false}
                                                onChange={(event) => setBetPosition(false)}
                                            />
                                            <label className="form-check-label" htmlFor="BetPositionFalse">False</label>
                                        </div>
                                    </div>
                                </div>
                                <button type="button" className="btn btn-secondary btn-sm" style={{ marginTop: '10px' }} onClick={placeBet}>Place Bet</button>
                            </form>
                        </CardBody>


                    </Card>
                </Col>
            </Row>

            <Row>
                <Col>
                    <Card className='mb-4'>
                        <Card.Header as="h5">Bet List</Card.Header>
                        <Card.Body>
                            <Tabs
                                defaultActiveKey="pending"
                                id="Bet-list-tabs"
                                className="tabs"
                            >
                                <Tab eventKey="pending" title="Incoming">
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
                                                        <td key={cellIndex} className='px-3'>
                                                            {cell}
                                                            {(cell.type === 'oppAddr' || cell.type === 'OracleAddr') && (
                                                                <span role="button" onClick={() => copyToClipboard(cell)}>
                                                                    <FaCopy />
                                                                </span>
                                                            )}
                                                        </td>
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
                                <Tab eventKey="outgoing" title="Sent">
                                    <table className='betTable mt-3'>
                                        <thead>
                                            <tr>
                                                {SentHeader.map((header, index) => (
                                                    <th key={index} className='px-3'>{header}</th>
                                                ))}
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {SentList.map((row, rowIndex) => (
                                                <tr key={rowIndex}>
                                                    {row.map((cell, cellIndex) => (
                                                        <td key={cellIndex} className='px-3'>
                                                            {cellIndex === 5 || cellIndex === 6 ? truncateAddress(cell) : cell}
                                                            {(cellIndex === 5 || cellIndex === 6) && (
                                                                <span role="button" onClick={() => copyToClipboard(cell)}>
                                                                    <FaCopy />
                                                                </span>
                                                            )}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </Tab>
                                <Tab eventKey="active" title="Active">
                                    <table className='betTable mt-3'>
                                        <thead>
                                            <tr>
                                                {ActiveHeader.map((header, index) => (
                                                    <th scope="col" key={index} className='px-3'>{header}</th>
                                                ))}
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {ActiveList.map((row, rowIndex) => (
                                                <tr key={rowIndex}>
                                                    {row.map((cell, cellIndex) => (
                                                        <td key={cellIndex} className='px-3'>
                                                            {cellIndex === 5 || cellIndex === 6 ? truncateAddress(cell) : cell}
                                                            {(cellIndex === 5 || cellIndex === 6) && (
                                                                <span role="button" onClick={() => copyToClipboard(cell)}>
                                                                    <FaCopy />
                                                                </span>
                                                            )}
                                                        </td>
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
                                                        <td key={cellIndex} className='px-3'>
                                                            {cellIndex === 6 || cellIndex === 7 ? truncateAddress(cell) : cell}
                                                            {(cellIndex === 6 || cellIndex === 7) && (
                                                                <span role="button" onClick={() => copyToClipboard(cell)}>
                                                                    <FaCopy />
                                                                </span>
                                                            )}
                                                        </td>
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
                    <Card className='mb-4'>
                        <Card.Header as="h5">Oracle List</Card.Header>
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
                                        <label>False</label><br />

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