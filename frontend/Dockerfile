# syntax=docker/dockerfile:1

FROM node:20.2.0

RUN mkdir -p /frontend
WORKDIR /frontend

ENV PATH /frontend/node_modules/.bin:$PATH

COPY package.json ./
RUN npm install


COPY . ./

CMD ["npm", "run", "dev"]