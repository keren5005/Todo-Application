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

    get id() {
        return this.id;
    }

    get title() {
        return this.title;
    }

    changeStatus(newStatus) {
        this.status = newStatus
    }

}