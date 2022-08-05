#!/bin/bash

# install supervisor
sudo apt update && sudo apt install supervisor
sudo apt install nginx
sudo apt install python3.8-venv -y
cd /home/ubuntu/BeGoodPlus4/
python3 -m venv env
cp -r ./setup/supervisor/* /etc/supervisor/conf.d/
cp -r ./setup/nginx/* /etc/nginx/conf.d/
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl restart all
sudo supervisorctl status
sudo service nginx restart

