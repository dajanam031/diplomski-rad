import React from "react";
import { SigningStargateClient } from "@cosmjs/stargate";
import { useState } from "react";
import { Transaction } from "../../models/Transaction";
import { TextField, Button, Grid, Snackbar, Alert } from "@mui/material";
import History from "./History";
import Dashboard from "../shared/Dashboard";

function SendMoney(){
  const [transaction, setTransaction] = useState(new Transaction());
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const checkKeplr = async (e) => {
      const { keplr } = window;
      if (!keplr) {
          alert("You need to install or unlock Keplr");
          return;
      }
      window.keplr.experimentalSuggestChain(getTestnetChainInfo());

      const offlineSigner = window.getOfflineSigner("theta-testnet-001");
      const signingClient = await SigningStargateClient.connectWithSigner(
        'https://rpc.sentry-01.theta-testnet.polypore.xyz', offlineSigner);
      const account = (await offlineSigner.getAccounts())[0];
      const balance = (await signingClient.getBalance(account.address, "uatom")).amount;

      setTransaction((prev) => ({ ...prev, myAddress: account.address, myBalance: balance + ' ATOM'}));
      
  }

  const sendTokens = async (e) => {
    const offlineSigner = window.getOfflineSigner("theta-testnet-001");
    const signingClient = await SigningStargateClient.connectWithSigner(
          'https://rpc.sentry-01.theta-testnet.polypore.xyz', offlineSigner);

    const account = (await offlineSigner.getAccounts())[0];
    await signingClient.sendTokens(
      account.address, transaction.toAddress,[
        {
          denom: transaction.denom,
          amount: transaction.toSend
        }
      ], {
        amount: [{denom: "uatom", amount: "500"}],
        gas: "200000"
      }
    )
    setIsSnackbarOpen(true);
    setSnackbarMessage("Successfully transfered tokens.");
    const balance = (await signingClient.getBalance(account.address, "uatom")).amount;
    setTransaction((prev) => ({ ...prev, myBalance: balance + ' ATOM', toAddress: '', toSend: ''}));
  }

  

  function getTestnetChainInfo() {
    return {
        chainId: "theta-testnet-001",
        chainName: "theta-testnet-001",
        rpc: "https://rpc.sentry-01.theta-testnet.polypore.xyz/",
        rest: "https://rest.sentry-01.theta-testnet.polypore.xyz/",
        bip44: {
            coinType: 118,
        },
        bech32Config: {
            bech32PrefixAccAddr: "cosmos",
            bech32PrefixAccPub: "cosmospub",
            bech32PrefixValAddr: "cosmosvaloper",
            bech32PrefixValPub: "cosmosvaloperpub",
            bech32PrefixConsAddr: "cosmosvalcons",
            bech32PrefixConsPub: "cosmosvalconspub",
        },
        currencies: [
            {
                coinDenom: "ATOM",
                coinMinimalDenom: "uatom",
                coinDecimals: 6,
                coinGeckoId: "cosmos",
            },
            {
                coinDenom: "THETA",
                coinMinimalDenom: "theta",
                coinDecimals: 0,
            },
            {
                coinDenom: "LAMBDA",
                coinMinimalDenom: "lambda",
                coinDecimals: 0,
            },
            {
                coinDenom: "RHO",
                coinMinimalDenom: "rho",
                coinDecimals: 0,
            },
            {
                coinDenom: "EPSILON",
                coinMinimalDenom: "epsilon",
                coinDecimals: 0,
            },
        ],
        feeCurrencies: [
            {
                coinDenom: "ATOM",
                coinMinimalDenom: "uatom",
                coinDecimals: 6,
                coinGeckoId: "cosmos",
                gasPriceStep: {
                    low: 1,
                    average: 1,
                    high: 1,
                },
            },
        ],
        stakeCurrency: {
            coinDenom: "ATOM",
            coinMinimalDenom: "uatom",
            coinDecimals: 6,
            coinGeckoId: "cosmos",
        },
        coinType: 118,
        features: ["stargate", "ibc-transfer", "no-legacy-stdTx"],
    };
  }
    return (
        <>
        <Dashboard content={
          <div style={{ marginTop: '100px' }}>
          <Grid container spacing={2}>
          <Grid item xs={12} md={1} />
          <Grid item xs={12} md={3}>
            <TextField
              margin="normal"
              fullWidth
              id="myAddress"
              label="My Keplr address"
              name="myAddress"
              disabled
              sx={{
                width: '250px', 
              }}
              value={transaction.myAddress}
            />
            <TextField
              margin="normal"
              disabled
              fullWidth
              name="myBalance"
              label="My Keplr balance"
              id="myBalance"
              sx={{
                width: '250px', 
              }}
              value={transaction.myBalance}
            />
            <Button
              onClick={checkKeplr}
              fullWidth
              variant="outlined"
              sx={{ mt: 3, mb: 2, width: '250px' }}
            >
              Connect Keplr Wallet
            </Button>
          </Grid>
          <Grid item xs={12} md={3} />
          <Grid item xs={12} md={3}>
            <TextField
              margin="normal"
              fullWidth
              id="toAddress"
              label="Receiver address"
              name="toAddress"
              autoComplete="off"
              value={transaction.toAddress}
              onChange={(e) =>
                setTransaction((prev) => ({ ...prev, toAddress: e.target.value }))
              }
              sx={{
                width: '250px', 
              }}
            />
            <TextField
              margin="normal"
              autoComplete="off"
              fullWidth
              name="toSend"
              label="Amount of tokens"
              id="toSend"
              value={transaction.toSend}
              onChange={(e) =>
                setTransaction((prev) => ({ ...prev, toSend: e.target.value }))
              }
              sx={{
                width: '250px', 
              }}
            />
            <Button
              onClick={sendTokens}
              fullWidth
              variant="outlined"
              sx={{ mt: 3, mb: 2, width: '250px' }}
            >
              Send tokens
            </Button>
          </Grid>
          </Grid>
          <br/>
          <Grid container spacing={2}>
            <Grid item xs={12} md={9}>
                  <History walletAddress={transaction.myAddress} />
                  </Grid>
          </Grid>
          <Snackbar
        open={isSnackbarOpen}
        autoHideDuration={5000}
        onClose={() => setIsSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert severity="info">{snackbarMessage}</Alert>
      </Snackbar>
        </div>
        }/>
        </>
    );
};

export default SendMoney;