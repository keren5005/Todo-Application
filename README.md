# Todo App
Built with nodeJS this is a modern "Todo Application".

## Usage

Fork the repository with github
```sh
git clone https://github.com/MadBull1995/keren-todo-app.git
```

## Development
Run the development server with `nodemon`

```sh
npm run dev
```

## Docker
This app can be shipped via docker.

The `Dockerfile` placed on root directory holds the image build configurations, to build the image run:
```sh
docker build -t keren-todo-app .
```

Then you can run the image:
```sh
docker run --name keren-todo-app -d -p 3769:9285 keren-todo-app
```

## Deploy
Run the server in production

```sh
npm start
```

