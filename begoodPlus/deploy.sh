sudo git pull
source ../env/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
sudo supervisorctl restart gunicornNewMs2
sudo supervisorctl restart begoodcelery
sudo supervisorctl restart begoodcelerybeat
sudo service nginx restart
echo 'sudo service nginx restart was executed'
