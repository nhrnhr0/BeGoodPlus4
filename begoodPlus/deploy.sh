sudo git pull
source ../env/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
sudo supervisorctl restart all
sudo service nginx restart
echo 'sudo service nginx restart was executed'
