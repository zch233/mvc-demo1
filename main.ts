interface Data {
  id: number;
  value: string;
}
const $ =  (selector: string): Element => document.querySelector(selector)
const $$ = (selector: string): Element[] => [...document.querySelectorAll(selector)]

const Model: any = {
  data: {},
  getData: () => new Promise((resolve, reject) => {
    const data: Data[] = JSON.parse(window.localStorage.getItem('list') || '[]');
    Model.data.list = data
    resolve(data);
  }),
  updateData: ({id, value}: Data) => new Promise((resolve, reject) => {
    const data: Data[] = JSON.parse(window.localStorage.getItem('list') || '[]');
    const currentData = data.find(v => v.id === id)
    currentData.value = value
    window.localStorage.setItem('list', JSON.stringify(data))
    resolve(data)
  }),
  saveData: (value: string) => new Promise((resolve, reject) => {
    const data: Data[] = JSON.parse(window.localStorage.getItem('list') || '[]');
    const newData = [...data, {id: (data.slice(-1)[0]?.id || 0) + 1, value}]
    window.localStorage.setItem('list', JSON.stringify(newData))
    resolve(newData)
  }),
  deleteData: (id: number) => new Promise((resolve, reject) => {
    const data: Data[] = JSON.parse(window.localStorage.getItem('list') || '[]');
    const newData: Data[] = data.filter(v => v.id !== id)
    window.localStorage.setItem('list', JSON.stringify(newData))
    resolve(newData)
  }),
}

const View: any = {
  el: '#app',
  template: `
    <div data-id="{{id}}">
      <input disabled type="text" value="{{value}}">
      <button class="edit">编辑</button>
      <button class="update" style="display: none;">保存</button>
      <button class="delete">删除</button>
    </div>
  `,
  render: (data: Data[]) => {
    $('.content').innerHTML = data.map(v => View.template.replace('{{value}}', v.value).replace('{{id}}', v.id.toString())).join('')
  },
}

const Controller: any = {
  init: () => {
    Model.getData().then((data: Data[]) => View.render(data))
    Controller.bindEvents()
  },
  bindEvents: () => {
    const events = [
      {type: 'click', selector: '.add', fnName: 'addData'},
      {type: 'click', selector: '.delete', fnName: 'deleteData'},
      {type: 'click', selector: '.edit', fnName: 'editData'},
      {type: 'click', selector: '.update', fnName: 'updateData'},
    ]
    $(View.el).addEventListener('click', (e: Event) => {
      const targetElement = e.target as HTMLElement
      if ($$('.add').includes(targetElement)) {
        Controller.addData(targetElement)
      }
      if ($$('.delete').includes(targetElement)) {
        Controller.deleteData(targetElement)
      }
      if ($$('.edit').includes(targetElement)) {
        Controller.editData(targetElement)
      }
      if ($$('.update').includes(targetElement)) {
        Controller.updateData(targetElement)
      }
    })
  },
  addData (targetElement) {
    const inputElement = $('.input') as HTMLInputElement
    const value = inputElement.value
    if (value === '') return
    Model.saveData(value).then((data: Data[]) => {
      inputElement.value = ''
      View.render(data)
    })
  },
  deleteData (targetElement: HTMLElement) {
    Model.deleteData(+targetElement.parentElement.getAttribute('data-id')).then((data: Data[]) => View.render(data))
  },
  editData (targetElement: HTMLElement) {
    const inputElement = targetElement.previousElementSibling as HTMLInputElement
    const saveElement = targetElement.nextElementSibling as HTMLElement
    inputElement.disabled = false
    saveElement.style.display = 'inline-block'
    targetElement.style.display = 'none'
  },
  updateData (targetElement: HTMLElement) {
    const editElement = targetElement.previousElementSibling as HTMLElement
    Model.updateData({
      id: +targetElement.parentElement.getAttribute('data-id'),
      value: inputElement.value
    }).then((data: Data[]) => {
      editElement.style.display = 'inline-block'
      View.render(data)
    }),
  },
}
Controller.init()
