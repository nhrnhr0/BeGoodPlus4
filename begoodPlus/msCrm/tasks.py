

from django.test import TestCase
from begoodPlus.secrects import FLASHY_MAIN_LIST_ID, FLASHY_MY_API_KEY, TELEGRAM_CHAT_ID_LEADS
from begoodPlus.celery import telegram_bot
from .models import ImportMsCrmUserTask, MsCrmBusinessSelectToIntrests, MsCrmBusinessTypeSelect
import requests
from celery import shared_task
from .models import MsCrmUser


def flashyCreateContact(user):
    print('=========== start flashyCreateContact ===========')
    response = requests.post(f'https://flashyapp.com/api/lists/{FLASHY_MAIN_LIST_ID}/subscribe',
                             json={
                                 "key": FLASHY_MY_API_KEY,
                                 "subscriber": {
                                     "email": user.email,
                                     "first_name": user.name,
                                     "phone": user.phone,
                                     'client_type': user.businessType,
                                     'intrest_whatsapp': user.want_whatsapp,
                                     'intrest_mail': user.want_emails,
                                     'business_name': user.businessName,
                                 },
                             })
    print(response)
    json_response = response.json()
    if(json_response['success'] == True):
        print('flashy contact created')
        contact_id = json_response['subscriber']['contact_id']
        user.flashy_contact_id = contact_id
        user.save()
    print('=========== end flashyCreateContact ===========')


def send_new_user_telegram_message_to_admin_group(user):

    chat_id = TELEGRAM_CHAT_ID_LEADS
    bname = ''
    if user.businessSelect:
        bname = user.businessSelect.name
    args = {'user_name': user.name,
            'user_business_name': user.businessName,
            'user_business_type': bname,
            'user_business_typeCustom': user.businessTypeCustom or '',
            'user_phone': user.phone,
            'user_email': user.email,
            'user_want_emails': 'כן' if user.want_emails else 'לא',
            'user_want_whatsapp': 'כן' if user.want_whatsapp else 'לא',
            }
    message = '''טופס לידים 
        שם: {user_name}
        טלפון: {user_phone}
        אימייל: {user_email}
        רוצה מיילים: {user_want_emails}
        רוצה וואצאפס: {user_want_whatsapp}
        שם העסק: {user_business_name}
        סוג העסק: {user_business_type}
    '''.format(**args)
    if args['user_business_typeCustom']:
        message += '''
        סוג העסק מותאם אישית: {user_business_typeCustom}
        '''.format(**args)
    #telegram_bot.sendMessage(chat_id=chat_id, text=message)

    res = telegram_bot.sendMessage(chat_id=chat_id, text=message)
    print('done sending telegram message: ', res)

# Create your tests here.
# send to flashy the new user
# send telegram message to the admin group
# if the user wants to receive whatsapp, send a whatsapp message to the user


@shared_task
def new_user_subscribed_task(subscriber_id):
    crmUser = MsCrmUser.objects.get(id=subscriber_id)
    try:
        flashyCreateContact(crmUser)
    except:
        pass

    if(crmUser.want_whatsapp):
        try:
            # trigger_welcome_whatsapp_message_to_user(crmUser)
            pass
        except:
            pass
    try:
        send_new_user_telegram_message_to_admin_group(crmUser)
    except:
        pass


@shared_task
def upload_mscrm_business_select_to_intrests_exel_task(df1, task_logger: ImportMsCrmUserTask):
    b_select_to_intrests = MsCrmBusinessSelectToIntrests.objects.all()

    existing_phone_count = 0
    new_phone_count = 0
    task_logger.set_status('started')
    total_rows = len(df1.index)
    try:
        for index, row in df1.iterrows():
            task_logger.set_status('' + str(index) + '/' + str(total_rows))
            b_name = row['שם העסק']  # str(row['שם העסק'])
            b_select_name = str(row['תחום עיסוק לפי אדמין'])
            if b_select_name == 'nan' or b_select_name == '' or b_select_name == 'None':
                continue

            businessSelectObj = MsCrmBusinessTypeSelect.objects.get(
                name=b_select_name)
            contact_man = str(row['איש קשר'])
            if contact_man == 'nan':
                contact_man = b_name.split(' ')[0]
            phone = str(row['טלפון'])
            string_encode = phone.encode("ascii", "ignore")
            string_decode = string_encode.decode()

            phone = string_decode.strip()
            if phone.startswith('05'):
                phone = '972' + phone[1:]
            #print(index,b_select_name, contact_man)
            if MsCrmUser.objects.filter(phone=phone).exists():
                existing_phone_count += 1
                task_logger.log(
                    f'מספר {phone} כבר קיים במערכת, לא נוסף')
                continue
            else:
                new_phone_count += 1
                task_logger.log(
                    f'מספר {phone} נוסף למערכת')

            user = MsCrmUser.objects.create(
                businessName=b_name,
                businessSelect=businessSelectObj,
                name=contact_man,
                phone=phone
            )
            entrys = b_select_to_intrests.filter(
                businessSelect=businessSelectObj)
            if entrys.exists():
                entry = entrys.first()
                user.intrests.set(entry.intrests.all())
            user.save()

        # log new and existing users
        task_logger.log('חדשים: ' + str(new_phone_count))
        task_logger.log('קיימים: ' + str(existing_phone_count))
        task_logger.set_status('completed')
        return
    except Exception as e:
        task_logger.log('error: ' + str(e))
        task_logger.set_status('error')
        return
