FROM mhart/alpine-node:7.10.0

# Create app directory
RUN mkdir -p /usr/atlas/webapp

# Change Working Directory
WORKDIR /usr/atlas/webapp

ONBUILD ARG NODE_ENV
ONBUILD ENV NODE_ENV $NODE_ENV

# Install app dependencies
COPY __package.json /usr/atlas/webapp/package.json
COPY newrelic.js /usr/atlas/webapp 

# Bundle app source
# COPY . /usr/atlas/webapp
COPY dist/. /usr/atlas/webapp/dist
COPY server/. /usr/atlas/webapp/server

RUN npm install
# RUN npm run server 

EXPOSE 8000

CMD ["npm", "run", "server"]
