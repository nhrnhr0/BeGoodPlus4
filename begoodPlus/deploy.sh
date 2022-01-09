sudo git pull
source ../env/bin/activate
pip install -r final_req.txt
python manage.py migrate
python manage.py collectstatic --noinput
sudo supervisorctl restart begoodcelery
sudo supervisorctl restart begoodcelerybeat
sudo supervisorctl restart gunicornNewMs2
sudo service nginx restart
sudo supervisorctl status
echo 'sudo service nginx restart was executed'
