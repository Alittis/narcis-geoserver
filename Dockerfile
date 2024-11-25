# Use OpenJDK as the base image
FROM --platform=linux/arm64 eclipse-temurin:11-jre

# Environment variables
ENV GEOSERVER_VERSION=2.23.2
ENV GEOSERVER_HOME=/opt/geoserver
ENV GEOSERVER_DATA_DIR=/opt/geoserver/data_dir
ENV GEOSERVER_ADMIN_USER=admin
ENV GEOSERVER_ADMIN_PASSWORD=geoserver

# Install necessary tools
RUN apt-get update && apt-get install -y \
    wget \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Download and install GeoServer
RUN mkdir -p ${GEOSERVER_HOME} && \
    wget -q https://sourceforge.net/projects/geoserver/files/GeoServer/${GEOSERVER_VERSION}/geoserver-${GEOSERVER_VERSION}-bin.zip/download -O geoserver-${GEOSERVER_VERSION}-bin.zip && \
    unzip -q geoserver-${GEOSERVER_VERSION}-bin.zip -d /tmp && \
    mv /tmp/geoserver-${GEOSERVER_VERSION}/* ${GEOSERVER_HOME}/ && \
    rm geoserver-${GEOSERVER_VERSION}-bin.zip && \
    rm -rf /tmp/geoserver-${GEOSERVER_VERSION}

# Create data directory if it doesn't exist
RUN mkdir -p ${GEOSERVER_DATA_DIR}

# Set up data directory as a volume
VOLUME ["${GEOSERVER_DATA_DIR}"]

# Expose GeoServer's default port
EXPOSE 8080

# Set working directory
WORKDIR ${GEOSERVER_HOME}

# Make startup script executable
RUN chmod +x bin/startup.sh

# Start GeoServer
CMD ["./bin/startup.sh"]
