@echo off
if not exist "data\db" mkdir "data\db"
echo Starting MongoDB on port 27017...
mongod --dbpath "%~dp0data\db"
