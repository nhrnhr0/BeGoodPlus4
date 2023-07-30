
import time
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


def get_google_service():
    scope = [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive'
    ]
    from googleapiclient.discovery import build
    creds = ServiceAccountCredentials.from_json_keyfile_name(
        GOOGLE_SERVICE_ACCOUNT_FILE, scope)
    service = build('sheets', 'v4', credentials=creds)
    return service


def gspread_fetch_sheet_from_url(url, sh=None):
    # url =  https://docs.google.com/spreadsheets/d/16xOKmrX2cPUlTvqInQdNVDJYAzntZWYaQFd4Gte8kiI/edit#gid=428174964
    # return sheet,title
    sheet = None
    gspred_client = get_gspread_client()
    gid = url.split('gid=')[1]

    if sh not in [None, '']:
        try:
            sheet = get_sheet_from_gid(gid, sh)
        except:
            sh = gspred_client.open_by_url(url)
            time.sleep(0.2)
    else:
        sh = gspred_client.open_by_url(url)
        time.sleep(0.2)

    if sheet == None:
        sheet = get_sheet_from_gid(gid, sh)

    return sheet, sheet.title, sh


def get_sheet_from_gid(gid, sh):
    worksheet_list = sh.worksheets()
    ret = None
    for sheet in worksheet_list:
        if sheet.id == int(gid):
            ret = sheet
            break
    if ret == None:
        raise Exception('no sheet found')
    return ret
