const ItemManager = artifacts.require("./ItemManager.sol");

contract("Item manager test", accounts => {
    it("should create a new item", async() => {
        const itemManagerInstance = await ItemManager.deployed();
        const itemName = "test1";
        const itemPrice = 500;
        const result = await itemManagerInstance.createItem(itemName, itemPrice, {from: accounts[0]});
        const item = await itemManagerInstance.items(0);

        assert.equal(result.logs[0].args._itemIndex, 0, "The index should be 0 since it's the first item");
        assert.equal(item._identifier, itemName, "The item has a different identifier");
    });
});