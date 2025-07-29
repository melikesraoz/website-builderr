# 1. Base image
FROM node:18

# 2. Çalışma dizini oluştur
WORKDIR /app

# 3. Paketleri kopyala
COPY package*.json ./

# 4. Bağımlılıkları yükle
RUN npm install

# 5. Tüm dosyaları kopyala
COPY . .

# 6. Uygulama hangi portta çalışacak?
EXPOSE 5000

# 7. Başlatma komutu
CMD ["node", "server.js"]
