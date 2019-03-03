# Build Phase

# 'as <stage name>' specifies the current stage
FROM node:alpine as builder
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
RUN npm run build

# /app/build will contain all build files

# Run Phase

# don't need to specify the stage name here
FROM nginx
# tells elasticbeanstalk to use map port 3000
EXPOSE 3000
# copy nginx configuration
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
# copy build files from build stage
COPY --from=builder /app/build /usr/share/nginx/html

# default command of nginx container will start nginx
# so no need to specify 