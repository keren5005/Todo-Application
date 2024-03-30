# Todo Application

Built with Node.js, this is a modern Todo Application.

## Usage

Run the development server with `nodemon`:

```sh
npm run dev

Docker
You can also deploy this app via Docker. The Dockerfile placed in the root directory contains the necessary configurations. To build the Docker image:

Copy code
docker build -t keren-todo-app .
Then, run the Docker container:

docker run --name keren-todo-app -d -p 3769:9285 keren-todo-app

Deploy
For production deployment, run the server:

Copy code
npm start

About
This Todo Application simplifies task management with its intuitive interface and efficient features.

