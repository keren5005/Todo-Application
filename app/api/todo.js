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

    search(id) {
        return [...this.todos].find(todo => todo.id === Number(id))
    }

    has(todo) {
        return this.todos.has(todo)
    }

    addTodo(todo) {
        this._data.push(todo)
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

module.exports = {
    Todo,
    Statuses,
    TodosList
}