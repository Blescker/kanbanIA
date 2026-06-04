# Imagen base
FROM node:22-alpine

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos necesarios
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del proyecto
COPY . .

# Exponer el puerto
EXPOSE 5000

# Comando para ejecutar
CMD ["npm", "run", "dev"]
