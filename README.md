# first setup

1) create postgreas database in docker

```
docker run --name postgres -d -p 5432:5432 -e POSTGRES_PASSWORD=password postgres:alpine
```

2) delete old database and copy data from `.sql` file to the postgres database

```
docker cp db.sql postgres:/tmp/db.sql
docker exec -it postgres /bin/bash
psql -h localhost -U postgres
DROP DATABASE testdb5;
CREATE DATABASE testdb5;
\q
PGPASSWORD=password psql -h localhost -U postgres -d testdb5 < /tmp/db.sql
```

3) copy the secrets file

```
cp example-secrects.py secrects.py
```

4) install python env and requirements
   ```
   python3 -m venv env
   source env/bin/activate
   pip install -r final_req.txt
   ```

# how to run

pull the code

```
git pull
```

activate the env

```
source env/bin/activate

```

migrate the database

```
python manage.py migrate
```

run the server

```
python manage.py runserver

```
