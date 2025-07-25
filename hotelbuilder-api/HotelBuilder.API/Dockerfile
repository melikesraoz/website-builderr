
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

COPY *.sln .
COPY HotelBuilder.API/*.csproj ./HotelBuilder.API/
RUN dotnet restore

COPY . .
WORKDIR /app/HotelBuilder.API
RUN dotnet publish -c Release -o out

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/HotelBuilder.API/out ./
ENTRYPOINT ["dotnet", "HotelBuilder.API.dll"]
