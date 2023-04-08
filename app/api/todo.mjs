export const Statuses = {
	PENDING: Symbol("PENDING"),
	LATE: Symbol("LATE"),
	DONE: Symbol("DONE"),
}

export class Todo {

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

export class TodosList {

    constructor(todos) {
        this.todos = new Set(todos ? [...todos] : []);
    }

    search(id) {
        return [...this.todos].find(todo => todo.id === Number(id))
    }

    has(todo) {
        return this.todos.has(todo)
    }

    addTodo(todo) {
        this.todos.add(todo)
    }

    delete(todo) {
        this.todos.delete(todo)
    }

    size() {
        return this.todos.size()
    }

}
