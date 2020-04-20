FROM node:10

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY ./app/package*.json ./

RUN npm install

# Bundle app source
COPY . .

# Run Vulnerability scan
RUN apt-get update && apt-get -y install ca-certificates
ADD https://get.aquasec.com/microscanner /
RUN chmod +x /microscanner
ARG token
RUN /microscanner ${token} && rm /microscanner
RUN echo "No vulnerabilities!"

EXPOSE 5000
CMD [ "node", "./app/myserver.js" ]
