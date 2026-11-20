# Production image: builds the React PWA, bundles it into the Spring Boot jar,
# and runs the API and the app on one port (PORT, default 8080).

# 1) Frontend build
FROM node:22-alpine AS web
WORKDIR /web
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# 2) Backend build (includes the frontend build as static files)
FROM maven:3.9.11-eclipse-temurin-21 AS api
WORKDIR /api
COPY backend/pom.xml ./
RUN mvn -q -B dependency:go-offline
COPY backend/src ./src
COPY --from=web /web/dist ./src/main/resources/static
RUN mvn -q -B package -DskipTests && cp target/error-vault-backend-0.1.0-SNAPSHOT.jar /api/app.jar

# 3) Runtime
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=api /api/app.jar app.jar
ENV PORT=8080
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
