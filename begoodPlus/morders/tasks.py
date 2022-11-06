

from begoodPlus.celery import telegram_bot
import telegram
from begoodPlus.secrects import TELEGRAM_CHAT_ID_STATUS_UPDATES, SECRECT_SERVER_SIDE_DOMAIN
from celery import shared_task


@shared_task
def send_morder_status_update_to_telegram(morder_id):
    from morders.models import MOrder
    print('=================== send_morder_status_update_to_telegram is running ==========================')
    chat_id = TELEGRAM_CHAT_ID_STATUS_UPDATES
    if chat_id:
        morder = MOrder.objects.get(id=morder_id)
        edit_url = SECRECT_SERVER_SIDE_DOMAIN + morder.get_edit_order_url()
        msg = f'הזמנה מספר <a href="{edit_url}"><u>{morder.id}</u></a> של <b>{morder.name or morder.client.businessName}</b> עודכנה\n'
        status = morder.get_status_display()
        msg += f'סטטוס: <b> {status} </b> \n'
        msg += f'סכום: <b> {morder.total_sell_price}₪ </b> \n'

        print({'chat_id': chat_id, 'text': msg})
        telegram_bot.send_message(
            chat_id=chat_id, text=msg, parse_mode=telegram.ParseMode.HTML)
    pass
