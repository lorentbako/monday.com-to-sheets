function getBoardDetails() {
  const url = 'https://api.monday.com/v2';
  const headers = {
    'Authorization': 'Bearer ' + apiKey,
    'Content-Type': 'application/json',
    'API-Version': '2023-10'
  };

  // GraphQL query to get the board name, groups and columns
  const payload = {
    'query': `query { 
      boards (ids: ${boardId}) { 
        name
        groups { 
          id title } 
        columns { 
          id title } 
      } 
    }`
  };

  const options = {
    'method': 'post',
    'headers': headers,
    'payload': JSON.stringify(payload),
    'muteHttpExceptions': true
  };
  let jsonData, columns, groups, name = null


  try {
    // Make the api call
    const response = UrlFetchApp.fetch(url, options);
    jsonData = JSON.parse(response);

    if (response.getResponseCode() !== 200) {
      errorBox(`Response error code: ${response.getResponseCode()} ${response}`)
      return
    }

    if (jsonData.data.boards.length === 0) {
      errorBox(`Board with ID: ${boardId} was not found!`)
      return
    }

    columns = jsonData.data.boards[0].columns;
    groups = jsonData.data.boards[0].groups;
    name = jsonData.data.boards[0].name

    boardSheet.getRange("A1:D").clearContent(); // Clear previous columns
    boardSheet.getRange("I2:K").clearContent(); // Clear previous groups
    boardSheet.getRange("F4:G4").clearContent(); // Clear previous name

    // Write columns, groups and board name
    const columnTitles = ["Column Title", "Column ID", "GET"]
    const groupTitles = ["Group Title", "Group ID", "GET"]
    const boardName = ["Board Name:", name]
    boardSheet.getRange("A1:C1").setValues([columnTitles]);
    boardSheet.getRange("F4:G4").setValues([boardName]);
    boardSheet.getRange("I1:K1").setValues([groupTitles]);
  } catch (error) {
    errorBox(error)
  }

  // From object to arrays in order to write to sheet
  columns = columns.filter(col => col.id !== 'name')
  const groupsParsed = groups.map(group => [group.title, group.id])
  const columnsParsed = columns.map(column => [column.title, column.id])

  // Write to sheet
  boardSheet.getRange(2, 1, columnsParsed.length, 2).setValues(columnsParsed)
  boardSheet.getRange(2, 9, groupsParsed.length, 2).setValues(groupsParsed)

  successToast("Board Details retrieved!")
}
