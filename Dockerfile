FROM node:12-slim
WORKDIR /usr/src/app
COPY package*.json ./
COPY . ./
SHELL ["/bin/bash", "-c"]
RUN apt-get update && apt-get install -y \
    curl \
    bash \
  && npm install \
  && npm -v \
  && npm install -g
# ENV DB_SSL_KEY=secret:mad-chef-141/ssl-key-dev-client-key
# ENV DB_SSL_CA=secret:projects/240998304781/secrets/ssl-key-dev-server-ca
# ENV DB_SSL_CERT=secret:projects/240998304781/secrets/ssl-key-dev-client-cert
# ENV PATH $PATH:/root/google-cloud-sdk/bin
# RUN gcloud secrets versions access latest --secret=sa-key-dev --project=mad-chef-141
#RUN chmod +x ./startup.sh \
  #&& echo $GCLOUD_SERVICE_KEY > ./gcloud-api-key.json \
  #&& cat ./gcloud-api-key.json \
  #&& gcloud auth activate-service-account --key-file=./gcloud-api-key.json 
 # && ./startup.sh \
  
CMD ["npm", "start"]

