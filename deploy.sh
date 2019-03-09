# build all docker images
docker build -t dgoncharov/multi-client:latest -t dgoncharov/multi-client:$SHA -f ./client/Dockerfile ./client
docker build -t dgoncharov/multi-server:latest -t dgoncharov/multi-server:$SHA -f ./server/Dockerfile ./server
docker build -t dgoncharov/multi-worker:latest -t dgoncharov/multi-worker:$SHA -f ./worker/Dockerfile ./worker
# push to dockerhub
docker push dgoncharov/multi-client:latest
docker push dgoncharov/multi-client:$SHA
docker push dgoncharov/multi-server:latest
docker push dgoncharov/multi-server:$SHA
docker push dgoncharov/multi-worker:latest
docker push dgoncharov/multi-worker:$SHA
# apply k8s config
kubectl apply -f k8s
kubectl set image deployments/client-deployment client=dgoncharov/multi-client:$SHA
kubectl set image deployments/server-deployment server=dgoncharov/multi-server:$SHA
kubectl set image deployments/worker-deployment worker=dgoncharov/multi-worker:$SHA