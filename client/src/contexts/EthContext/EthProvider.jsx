import React, { useReducer, useCallback, useEffect } from "react";
import Web3 from "web3";
import EthContext from "./EthContext";
import { reducer, actions, initialState } from "./state";

function EthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const init = useCallback(
    async artifacts => {
      const {ItemManagerContract, ItemContract} = artifacts;

      if (ItemManagerContract && ItemContract) {
        const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
        const accounts = await web3.eth.requestAccounts();
        const networkID = await web3.eth.net.getId();
        const ItemManagerContractAbi = ItemManagerContract.abi;
        const ItemContractAbi = ItemContract.abi;
        
        let itemManagerContractAddress, itemManagerContract, itemContractAddress, itemContract;
        try {
          itemManagerContractAddress = ItemManagerContract.networks[networkID].address;
          itemManagerContract = new web3.eth.Contract(ItemManagerContractAbi, itemManagerContractAddress);
          
          // itemContractAddress = ItemContract.networks[networkID].address;
          
          /**
           * I couldn't get the "networks" for itemContract from client/src/contracts/Item.json after truffle migrate
           * So instead I use itemManagerContractAddress and it works fine
           * But why there is the networks object is empty?
          **/
          itemContract = new web3.eth.Contract(ItemContractAbi, itemManagerContractAddress); 
          listenToPaymentEvent(itemManagerContract);
          
        } catch (err) {
          console.error(err);
        }
        dispatch({
          type: actions.init,
          data: { artifact: artifacts, web3, accounts, networkID, contract: {itemManagerContract, itemContract} }
        });
      }
    }, []);

  useEffect(() => {
    const tryInit = async () => {
      try {
        const ItemManagerContract = require("../../contracts/ItemManager.json");
        const ItemContract = require("../../contracts/Item.json");
        init({ItemManagerContract, ItemContract});
      } catch (err) {
        console.error(err);
      }
    };

    tryInit();
  }, [init]);

  useEffect(() => {
    const events = ["chainChanged", "accountsChanged"];
    const handleChange = () => {
      init(state.artifact);
    };

    events.forEach(e => window.ethereum.on(e, handleChange));
    return () => {
      events.forEach(e => window.ethereum.removeListener(e, handleChange));
    };
  }, [init, state.artifact]);

  const listenToPaymentEvent = (itemManagerContract) => {
    itemManagerContract.events.SupplyChainStep()
      .on('data', async (evt) => {
        console.log('evt', evt);
        if(evt.returnValues._step == "1") {
          const item = await itemManagerContract.methods.items(evt.returnValues._itemIndex).call();

          console.log('item', item);
          console.log("Item " + item._identifier + " was paid, deliver it now!");
        }
      })
  }

  return (
    <EthContext.Provider value={{
      state,
      dispatch
    }}>
      {children}
    </EthContext.Provider>
  );
}

export default EthProvider;
