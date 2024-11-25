# NARCIS GeoServer

A containerized GeoServer setup for serving geospatial data.

## Prerequisites

- Docker
- Docker Compose

## Getting Started

1. Clone this repository
2. Place your geospatial data files in the `data` directory
3. Start GeoServer:

```bash
docker-compose up -d
```

4. Access GeoServer at http://localhost:8080/geoserver

Default credentials:
- Username: admin
- Password: geoserver

## Directory Structure

- `data/`: Store your geospatial data files here
- `config/`: GeoServer configuration files
- `Dockerfile`: Container definition for GeoServer
- `docker-compose.yml`: Docker Compose configuration

## Adding Data

1. Access the GeoServer web interface
2. Log in with the credentials above
3. Create a new workspace
4. Add your data as a new store
5. Publish layers

## Stopping the Server

```bash
docker-compose down
```
