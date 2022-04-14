### To install packages
```
Before running the project run below command
npm i 
```

## Install mysql if not installed

```
brew install mysql@5.7
echo 'export PATH="/usr/local/opt/mysql@5.7/bin:$PATH"' >> ~/.bash_profile
source ~/.bash_profile
brew services start mysql@5.7
mysql_secure_installation
```

## to create db connection and tables

```
Before starting the server run below command to run onetime scripts
node server/one-time-database-connection.js
```

## Start the node server using below command

```
nodemon 
or 
node server.js
```

