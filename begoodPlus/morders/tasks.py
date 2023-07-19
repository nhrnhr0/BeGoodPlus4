

from begoodPlus.celery import telegram_bot
import telegram
from begoodPlus.secrects import TELEGRAM_CHAT_ID_STATUS_UPDATES, SECRECT_CLIENT_SIDE_DOMAIN, BACKEND_DOAMIN_BASE_URL
from celery import shared_task


@shared_task
def send_morder_status_update_to_telegram(morder_id):
    from morders.models import MOrder
    print('=================== send_morder_status_update_to_telegram is running ==========================')
    chat_id = TELEGRAM_CHAT_ID_STATUS_UPDATES
    if chat_id:
        morder = MOrder.objects.select_related('client', 'agent').prefetch_related(
            'products', 'products__product', 'products__entries').get(id=morder_id)
        edit_url = BACKEND_DOAMIN_BASE_URL + morder.get_edit_order_url()
        status = morder.get_status_display()
        name = morder.name or morder.client.businessName
        total_price = morder.recalculate_total_price()
        # remove decimal point
        total_price = str(total_price).split('.')[0]
        msg = f'הזמנה מספר <a href="{edit_url}"><u>{morder_id}</u></a> של <b>{name}</b> עודכנה\n'
        if morder.agent:
            msg += f'סוכן: <b> {morder.agent.username} </b> \n'

        msg += f'סטטוס: <b> {status} </b> \n'
        msg += f'סכום: <b> {total_price}₪ </b> \n'
        for item in morder.products.all():
            row = '<b>' + str(item.prop_totalEntriesQuantity) + '</b>' + \
                ' ' + item.product.title + '\n'
            msg += row

        print({'chat_id': chat_id, 'text': msg})
        try:
            telegram_bot.send_message(
                chat_id=chat_id, text=msg, parse_mode=telegram.ParseMode.HTML)
        except Exception as e:
            print(e)

    pass


@shared_task
def morder_to_spreedsheet_task(morder_id, sync_price_proposal, sync_order):
    from morders.models import MOrder
    morder = MOrder.objects.get(id=morder_id)
    morder.morder_to_spreedsheet(sync_price_proposal, sync_order)
    pass
