# Monday.com API to Google Sheets
Get details from Monday GraphQL API directly into google sheets, using app script.

First you need to create a spreadsheet with these specifics:
1. Create two sheets one called "Board" and the other "BoardData".
2. On the "Board" Sheet:
  2.1. A1: "Column Title", B1: "Column ID", C1: "GET".
  2.2. F1: "Board ID:", F2: "Nr of Items:", F4: "Board Name:".
  2.3. I1: "Group Title", J1: "Group ID", K1: "GET".
3. On the "BoardData" sheet should be blank (It also clears each time you get the data for a new board or 
for the same board with different filters.)
![image](https://github.com/lorentbako/monday.com-to-sheets/assets/10836062/21da4007-dde6-43fc-a148-06bac68a72b2)

# How to run the Scripts
1. First you need to get the board Details (Columns, Groups and Name)
  1.1. Enter the Board ID in the Sheet "Board" in cell G1.
  ![image](https://github.com/lorentbako/monday.com-to-sheets/assets/10836062/6e9ce3a0-3e46-44a5-bbda-53406a7d92fe)
  1.2. Run the function "Get Board Details" from the Menu "Update".
  ![image](https://github.com/lorentbako/monday.com-to-sheets/assets/10836062/bfa13f64-53df-4aec-881b-832b5d55ac64)
3. After the Board details have been retrieved successfully you can get the Data from the board using filters.
  2.1. You can filter columns by checking in range C2:C for the column name in the range A2:A 
  (if you dont check any columns all the columns will be retrieved)
  2.2. You can filter groups by checking in range K2:K for the group name in the range I2:I 
  (if you dont check any group all the groups will be retrieved)
  2.3. After you are happy with your filters run the function "Get Board Data" from the menu update.

Thats all.
For any question you can contact me on linkedin.com/in/lorentbako.
