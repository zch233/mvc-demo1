interface Data {
  id: number;
  value: string;
}

const $ = (selector: string): Element => document.querySelector(selector)
const $$ = (selector: string): Element[] => [...document.querySelectorAll(selector)]

const Model: any = {
  data: {
    list: []
  },
  getData: () => new Promise((resolve, reject) => {
    const data: Data[] = JSON.parse(window.localStorage.getItem('list') || '[]');
    Model.data.list = data
    resolve(data);
  }),
  updateData: ({id, value}: Data) => new Promise((resolve, reject) => {
    const data: Data[] = Model.data.list
    const currentData = data.find(v => v.id === id)
    currentData && (currentData.value = value)
    window.localStorage.setItem('list', JSON.stringify(data))
    Model.data.list = data
    resolve(data)
  }),
  saveData: (value: string) => new Promise((resolve, reject) => {
    const data: Data[] = Model.data.list
    const newData = [...data, {id: (data.slice(-1)[0]?.id || 0) + 1, value}]
    window.localStorage.setItem('list', JSON.stringify(newData))
    Model.data.list = newData
    resolve(newData)
  }),
  deleteData: (id: number) => new Promise((resolve, reject) => {
    const data: Data[] = Model.data.list
    const newData: Data[] = data.filter(v => v.id !== id)
    window.localStorage.setItem('list', JSON.stringify(newData))
    Model.data.list = newData
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
  render: () => {
    $('.content').innerHTML = Model.data.list.map((item: Data) => View.template.replace('{{value}}', item.value).replace('{{id}}', item.id.toString())).join('')
  },
}

interface MyEvent {
  type: string;
  selector: string;
  fnName: string;
}

const Controller: any = {
  init: () => {
    Model.getData().then(() => {
      View.render()
    })
    Controller.bindEvents()
  },
  events: [
    {type: 'click', selector: '.add', fnName: 'handleAdd'},
    {type: 'click', selector: '.delete', fnName: 'handleDelete'},
    {type: 'click', selector: '.edit', fnName: 'handleEdit'},
    {type: 'click', selector: '.update', fnName: 'handleUpdate'},
  ],
  bindEvents: () => {
    Controller.events.map((myEvent: MyEvent) => {
      $(View.el).addEventListener(myEvent.type, (event: Event) => {
        const targetElement = event.target as HTMLElement
        if ($$(myEvent.selector).includes(targetElement)) {
          Controller[myEvent.fnName](targetElement)
        }
      })
    })
  },
  handleAdd () {
    const inputElement = $('.input') as HTMLInputElement
    const value = inputElement.value
    if (value === '') return
    Model.saveData(value).then(() => {
      inputElement.value = ''
      View.render()
    })
  },
  handleDelete (targetElement: HTMLElement) {
    Model.deleteData(+targetElement.parentElement.getAttribute('data-id')).then(() => View.render())
  },
  handleEdit (targetElement: HTMLElement) {
    const inputElement = targetElement.previousElementSibling as HTMLInputElement
    const saveElement = targetElement.nextElementSibling as HTMLElement
    inputElement.disabled = false
    saveElement.style.display = 'inline-block'
    targetElement.style.display = 'none'
  },
  handleUpdate (targetElement: HTMLElement) {
    const inputElement = targetElement.previousElementSibling.previousElementSibling as HTMLInputElement
    const editElement = targetElement.previousElementSibling as HTMLElement
    Model.updateData({
      id: +targetElement.parentElement.getAttribute('data-id'),
      value: inputElement.value
    }).then(() => {
      editElement.style.display = 'inline-block'
      View.render()
    })
  },
}
Controller.init()
