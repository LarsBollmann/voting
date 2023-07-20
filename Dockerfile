FROM node:19 as build

COPY package.json /app/package.json
WORKDIR /app
RUN npm install

COPY . /app
RUN yarn run build

FROM node:alpine

COPY --from=build /app/build /app/build
COPY package.json /app/package.json
COPY prodServer.ts /app/prodServer.ts
COPY ./src/lib/ /app/src/lib/

WORKDIR /app

RUN npm install --omit=dev

EXPOSE 3000
ENTRYPOINT [ "npx", "tsm", "prodServer.ts" ]