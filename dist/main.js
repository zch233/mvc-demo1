const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
class Model {
    constructor() {
        this.getData = () => new Promise((resolve, reject) => {
            const data = JSON.parse(window.localStorage.getItem('list') || '[]');
            this.data = data;
            resolve(data);
        });
        this.updateData = ({ id, value }) => new Promise((resolve, reject) => {
            const data = this.data;
            const currentData = data.find(v => v.id === id);
            currentData && (currentData.value = value);
            window.localStorage.setItem('list', JSON.stringify(data));
            this.data = data;
            resolve(data);
        });
        this.saveData = (value) => new Promise((resolve, reject) => {
            var _a;
            const data = this.data;
            const newData = [...data, { id: (((_a = data.slice(-1)[0]) === null || _a === void 0 ? void 0 : _a.id) || 0) + 1, value }];
            window.localStorage.setItem('list', JSON.stringify(newData));
            this.data = newData;
            resolve(newData);
        });
        this.deleteData = (id) => new Promise((resolve, reject) => {
            const data = this.data;
            const newData = data.filter(v => v.id !== id);
            window.localStorage.setItem('list', JSON.stringify(newData));
            this.data = newData;
            resolve(newData);
        });
    }
}
class View {
    constructor() {
        this.el = '#app';
        this.template = `
    <div data-id="{{id}}">
      <input disabled type="text" value="{{value}}">
      <button class="edit">编辑</button>
      <button class="update" style="display: none;">保存</button>
      <button class="delete">删除</button>
    </div>
  `;
        this.render = (data) => {
            $('.content').innerHTML = data.map((item) => this.template.replace('{{value}}', item.value).replace('{{id}}', item.id.toString())).join('');
        };
    }
}
class Controller {
    constructor({ view, model }) {
        this.init = () => {
            this.model.getData().then(() => {
                this.view.render(this.model.data);
            });
            this.bindEvents();
        };
        this.events = [
            { type: 'click', selector: '.add', fnName: 'handleAdd' },
            { type: 'click', selector: '.delete', fnName: 'handleDelete' },
            { type: 'click', selector: '.edit', fnName: 'handleEdit' },
            { type: 'click', selector: '.update', fnName: 'handleUpdate' },
        ];
        this.bindEvents = () => {
            this.events.map((myEvent) => {
                $(this.view.el).addEventListener(myEvent.type, (event) => {
                    const targetElement = event.target;
                    if ($$(myEvent.selector).includes(targetElement)) {
                        // @ts-ignore
                        this[myEvent.fnName](targetElement);
                    }
                });
            });
        };
        this.handleAdd = () => {
            const inputElement = $('.input');
            const value = inputElement.value;
            if (value === '')
                return;
            this.model.saveData(value).then(() => {
                inputElement.value = '';
                this.view.render(this.model.data);
            });
        };
        this.handleDelete = (targetElement) => {
            this.model.deleteData(+targetElement.parentElement.getAttribute('data-id')).then(() => this.view.render(this.model.data));
        };
        this.handleEdit = (targetElement) => {
            const inputElement = targetElement.previousElementSibling;
            const saveElement = targetElement.nextElementSibling;
            inputElement.disabled = false;
            saveElement.style.display = 'inline-block';
            targetElement.style.display = 'none';
        };
        this.handleUpdate = (targetElement) => {
            const inputElement = targetElement.previousElementSibling.previousElementSibling;
            const editElement = targetElement.previousElementSibling;
            this.model.updateData({
                id: +targetElement.parentElement.getAttribute('data-id'),
                value: inputElement.value
            }).then(() => {
                editElement.style.display = 'inline-block';
                this.view.render(this.model.data);
            });
        };
        this.view = view;
        this.model = model;
        this.init();
    }
}
new Controller({
    view: new View(),
    model: new Model()
});
