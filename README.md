# CodeToImpact2023
GIC's CodeToImpact2023 group 1's submission.

Team members:
1. Foo Chuan Shao, [chuanshaof](https://github.com/chuanshaof)
2. Tan Jian Wei, [jianoway](https://github.com/jianoway)
3. Teo Keng Swee, [keng-swee](https://github.com/keng-swee)
4. Shane Ong, [EternalTempest](https://github.com/EternalTempest)

## How to run Frontend
1. Navigate to hackathon-g1-frontend
2. npm i --legacy-peer-deps
3. npm start

## How to run Backend
1. Navigate to hackathon-g1-backend
2. pip install -r requirements.txt
3. uvicorn main:app --reload

### Deployment requisites
1. Have docker installed
2. Have docker-compose installed
3. Have a .env file in both front & backend with secret keys

## Setup for Cloud Deployment
From the root directory,
- To start:

  `docker-compose up`

- To tear down
  
    `docker-compose down --rmi all`

