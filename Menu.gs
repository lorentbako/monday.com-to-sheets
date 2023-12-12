function onOpen() {
  SpreadsheetApp.getUi()
  .createMenu("Update")
  .addItem("Get Board Details", "getBoardDetails")
  .addItem("Get Board Data", "boardByItemsPage")
  .addToUi();
}
