const express = require('express');
const bodyParser = require('body-parser');
const googleSheets = require('gsa-sheets');

const key = require('./privateSettings.json');

// TODO(you): Change the value of this string to the spreadsheet id for your
// GSA spreadsheet. See HW5 spec for more information.
const SPREADSHEET_ID = '1SWHCW2oA50Hye1-df9KJyZaOUyVPSsxKveYIM9Dueq4';

const app = express();
const jsonParser = bodyParser.json();
const sheet = googleSheets(key.client_email, key.private_key, SPREADSHEET_ID);

app.use(express.static('public'));

async function onGet(req, res) {
  const result = await sheet.getRows();
  const rows = result.rows;
  console.log(rows);

  // TODO(you): Finish onGet.
  /** get title */
  const title = [];
  for(let j of rows[0])
    title.push(j);
  /** new obejct Array*/
  var arr = [];
  for(let i in rows){
    let tmp = {};
    if(i==0)
      continue;
    for(let j in title){
      tmp[title[j]] = rows[i][j];
    }
    arr.push(tmp);
  }
  console.log(arr);


  res.json(arr);//{ status: 'unimplemented'} );
}
app.get('/api', onGet);

async function onPost(req, res) {
  const messageBody = req.body;
  const success = { success: "true" }
  // TODO(you): Implement onPost.
  //console.log(messageBody);
  const arr = [];
  for(let i in messageBody){
    console.log(messageBody[i]);
    arr.push(messageBody[i]);
  }
  await sheet.appendRow(arr).then( value => {
    res.json( { "response": "success"} );
    console.log("Post: " + value);
  }, reason => {
    res.json( { "response": reason} );
    console.log("Post: " + reason);
  })
}
app.post('/api', jsonParser, onPost);

async function onPatch(req, res) {
  const column  = req.params.column;
  const value  = req.params.value;
  const messageBody = req.body;

  // TODO(you): Implement onPatch.
  const result = await sheet.getRows();
  const rows = result.rows;
  console.log(column);
  console.log(value);
  console.log(messageBody);
  let column_index_on_Set;
  let row_index_on_Set;
  let title = rows[0];
  let tmp = {};
  let item = [];
  for(let i in rows[0]){
    if(rows[0][i] == column){
      column_index_on_Set = i;
    }
  }
  for(let i in rows){
    if(rows[i][column_index_on_Set] == value){
      row_index_on_Set = i;
      for(let j in title){
        tmp[title[j]] = rows[i][j];
      }
      break;
    }
  }
  for(let i in messageBody){
    tmp[i] = messageBody[i];
  }
  for(let i in tmp){
    item.push(tmp[i]);
  }
  console.log(item);
  await sheet.setRow(parseInt(row_index_on_Set), item).then( value => {
    res.json( { "response": "success"} );
    console.log("Patch: " + value);
  }, reason => {
    res.json( { "response": reason} );
    console.log("Patch: " + reason);
  })
}
app.patch('/api/:column/:value', jsonParser, onPatch);

async function onDelete(req, res) {
  const result = await sheet.getRows();
  const rows = result.rows;
  const column  = req.params.column;
  const value  = req.params.value;
  // TODO(you): Implement onDelete.
  /** find title */
  let column_index_on_Delete;
  let row_index_on_Delete;
  let flag = 0;
  for(let i in rows[0]){
    if(rows[0][i] == column){
      column_index_on_Delete = i;
    }
  }
  for(let i in rows){
    if(rows[i][column_index_on_Delete] == value){
      row_index_on_Delete = i;
      flag = 1;
      console.log("found and delete: " + value + " in " + row_index_on_Delete);
      break;
    }
  }
  if(flag == 1){
    const result = await sheet.deleteRow(parseInt(row_index_on_Delete));//  
    //console.log(await sheet.deleteRow(parseInt(row_index_on_Delete)));
    res.json( { "response": "success"} );
  }
  else{
    res.json( { "response": "failure"} );
  }
  
}
app.delete('/api/:column/:value',  onDelete);


// Please don't change this; this is needed to deploy on Heroku.
const port = process.env.PORT || 3000;

app.listen(port, function () {
  console.log(`Server listening on port ${port}!`);
});
