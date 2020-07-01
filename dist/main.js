const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const Model = {
    data: {
        list: []
    },
    getData: () => new Promise((resolve, reject) => {
        const data = JSON.parse(window.localStorage.getItem('list') || '[]');
        Model.data.list = data;
        resolve(data);
    }),
    updateData: ({ id, value }) => new Promise((resolve, reject) => {
        const data = Model.data.list;
        const currentData = data.find(v => v.id === id);
        currentData && (currentData.value = value);
        window.localStorage.setItem('list', JSON.stringify(data));
        Model.data.list = data;
        resolve(data);
    }),
    saveData: (value) => new Promise((resolve, reject) => {
        var _a;
        const data = Model.data.list;
        const newData = [...data, { id: (((_a = data.slice(-1)[0]) === null || _a === void 0 ? void 0 : _a.id) || 0) + 1, value }];
        window.localStorage.setItem('list', JSON.stringify(newData));
        Model.data.list = newData;
        resolve(newData);
    }),
    deleteData: (id) => new Promise((resolve, reject) => {
        const data = Model.data.list;
        const newData = data.filter(v => v.id !== id);
        window.localStorage.setItem('list', JSON.stringify(newData));
        Model.data.list = newData;
        resolve(newData);
    }),
};
const View = {
    el: '#app',
    template: `
    <div data-id="{{id}}">
      <input disabled type="text" value="{{value}}">
      <button class="edit">编辑</button>
      <button class="update" style="display: none;">保存</button>
      <button class="delete">删除</button>
    </div>
  `,
    render: () => {
        $('.content').innerHTML = Model.data.list.map((item) => View.template.replace('{{value}}', item.value).replace('{{id}}', item.id.toString())).join('');
    },
};
const Controller = {
    init: () => {
        Model.getData().then(() => {
            View.render();
        });
        Controller.bindEvents();
    },
    events: [
        { type: 'click', selector: '.add', fnName: 'handleAdd' },
        { type: 'click', selector: '.delete', fnName: 'handleDelete' },
        { type: 'click', selector: '.edit', fnName: 'handleEdit' },
        { type: 'click', selector: '.update', fnName: 'handleUpdate' },
    ],
    bindEvents: () => {
        Controller.events.map((myEvent) => {
            $(View.el).addEventListener(myEvent.type, (event) => {
                const targetElement = event.target;
                if ($$(myEvent.selector).includes(targetElement)) {
                    Controller[myEvent.fnName](targetElement);
                }
            });
        });
    },
    handleAdd() {
        const inputElement = $('.input');
        const value = inputElement.value;
        if (value === '')
            return;
        Model.saveData(value).then(() => {
            inputElement.value = '';
            View.render();
        });
    },
    handleDelete(targetElement) {
        Model.deleteData(+targetElement.parentElement.getAttribute('data-id')).then(() => View.render());
    },
    handleEdit(targetElement) {
        const inputElement = targetElement.previousElementSibling;
        const saveElement = targetElement.nextElementSibling;
        inputElement.disabled = false;
        saveElement.style.display = 'inline-block';
        targetElement.style.display = 'none';
    },
    handleUpdate(targetElement) {
        const inputElement = targetElement.previousElementSibling.previousElementSibling;
        const editElement = targetElement.previousElementSibling;
        Model.updateData({
            id: +targetElement.parentElement.getAttribute('data-id'),
            value: inputElement.value
        }).then(() => {
            editElement.style.display = 'inline-block';
            View.render();
        });
    },
};
Controller.init();
