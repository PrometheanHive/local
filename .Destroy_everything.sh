sudo docker-compose down 
sudo docker system prune -f
sudo rm -rf backend/general/__pycache__/ 
sudo rm -rf backend/src/__pycache__/ 
sudo docker volume prune -f
sudo docker volume rm local_frontend_build 
sudo docker volume rm local_backend_static
sudo rm -rf data/db/db.sqlite3
sudo rm -rf backend/db.sqlite3
sudo rm -rf backend/general/migrations/