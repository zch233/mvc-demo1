const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const Model = {
    data: {},
    getData: () => new Promise((resolve, reject) => {
        const data = JSON.parse(window.localStorage.getItem('list') || '[]');
        Model.data.list = data;
        resolve(data);
    }),
    updateData: ({ id, value }) => new Promise((resolve, reject) => {
        const data = JSON.parse(window.localStorage.getItem('list') || '[]');
        const currentData = data.find(v => v.id === id);
        currentData.value = value;
        window.localStorage.setItem('list', JSON.stringify(data));
        resolve(data);
    }),
    saveData: (value) => new Promise((resolve, reject) => {
        var _a;
        const data = JSON.parse(window.localStorage.getItem('list') || '[]');
        const newData = [...data, { id: (((_a = data.slice(-1)[0]) === null || _a === void 0 ? void 0 : _a.id) || 0) + 1, value }];
        window.localStorage.setItem('list', JSON.stringify(newData));
        resolve(newData);
    }),
    deleteData: (id) => new Promise((resolve, reject) => {
        const data = JSON.parse(window.localStorage.getItem('list') || '[]');
        const newData = data.filter(v => v.id !== id);
        window.localStorage.setItem('list', JSON.stringify(newData));
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
    render: (data) => {
        $('.content').innerHTML = data.map(v => View.template.replace('{{value}}', v.value).replace('{{id}}', v.id.toString())).join('');
    },
};
const Controller = {
    init: () => {
        Model.getData().then((data) => View.render(data));
        Controller.bindEvents();
    },
    bindEvents: () => {
        const events = [
            { type: 'click', selector: '.add', fnName: 'addData' },
            { type: 'click', selector: '.delete', fnName: 'deleteData' },
            { type: 'click', selector: '.edit', fnName: 'editData' },
            { type: 'click', selector: '.update', fnName: 'updateData' },
        ];
        $(View.el).addEventListener('click', (e) => {
            const targetElement = e.target;
            if ($$('.add').includes(targetElement)) {
                Controller.addData(targetElement);
            }
            if ($$('.delete').includes(targetElement)) {
                Controller.deleteData(targetElement);
            }
            if ($$('.edit').includes(targetElement)) {
                Controller.editData(targetElement);
            }
            if ($$('.update').includes(targetElement)) {
                Controller.updateData(targetElement);
            }
        });
    },
    addData(targetElement) {
        const inputElement = $('.input');
        const value = inputElement.value;
        if (value === '')
            return;
        Model.saveData(value).then((data) => {
            inputElement.value = '';
            View.render(data);
        });
    },
    deleteData(targetElement) {
        Model.deleteData(+targetElement.parentElement.getAttribute('data-id')).then((data) => View.render(data));
    },
    editData(targetElement) {
        const inputElement = targetElement.previousElementSibling;
        const saveElement = targetElement.nextElementSibling;
        inputElement.disabled = false;
        saveElement.style.display = 'inline-block';
        targetElement.style.display = 'none';
    },
    updateData(targetElement) {
        const editElement = targetElement.previousElementSibling;
        Model.updateData({
            id: +targetElement.parentElement.getAttribute('data-id'),
            value: inputElement.value
        }).then((data) => {
            editElement.style.display = 'inline-block';
            View.render(data);
        }),
        ;
    },
};
Controller.init();
