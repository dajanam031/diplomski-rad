import React from "react";
import { SigningStargateClient } from "@cosmjs/stargate";
import { useState } from "react";
import { Transaction } from "../../models/Transaction";
import { TextField, Button, Container, Box, CssBaseline } from "@mui/material";
import History from "./History";

function SendMoney(){
  const [transaction, setTransaction] = useState(new Transaction());

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
    const sendResult = await signingClient.sendTokens(
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
    
    console.log(sendResult);
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
        <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
            sx={{
              marginTop: 8,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            
          <TextField
                margin="normal"
                fullWidth
                id="myAddress"
                label="My Keplr address"
                name="myAddress"
                disabled
                value={transaction.myAddress}
              />
              <TextField
                margin="normal"
                disabled
                fullWidth
                name="myBalance"
                label="My Keplr balance"
                id="myBalance"
                value={transaction.myBalance}
              />
              <Button
                onClick={checkKeplr}
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Connect Keplr Wallet
              </Button>
              <TextField
                margin="normal"
                fullWidth
                id="toAddress"
                label="Reciever address"
                name="toAddress"
                autoComplete="off"
                value={transaction.toAddress}
                onChange={(e) =>
                  setTransaction((prev) => ({ ...prev, toAddress: e.target.value }))
                }
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
              />
              <Button
                onClick={sendTokens}
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Send tokens
              </Button>
              <History walletAddress={transaction.myAddress}/>
              </Box>
              </Container>
        </>
    );
};

export default SendMoney;