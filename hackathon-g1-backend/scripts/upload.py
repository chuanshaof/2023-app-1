import os
import requests

url = 'http://127.0.0.1:8000/ingestor'

current_directory = os.getcwd()
csv_folder = os.path.join(current_directory, "app/routers/external-funds")

for filename in os.listdir(csv_folder):
    if filename.endswith(".csv"):   
        file_path = os.path.join(csv_folder, filename)

        uploadFile = {'file': open(file_path, 'rb')}

        response = requests.post(url=url, files=uploadFile)
        assert response.status_code == 200

