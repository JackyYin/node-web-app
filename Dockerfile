FROM node:latest
WORKDIR /usr/app/src
# Layer 1 ~> Copy Lock Files
COPY package.json ./
# Layer 2 ~> Install Dependencies
RUN yarn install --ignore-scripts --pure-lockfile \
    && yarn cache clean

COPY . .

EXPOSE 8080
CMD [ "node", "server.js" ]
