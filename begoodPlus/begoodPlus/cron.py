
from django.core.management import  call_command

def my_db_backup():
    try:
        call_command('dbbackup')
    except:
        pass