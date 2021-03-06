


from begoodPlus import secrects
from begoodPlus.secrects import FLASHY_MAIN_LIST_ID, FLASHY_MY_API_KEY,TELEGRAM_CHAT_ID_LEADS
from .models import CrmUser
import requests

import telegram
from begoodPlus.celery import telegram_bot
from celery import shared_task

# send to flashy the new user
# send telegram message to the admin group
# if the user wants to receive whatsapp, send a whatsapp message to the user
@shared_task
def new_user_subscribed_task(subscriber_id):
    crmUser = CrmUser.objects.get(id=subscriber_id)
    try:
        flashyCreateContact(crmUser)
    except:
        pass
    
    if(crmUser.want_whatsapp):
        try:
            #trigger_welcome_whatsapp_message_to_user(crmUser)
            pass
        except:
            pass
    try:
        send_new_user_telegram_message_to_admin_group(crmUser)
    except:
        pass
def trigger_welcome_whatsapp_message_to_user(crmUser):
    
    to_number = crmUser.phone
    message = '''שלום *{user_name}* ,שמחים שהצטרפת לרשימת תפוצה שלנו! אנחנו כאן לכל שאלה'''.format(**{'user_name': crmUser.name})
    response = requests.post(secrects.WHATSAPP_NODE_SERVER_URL + '/lead', json={'phone': to_number, 'message': message})
    print(response.json()['success'], 'message sent to', to_number)
    pass
def send_new_user_telegram_message_to_admin_group(user):
    
    
    chat_id = TELEGRAM_CHAT_ID_LEADS
    args = {'user_name': user.name,
            'user_business_name': user.businessName,
            'user_business_type': user.businessType,
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