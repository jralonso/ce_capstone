FROM node:10
RUN apt-get update && apt-get --no-install-recommends -y install ca-certificates=20180409
ADD https://get.aquasec.com/microscanner /
RUN chmod +x /microscanner
ARG token
RUN /microscanner ${token} && rm /microscanner
RUN echo "No vulnerabilities!"

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



EXPOSE 5000
CMD [ "node", "./app/myserver.js" ]
