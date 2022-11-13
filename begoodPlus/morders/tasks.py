

from begoodPlus.celery import telegram_bot
import telegram
from begoodPlus.secrects import TELEGRAM_CHAT_ID_STATUS_UPDATES, SECRECT_CLIENT_SIDE_DOMAIN
from celery import shared_task


@shared_task
def send_morder_status_update_to_telegram(edit_url, status, morder_id, name, total_price):
    from morders.models import MOrder
    print('=================== send_morder_status_update_to_telegram is running ==========================')
    chat_id = TELEGRAM_CHAT_ID_STATUS_UPDATES
    if chat_id:
        msg = f'הזמנה מספר <a href="{edit_url}"><u>{morder_id}</u></a> של <b>{name}</b> עודכנה\n'
        msg += f'סטטוס: <b> {status} </b> \n'
        msg += f'סכום: <b> {total_price}₪ </b> \n'

        print({'chat_id': chat_id, 'text': msg})
        telegram_bot.send_message(
            chat_id=chat_id, text=msg, parse_mode=telegram.ParseMode.HTML)
    pass
