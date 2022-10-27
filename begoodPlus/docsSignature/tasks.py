
from celery import shared_task
from begoodPlus.secrects import TELEGRAM_CHAT_ID_DOC_SIGNS
from docsSignature.models import MOrderSignature
from begoodPlus.celery import telegram_bot
import telegram


@shared_task
def send_signature_doc_telegram_task(order_id):
    print('=================== send_signature_doc_telegram_task is running ==========================')

    order = MOrderSignature.objects.get(id=order_id)
    msg = f'מסמך לתחימת {order.client_name} נחתם\n'
    msg += f'לצפייה במסמך לחץ על הקישור הבא:\n'
    msg += f'<a href="{order.get_client_sign_url()}">לחץ כאן</a>'

    # msg += f'לחץ כאן לצפייה במסמך: <a href="{order.get_client_sign_url()}"> לחץ כאן < /a >'
    sign_image_url = order.signature_cimage
    # send the msg and the image from sign_image_url to TELEGRAM_CHAT_ID_DOC_SIGNS
    chat_id = TELEGRAM_CHAT_ID_DOC_SIGNS
    # telegram_bot.send_message(
    #     chat_id=chat_id, text=msg, parse_mode=telegram.ParseMode.HTML)
    telegram_bot.send_photo(
        chat_id, sign_image_url, caption=msg, parse_mode=telegram.ParseMode.HTML)

    pass
