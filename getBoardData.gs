function boardByItemsPage() {
  // Get initial filters from the sheet Board
  const boardColumsRaw = boardSheet.getRange('A2:D').getValues();
  let allGroups = boardSheet.getRange('I2:K').getValues();
  let startingLimit = boardSheet.getRange('G2').getValue()

  // Declare needed array to prepare filters for the call.
  let selectedColumnIds = [];
  let selectedColumnsNames = ["Group", "Name"]
  let groupFilter = { column_id: "group", compare_value: [], operator: "any_of" }

  // Get all the list of filtered columns & groups.
  boardColums = boardColumsRaw.filter(row => row[0] && row[2]);
  allGroups = allGroups.filter(row => row[0] && row[2]);

  // Get only the filtered groups
  allGroups.forEach(group => groupFilter.compare_value.push(group[1]));

  // Get only the filtered columns ID's and Names 
  if (boardColums.length > 0) {
    boardColums.forEach(col => {
      selectedColumnsNames.push(col[0]);
      selectedColumnIds.push(col[1]);
    })
  }
  // If no filters are selected push all the column names.
  if (boardColums.length === 0) {
    selectedColumnsNames = ["Group", "Name", ...boardColumsRaw.reduce((acc, curr) => {
      if (curr[0]) { acc.push(curr[0]) }
      return acc;
    }, [])];
  }

  groupFilter = groupFilter.compare_value.length > 0 ? JSON.stringify(groupFilter)
    .replace(`"column_id"`, "column_id")
    .replace(`"compare_value"`, "compare_value")
    .replace(`"operator"`, "operator")
    .replace('"any_of"', "any_of") : JSON.stringify([]);

  let selectedColumnsQueryArray = selectedColumnIds.map((colId) => '"' + colId + '"');
  let selectedColumnsQuery = selectedColumnsQueryArray.join(', ');

  // Url of Monday API
  const url = 'https://api.monday.com/v2';

  // Headers, using version 2023-10 of the API.
  const headers = {
    'Authorization': apiKey,
    'Content-Type': 'application/json',
    'API-Version': '2023-10',
    'muteHttpExceptions': true
  };

  //The final GraphQL Query.
  let payload = {
    'query': `query 
    {
      boards (ids: ${boardId})
      {
        items_page (limit:100, query_params: {rules: ${groupFilter}}) 
        {
          cursor
          items 
          {
            group{title}
            name
            column_values(ids: [ ${selectedColumnsQuery} ])
            {
              text
            }
          }
        }
      }
    }`
  }

  let options = {
    'method': 'post',
    'headers': headers,
    'muteHttpExceptions': true,
    'payload': JSON.stringify(payload)
  };

  let allItems = [];
  let cursor = null;

  try {
    //API Call here.
    const response = UrlFetchApp.fetch(url, options);
    const jsonData = JSON.parse(response);

    // Declare all items array to collect them all
    allItems = jsonData.data.boards[0].items_page.items;

    //Declare cursor and move to next page
    cursor = jsonData.data.boards[0].items_page.cursor
  } catch (error) {
    errorBox(error)
  }

  // Deduct 100 from the limit because the initial response we get 100 items 
  // If we get less than 100 means that we got all what we needed and no need to do the while (also the cursor will be null in that case)
  startingLimit -= 100;
  while (cursor !== null) {
    let currentLimit = 25;
    if (startingLimit > 100) {
      currentLimit = 100
    } else if (startingLimit < 100) {
      if (startingLimit <= 0) {
        break
      } else if (startingLimit <= 25) {
        currentLimit = 25
      } else {
        currentLimit = startingLimit
      }
    }

    payload =
    {
      query: `query 
      {
        next_items_page (limit :${currentLimit}, cursor: "${cursor}") 
          {
            cursor
            items 
              {
                group{title}
                name
                column_values(ids: [ ${selectedColumnsQuery} ])
                {
                  text
                }
              }
          }
      }`
    }

    options = {
      'method': 'post',
      'headers': headers,
      payload: JSON.stringify(payload)
    };

    try {
      // API Call for the next page
      const response = UrlFetchApp.fetch(url, options);
      const jsonData = JSON.parse(response);

      // Collect next page
      allItems = allItems.concat(jsonData.data?.next_items_page.items)
      cursor = jsonData.data?.next_items_page.cursor
    } catch (error) {
      errorBox(error)
    }
    // Declare next cursor and move to next page
    startingLimit -= 100
  }

  // Write data to the "BoardData" sheet
  boardDataSheet.clear();
  const allData = []
  boardDataSheet.getRange(1, 1, 1, selectedColumnsNames.length).setValues([selectedColumnsNames]);

  // Write data for selected columns
  for (let j = 0; j < allItems.length; j++) {
    let item = allItems[j];
    let rowData = [item?.group.title, item?.name];
    item?.column_values.map(({ text }) => rowData.push(text))
    allData.push(rowData)
  }
  boardDataSheet.getRange(2, 1, allData.length, allData[0].length).setValues(allData)

  successToast("Board Data retrieved succesfully according to respective filters!")
}
