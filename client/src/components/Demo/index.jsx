import { useState } from "react";
import useEth from "../../contexts/EthContext/useEth";
import Title from "./Title";
import Cta from "./Cta";
import Contract from "./Contract";
import ContractBtns from "./ContractBtns";
import Desc from "./Desc";
import NoticeNoArtifact from "./NoticeNoArtifact";
import NoticeWrongNetwork from "./NoticeWrongNetwork";

function Demo() {
  const { state } = useEth();
  const [value, setValue] = useState("?");
  const [cost, setCost] = useState(0);
  const [itemName, setItemName] = useState("no-name");

  const handleSubmit = async () => {
    console.log('itemName: ', itemName, ', cost: ', cost, ', itemManager: ', state.contract.itemManagerContract);
    
    let result = await state.contract.itemManagerContract.methods
      .createItem(itemName, cost)
      .send({from: state.accounts[0]});

    console.log('result', result);
    console.log("Send " + cost + " Wei to " + result.events.SupplyChainStep.returnValues._address);
  };

  const handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value; 
    const name = target.name;

    if (name.includes("cost")) {
      setCost(value);
    } else {
      setItemName(value);
    }
  }

  const demo =
    <>
      <Cta />
      <div className="contract-container">
        <Contract value={value} />
        <ContractBtns setValue={setValue} />
      </div>
      <Desc />
    </>;

  const itemManager = 
  <>
    <h3>Item manager</h3>
    <h4>Add item</h4>
    <div>
      Cost in Wei <input type="number" name="cost" value={cost} onChange={handleInputChange}></input>
    </div>
    <div>
      Item Identifier <input type="text" name="itemName" value={itemName} onChange={handleInputChange}></input>
    </div>

    <button type="button" onClick={handleSubmit}>Create a new item</button>
  </>

  return (
    <div className="demo">
      <Title />
      {
        !state.artifact ? <NoticeNoArtifact /> :
          !state.contract ? <NoticeWrongNetwork /> :
            itemManager
      }
    </div>
  );
}

export default Demo;
