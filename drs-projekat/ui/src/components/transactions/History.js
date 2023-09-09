import React, { useEffect, useState } from "react";
import { SigningStargateClient } from "@cosmjs/stargate";
import { MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx";
import { Tx } from "cosmjs-types/cosmos/tx/v1beta1/tx";

const History = ({walletAddress}) => {
  const [transactionList, setTransactionList] = useState([]);
  const rpcEndpoint = "https://rpc.sentry-01.theta-testnet.polypore.xyz";

  useEffect(() => {
    if(walletAddress){
      const fetchTransactionData = async () => {
        try {
          const client = await SigningStargateClient.connect(rpcEndpoint);

          const txSender = await client.searchTx(`message.sender='${walletAddress}'`);
          const txReciever = await client.searchTx(`message.recipient='${walletAddress}'`);
          const transactions = [...txSender, ...txReciever];
          console.log(txReciever);
          const parsedTransactionList = convertToTransactionList(transactions);
          
          setTransactionList(parsedTransactionList);
        } catch (error) {
          console.error("Error fetching transaction data:", error);
        }
      };
    
      fetchTransactionData();
    }else{
      setTransactionList([]);
    }
    // eslint-disable-next-line
  }, [rpcEndpoint, walletAddress]);

  const convertToTransactionList = (transactions) => {
    return transactions.map((transaction) => {
      const parsedTransaction = {
        block: transaction.height,
        hash: transaction.hash,
        data: decodeTransaction(transaction.tx),
      };
      return parsedTransaction;
    });
  };


  const decodeTransaction = (tx) => {
    const decodedTx = Tx.decode(tx);
    const sendMessage = MsgSend.decode(decodedTx.body.messages[0].value);
    return sendMessage;
  };

  return (
    <div>
      <h2>Transaction History for Address: {walletAddress}</h2>
      <ul>
        {transactionList.map((transaction, index) => (
          <li key={index}>
            <strong>Block:</strong> {transaction.block} <br/>
            <strong>Transaction hash:</strong> {transaction.hash} <br/>
            <strong>From Address:</strong> {transaction.data.fromAddress} <br/>
            <strong>To Address:</strong> {transaction.data.toAddress} <br/>
            <strong>Amount:</strong> {transaction.data.amount[0].amount} <br/>
            <strong>Denom:</strong> {transaction.data.amount[0].denom} 
          </li>
        ))}
      </ul>
    </div>
  );
};

export default History;
