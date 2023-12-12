function errorBox(error) {
  const ui = SpreadsheetApp.getUi()
  Browser.msgBox("Error encountered!", error, ui.ButtonSet.OK)
}
