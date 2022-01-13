


from begoodPlus import secrects
from begoodPlus.secrects import FLASHY_MY_API_KEY,TELEGRAM_BOT_TOKEN
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
    flashyCreateContact(crmUser)
    
    if(crmUser.want_whatsapp):
        trigger_welcome_whatsapp_message_to_user(crmUser)
    
    send_new_user_telegram_message_to_admin_group(crmUser)
def trigger_welcome_whatsapp_message_to_user(crmUser):
    
    to_number = crmUser.phone
    message = '''שלום *{user_name}* ,שמחים שהצטרפת לרשימת תפוצה שלנו! אנחנו כאן לכל שאלה'''.format(**{'user_name': crmUser.name})
    response = requests.post(secrects.WHATSAPP_NODE_SERVER_URL + '/lead', json={'phone': to_number, 'message': message})
    print(response.json()['success'], 'message sent to', to_number)
    pass
def send_new_user_telegram_message_to_admin_group(user):
    
    
    chat_id = secrects.TELEGRAM_ADMIN_GROUP_CHAT_ID
    args = {'user_name': user.name,
            'user_business_name': user.businessName,
            'user_business_type': user.businessType,
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
    #telegram_bot.sendMessage(chat_id=chat_id, text=message)
    
    telegram_bot.sendMessage(chat_id=chat_id, text=message)
def flashyCreateContact(user):
    response = requests.post('https://flashyapp.com/api/contacts/create',
                    json={
                        "key": FLASHY_MY_API_KEY,
                        "contact": {
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
        contact_id = json_response['contact']['contact_id']
        user.flashy_contact_id = contact_id
        user.save()