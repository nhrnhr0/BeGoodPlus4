sudo git pull
source ../env/bin/activate
pip install -r final_req.txt
python manage.py migrate
python manage.py collectstatic --noinput
sudo supervisorctl restart boxcelery
sudo supervisorctl restart boxcelerybeat
sudo supervisorctl restart gunicornBox
sudo service nginx restart
sudo supervisorctl status
echo 'sudo service nginx restart was executed'
