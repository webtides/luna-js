FROM alpine
RUN apk update && apk upgrade
RUN apk add nodejs
RUN apk add --update npm git

WORKDIR /moon-js

COPY .npmrc ./
COPY package*.json ./

RUN npm install

# Copy the whole application
COPY . .

EXPOSE 3005:3005

CMD [ "node_modules/.bin/moon" ]
