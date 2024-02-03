const mongoose = require('mongoose');
const pg = require('pg');
const format = require('pg-format');

const Statuses = {
	PENDING: Symbol("PENDING"),
	LATE: Symbol("LATE"),
	DONE: Symbol("DONE"),
}

class Todo {

    constructor(id,title,content,dueDate) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.dueDate = new Date(dueDate);
        this.status = Statuses.PENDING;
    }

    changeStatus(newStatus) {
        this.status = newStatus
    }
}

class TodosList {

    constructor(todos) {
        this._connect_mongo();
        this.pg_client = this._connect_psql();

        this._data = todos;
        this._deleted = [];
        this._data.forEach(todo => {
            if(todo.dueDate.getTime() < new Date().getTime()) {
                todo.status = Statuses.LATE;
            } else if(todo.dueDate.getTime() > new Date().getTime()) {
                todo.status = Statuses.PENDING;
            }
        });
        this.todos = new Set(todos ? [...todos] : []);
    }

    _connect_mongo() {
        mongoose.connect('mongodb://mongo:27017/todos');
    }

    async _connect_psql() {
        const client = new pg({
          host: 'postgres',
          port: 5432,
          database: 'todos',
          user: 'postgres',
          password: 'docker',
        })
        await client.connect();

        return client
    }

    search(id) {
        return [...this.todos].find(todo => todo.id === Number(id))
    }

    has(todo) {
        return this.todos.has(todo)
    }

    addTodo(todo) {
        // Mongo
        let mongo_todo = new TodoMongoModel({
            rawid: todo.id,
            title: todo.title,
            content: todo.content,
            duedate: todo.dueDate,
            status: todo.status,
        });

        mongo_todo
            .save()
            .then(_ => {

            }).catch(err => {

            });

        // Postgresql
        let values = [
            [todo.id, todo.title, todo.content, todo.duedate, todo.status], 
        ];
        this
            .pg_client
            .query(
                format('INSERT INTO todos (rawid, title, content, duedate, status) VALUES %L', values),[], 
                (err, result)=>{
                    console.log(err);
                    console.log(result);
                }
            );
        // this._data.push(todo)
    }

    delete(todo) {
        let i = this._data.indexOf(todo);
        this._deleted.push(todo)
        if (i > -1) { 
            this._data.splice(i, 1); 
        }
    }

    size() {
        return this.todos.size()
    }

}

const TodoMongoModel = mongoose.model(
    'todos',
    { 
        rawid: Number,
        title: String,
        content: String,
        duedate: Date,
        status: String
    }
);

module.exports = {
    Todo,
    Statuses,
    TodosList,
}