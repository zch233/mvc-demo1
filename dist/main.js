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
      <button class="save" style="display: none;">保存</button>
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
    bindEvents: () => $(View.el).addEventListener('click', (e) => {
        const targetElement = e.target;
        if ($$('.add').includes(targetElement)) {
            const inputElement = $('.input');
            const value = inputElement.value;
            if (value === '')
                return;
            Model.saveData(value).then((data) => {
                inputElement.value = '';
                View.render(data);
            });
        }
        if ($$('.delete').includes(targetElement)) {
            Model.deleteData(+targetElement.parentElement.getAttribute('data-id')).then((data) => View.render(data));
        }
        if ($$('.edit').includes(targetElement)) {
            const inputElement = targetElement.previousElementSibling;
            const saveElement = targetElement.nextElementSibling;
            inputElement.disabled = false;
            saveElement.style.display = 'inline-block';
            targetElement.style.display = 'none';
        }
        if ($$('.save').includes(targetElement)) {
            const inputElement = targetElement.previousElementSibling.previousElementSibling;
            const editElement = targetElement.previousElementSibling;
            Model.updateData({
                id: +targetElement.parentElement.getAttribute('data-id'),
                value: inputElement.value
            }).then((data) => {
                editElement.style.display = 'inline-block';
                View.render(data);
            });
        }
    })
};
Controller.init();
// const getData = () => new Promise((resolve, reject) => {
//   const data: Data[] = JSON.parse(window.localStorage.getItem('list') || '[]');
//   resolve(data);
// })
//
// const updateData = ({id, value}: Data) => new Promise((resolve, reject) => {
//   const data: Data[] = JSON.parse(window.localStorage.getItem('list') || '[]');
//   const currentData = data.find(v => v.id === id)
//   currentData.value = value
//   window.localStorage.setItem('list', JSON.stringify(data))
//   resolve(data)
// })
//
// const saveData = (value: string) => new Promise((resolve, reject) => {
//   const data: Data[] = JSON.parse(window.localStorage.getItem('list') || '[]');
//   const newData = [...data, {id: (data.slice(-1)[0]?.id || 0) + 1, value}]
//   window.localStorage.setItem('list', JSON.stringify(newData))
//   resolve(newData)
// })
//
// const deleteData = (id: number) => new Promise((resolve, reject) => {
//   const data: Data[] = JSON.parse(window.localStorage.getItem('list') || '[]');
//   const newData: Data[] = data.filter(v => v.id !== id)
//   window.localStorage.setItem('list', JSON.stringify(newData))
//   resolve(newData)
// })
// const template = `
//   <div data-id="{{id}}">
//     <input disabled type="text" value="{{value}}">
//     <button class="edit">编辑</button>
//     <button class="save" style="display: none;">保存</button>
//     <button class="delete">删除</button>
//   </div>
// `
// const render = (data: Data[]) => {
//   $('.content').innerHTML = data.map(v => template.replace('{{value}}', v.value).replace('{{id}}', v.id.toString())).join('')
// }
//
// const $: (selector: string) => Element = selector => document.querySelector(selector)
//
// const $$: (selector: string) => Element[] = selector => [...document.querySelectorAll(selector)]
//
// getData().then((data: Data[]) => render(data))
//
// $('#app').addEventListener('click', (e) => {
//   const targetElement = e.target as HTMLElement
//
//   if ($$('.add').includes(targetElement)) {
//     const inputElement = $('.input') as HTMLInputElement
//     const value = inputElement.value
//     if (value === '') return
//     saveData(value).then((data: Data[]) => {
//       inputElement.value = ''
//       render(data)
//     })
//   }
//   if ($$('.delete').includes(targetElement)) {
//     deleteData(+targetElement.parentElement.getAttribute('data-id')).then((data: Data[]) => render(data))
//   }
//
//   if ($$('.edit').includes(targetElement)) {
//     const inputElement = targetElement.previousElementSibling as HTMLInputElement
//     const saveElement = targetElement.nextElementSibling as HTMLElement
//     inputElement.disabled = false
//     saveElement.style.display = 'inline-block'
//     targetElement.style.display = 'none'
//   }
//
//   if ($$('.save').includes(targetElement)) {
//     const inputElement = targetElement.previousElementSibling.previousElementSibling as HTMLInputElement
//     const editElement = targetElement.previousElementSibling as HTMLElement
//     updateData({
//       id: +targetElement.parentElement.getAttribute('data-id'),
//       value: inputElement.value
//     }).then((data: Data[]) => {
//       editElement.style.display = 'inline-block'
//       render(data)
//     })
//   }
// })
