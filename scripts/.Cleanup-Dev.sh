sudo docker compose down 
sudo docker system prune -f
sudo docker volume prune -f
sudo docker volume rm local_frontend_build 
sudo docker volume rm local_backend_static
sudo docker compose build --no-cache
sudo docker compose up