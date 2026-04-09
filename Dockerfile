
# ── Étape 1 : Compiler ────────────────────────────────────────────
FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app
COPY . .

RUN chmod +x mvnw
RUN ./mvnw clean package -DskipTests

# ── Étape 2 : Image finale ────────────────────────────────────────
FROM eclipse-temurin:17-jre-alpine

# ✅ Obligatoire sur Hugging Face — créer un user non-root
RUN addgroup -S spring && adduser -S spring -G spring
USER spring

WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# ✅ Port 7860 imposé par Hugging Face Spaces
EXPOSE 7860

ENTRYPOINT ["java", "-jar", "app.jar"]