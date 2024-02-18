const mongoose = require('mongoose');
const pg = require('pg').Client;
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

    time() {
        return this.dueDate.getTime();
    }

    state() {
        return this.status === Statuses.DONE ? "DONE" : this.status === Statuses.PENDING ? "PENDING" : this.status === Statuses.LATE ? "LATE" : "UNKNOWN";
    }
}

class TodosList {

    constructor(todos) {
        this._connect_mongo().then(res => {
            console.log(res);
        }).catch(err => {
            console.log(`failed to connect mongo: ${err}`);
        });
        this._connect_psql().then(res => {
            this.pg_client = res
        }).catch(err => {
            console.log(`failed to connect postgresql: ${err}`)
        });

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

    async _connect_mongo() {
        await mongoose.connect('mongodb://mongo:27017/todos');
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
        return client;
    }

    async list(persistenceMethod, status) {
        let data = [];
        if (persistenceMethod === "POSTGRES") {
            let res = await this.pg_client.query(
                status === "ALL" ?
                format("SELECT * FROM %I", 'todos') :
                format("SELECT * FROM %I WHERE state = %L", 'todos', status)
            );
            data = res.rows;
        } else if(persistenceMethod === "MONGO") {
            let query = status === "ALL" ? {} : { status: status };
            let res = await TodoMongoModel.find(query).exec();
            data = res.map(doc => doc.toObject());
        } else {
            throw Error(`not a valid persistence method ${persistenceMethod}`)
        }
        return data
    }

    async _updatePg(id, status) {
        await this.pg_client.query(format("UPDATE %I SET state = %L WHERE rawid = %L", 'todos', status, Number(id)));
    }

    async _updateMongo(id, status) {
        await TodoMongoModel.updateOne({ rawid: id }, { $set: { state: status } });
    }

    async updateTodo(id, status) {
        await this._updatePg(id, status)
        await this._updateMongo(id, status)
    }

    async get(id) {
        let todo = null;
        let todoResult = await this.pg_client.query(format("SELECT * FROM %I WHERE rawid = %L", 'todos', Number(id)));
        if (todoResult.rows.length === 1) {
            todo = todoResult.rows[0]
        }
        return todo;
    }

    async _addMongo(todo) {
        let mongo_todo = new TodoMongoModel({
            rawid: todo.id,
            title: todo.title,
            content: todo.content,
            duedate: todo.time(),
            status: todo.state(),
        });

        await mongo_todo.save();
    }

    async _addPg(todo) {
        let values = [
            [todo.id, todo.title, todo.content, todo.time(), todo.state()], 
        ];
        await this
            .pg_client
            .query(format('INSERT INTO %I (rawid, title, content, duedate, state) VALUES %L', 'todos', values),[]);
    }

    async addTodo(todo) {
        // Mongo
        await this._addMongo(todo);

        // Postgresql
        await this._addPg(todo);
    }

    async _deleteMongo(todo) {
        await TodoMongoModel.deleteOne({ rawid: todo.rawid })
    }

    async _deletePg(todo) {
        await this.pg_client.query(format('DELETE FROM %I WHERE rawid = %L', 'todos', todo.rawid))
    }

    async delete(todo) {
        await this._deleteMongo(todo);
        await this._deletePg(todo);
    }

    async size(persistanceMethod, state) {
        let size = 0;
        if (persistanceMethod === "MONGO") {
            let query = state === "ALL" ? {} : { status: state };
            size = await TodoMongoModel.countDocuments(query);
        } else if (persistanceMethod === "POSTGRES") {
            if (state !== "ALL") {
                let result = await this.pg_client.query(format("SELECT count(*) FROM %I WHERE state = %L", 'todos', state))
                size = result.rows[0].count
            } else {
                let result = await this.pg_client.query(format("SELECT count(*) FROM %I", 'todos'))
                size = result.rows[0].count
            }
        }
        return Number(size)
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