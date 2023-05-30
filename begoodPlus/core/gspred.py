
from oauth2client.service_account import ServiceAccountCredentials
from begoodPlus.secrects import GOOGLE_SERVICE_ACCOUNT_FILE
import gspread


def get_gspread_client():
    scope = [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive'
    ]
    creds = ServiceAccountCredentials.from_json_keyfile_name(
        GOOGLE_SERVICE_ACCOUNT_FILE, scope)
    gspred_client = gspread.authorize(creds)
    return gspred_client


def gspread_fetch_sheet_from_url(url):
    # url =  https://docs.google.com/spreadsheets/d/16xOKmrX2cPUlTvqInQdNVDJYAzntZWYaQFd4Gte8kiI/edit#gid=428174964
    # return sheet,title
    gspred_client = get_gspread_client()
    sh = gspred_client.open_by_url(url)
    gid = url.split('gid=')[1]
    ret = None
    worksheet_list = sh.worksheets()
    for sheet in worksheet_list:
        if sheet.id == int(gid):
            ret = sheet
            break
    title = ret.title
    return ret, title
