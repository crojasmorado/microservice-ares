FROM node:14.18.1-alpine3.12
RUN npm -g install nodemon@1.18.7
RUN npm -g install pm2@3.2.2
WORKDIR /opt/projects/gateway/app
CMD npm install && nodemon -L server.js
