import React, { useEffect, useState } from "react";
import { SigningStargateClient } from "@cosmjs/stargate";
import { MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx";
import { Tx } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { Table, TableCell, TableHead, TableRow, TableContainer, TableBody, TableFooter, TablePagination, Paper } from "@mui/material";
import { TablePaginationActions } from "../shared/TablePaginationActions";

const History = ({walletAddress}) => {
  const [transactionList, setTransactionList] = useState([]);
  const rpcEndpoint = "https://rpc.sentry-01.theta-testnet.polypore.xyz";

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(3);

  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - transactionList.length) : 0;

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  useEffect(() => {
    if(walletAddress){
      const fetchTransactionData = async () => {
        try {
          const client = await SigningStargateClient.connect(rpcEndpoint);

          const txSender = await client.searchTx(`message.sender='${walletAddress}'`);
          const txReciever = await client.searchTx(`transfer.recipient='${walletAddress}'`);
          const transactions = [...txSender, ...txReciever];
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
      {walletAddress && transactionList && (
        
       <Paper sx={{ width: '1050px', overflow: 'hidden' }}>
       <TableContainer sx={{ maxHeight: 440 }}>
       <Table size="small" aria-label="sticky table">
         <TableHead>
         <TableRow>
         <TableCell align="left"><b>Block</b></TableCell>
         <TableCell align="left"><b>Sender</b></TableCell>
         <TableCell align="left"><b>Receiver</b></TableCell>
         <TableCell align="right"><b>Amount</b></TableCell> 
         <TableCell align="right"><b>Denom</b></TableCell> 
         <TableCell align="left"><b>Hash</b></TableCell>
       </TableRow>
         </TableHead>
         <TableBody>
         {(rowsPerPage > 0
             ? transactionList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
             : transactionList
           ).map((transaction, index) => (
             <TableRow
               key={index}
               sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
             >
               <TableCell align="right">{transaction.block}</TableCell>
               <TableCell align="right">{transaction.data.fromAddress}</TableCell>
               <TableCell align="right">{transaction.data.toAddress}</TableCell>
               <TableCell align="right">{transaction.data.amount[0].amount}</TableCell>
               <TableCell align="right">{transaction.data.amount[0].denom}</TableCell>
               <TableCell align="right">{transaction.hash}</TableCell>
             </TableRow>
           ))}
           {emptyRows > 0 && (
             <TableRow style={{ height: 53 * emptyRows }}>
               <TableCell colSpan={6} />
             </TableRow>
           )}
         </TableBody>
         <TableFooter>
           <TableRow>
             <TablePagination
               rowsPerPageOptions={[3, 5, 10, 25, { label: 'All', value: -1 }]}
               colSpan={3}
               count={transactionList.length}
               rowsPerPage={rowsPerPage}
               page={page}
               SelectProps={{
                 inputProps: {
                   'aria-label': 'rows per page',
                 },
                 native: true,
               }}
               onPageChange={handleChangePage}
               onRowsPerPageChange={handleChangeRowsPerPage}
               ActionsComponent={TablePaginationActions}
             />
           </TableRow>
         </TableFooter>
       </Table>
     </TableContainer>
     </Paper>
      )}
    </div>
  );
};

export default History;
