function add_active_sheet_to_providers() {

}

function remove_active_sheet_to_providers() {

}

function sync_current_active_sheet() {
    let myHeaders = get_admin_headers();
    var ss = SpreadsheetApp.getActiveSheet();
    let morder_id = ss.getRange('A2');
    morder_id = morder_id.getValue().toString();
    let sheets_gid = ss.getSheetId().toString();
    var formData = {
        'sheets_gid':sheets_gid, // '1340060120',
        'morder_id': morder_id //'435'
    };
    var requestOptions = {
        method: 'post',
        headers: myHeaders,
        redirect: 'follow',
        payload: formData
    };
    try {
        var response = UrlFetchApp.fetch(SYNC_SPREEADSHEET_URL,requestOptions);
        let content = response.getContentText()
        console.log(content);
    }
    catch(error) {
        Logger.log(error);
    }
}


function get_ids_to_update() {
  // get the ids_to_update from PropertiesService
    let ids_to_update = PropertiesService.getScriptProperties().getProperty('ids_to_update');
    if (ids_to_update) {
        ids_to_update = JSON.parse(ids_to_update);
    }
    else {
        ids_to_update = [];
    }

    // get index 
    let ids_to_update_i = PropertiesService.getScriptProperties().getProperty('ids_to_update_i');
    if (ids_to_update_i) {
        ids_to_update_i = parseInt(ids_to_update_i);
    }
    else {
        ids_to_update_i = 0;
    }
    return {
        'ids': ids_to_update,
        'index': ids_to_update_i
    }
}

function sync_all_orders_to_admin() {
    // E2 of every sheet have the last server update
    // for example 18/07/2023 16:44:26
    // if the last update to the server was before the last update of the sheet then update the server
    let ids_to_update = [];
    // {
    //     'sheets_gid':sheets_gid, // '1340060120',
    //     'morder_id': morder_id //'435'
    // };
    let sheets = SpreadsheetApp.getActiveSpreadsheet().getSheets();
    for (let i = 0; i < sheets.length; i++) {
        // get the last update to the server
        let s = sheets[i];
        sheets_gid = s.getSheetId().toString();
        morder_id = s.getRange('A2').getValue().toString();
        title = s.getName();

        if (sheets_gid && morder_id ){
            ids_to_update.push({
                'sheets_gid':sheets_gid, // '1340060120',
                'morder_id': morder_id, //'435'
                'title': title,
                'status': 'pending'
            });
        }
    }
    console.log(ids_to_update);
    // set PropertiesService to the ids_to_update
    PropertiesService.getScriptProperties().setProperty('ids_to_update', JSON.stringify(ids_to_update));
    let myHeaders = get_admin_headers();


    const html = HtmlService.createHtmlOutputFromFile('sheet_sync_display.html')
        .setWidth(400)
        .setHeight(300)
        .setSandboxMode(HtmlService.SandboxMode.IFRAME);
    SpreadsheetApp.getUi().showModelessDialog(html, 'סנכרון מסמכים');
    

    for(let i = 0; i < ids_to_update.length; i++) {
        let el = ids_to_update[i];
        let formData = {
            'sheets_gid': el.sheets_gid, // '1340060120',
            'morder_id': el.morder_id //'435'
        }
        var requestOptions = {
            method: 'post',
            headers: myHeaders,
            redirect: 'follow',
            payload: formData
        };
        try {
            var response = UrlFetchApp.fetch(SYNC_SPREEADSHEET_URL,requestOptions);
            let content = response.getContentText()
            console.log(content);
            // update the ids_to_update in PropertiesService
            ids_to_update[i].status = "success"
            PropertiesService.getScriptProperties().setProperty('ids_to_update', JSON.stringify(ids_to_update));
        }
        catch(error) {
          console.log(formData)
            Logger.log(error);
            ids_to_update[i].status = "error"
            ids_to_update[i].error = error
            PropertiesService.getScriptProperties().setProperty('ids_to_update', JSON.stringify(ids_to_update));
        }
        finally {
            // update the ids_to_update in PropertiesService
            
            PropertiesService.getScriptProperties().setProperty('ids_to_update_i', i);
        }
    }
}