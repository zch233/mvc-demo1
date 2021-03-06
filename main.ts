interface Data {
  id: number;
  value: string;
}
interface MyEvent {
  type: string;
  selector: string;
  fnName: string;
}

const $ = (selector: string): Element => document.querySelector(selector)
const $$ = (selector: string): Element[] => [...document.querySelectorAll(selector)]

class Model {
  data: Data[]
  getData = () => new Promise((resolve, reject) => {
    const data: Data[] = JSON.parse(window.localStorage.getItem('list') || '[]');
    this.data = data
    resolve(data);
  })
  updateData = ({id, value}: Data) => new Promise((resolve, reject) => {
    const data: Data[] = this.data
    const currentData = data.find(v => v.id === id)
    currentData && (currentData.value = value)
    window.localStorage.setItem('list', JSON.stringify(data))
    this.data = data
    resolve(data)
  })
  saveData = (value: string) => new Promise((resolve, reject) => {
    const data: Data[] = this.data
    const newData = [...data, {id: (data.slice(-1)[0]?.id || 0) + 1, value}]
    window.localStorage.setItem('list', JSON.stringify(newData))
    this.data = newData
    resolve(newData)
  })
  deleteData = (id: number) => new Promise((resolve, reject) => {
    const data: Data[] = this.data
    const newData: Data[] = data.filter(v => v.id !== id)
    window.localStorage.setItem('list', JSON.stringify(newData))
    this.data = newData
    resolve(newData)
  })
  constructor ({data}:any) {
    this.data = data
  }
}

class View {
  el: string
  template:string
  render = (data: Data[]) => {
    $('.content').innerHTML = data.map((item: Data) => {
      let html = this.template
      // @ts-ignore
      Object.keys(item).map(key => (html = html.replace(`{{${key}}}`, item[key])))
      return html
    }).join('')
  }

  constructor ({el, template}: any) {
    this.el = el
    this.template = template
  }
}

class Controller {
  view: any
  model: any
  constructor ({view, model}: any) {
    this.view = view
    this.model = model
    this.init()
  }
  init = () => {
    this.model.getData().then(() => {
      this.view.render(this.model.data)
    })
    this.bindEvents()
  }
  events: MyEvent[] = [
    {type: 'click', selector: '.add', fnName: 'handleAdd'},
    {type: 'click', selector: '.delete', fnName: 'handleDelete'},
    {type: 'click', selector: '.edit', fnName: 'handleEdit'},
    {type: 'click', selector: '.update', fnName: 'handleUpdate'},
  ]
  bindEvents = (): void => {
    this.events.map((myEvent: MyEvent) => {
      $(this.view.el).addEventListener(myEvent.type, (event: Event) => {
        const targetElement = event.target as HTMLElement
        if ($$(myEvent.selector).includes(targetElement)) {
          const fnName = myEvent.fnName
          // @ts-ignore
          this[fnName] && this[fnName](targetElement)
        }
      })
    })
  }
  handleAdd = (targetElement: HTMLElement): void => {
    const inputElement = $('.input') as HTMLInputElement
    const value = inputElement.value
    if (value === '') return
    this.model.saveData(value).then(() => {
      inputElement.value = ''
      this.view.render(this.model.data)
    })
  }
  handleDelete = (targetElement: HTMLElement): void => {
    this.model.deleteData(+targetElement.parentElement.getAttribute('data-id')).then(() => this.view.render(this.model.data))
  }
  handleEdit = (targetElement: HTMLElement) => {
    const inputElement = targetElement.previousElementSibling as HTMLInputElement
    const saveElement = targetElement.nextElementSibling as HTMLElement
    inputElement.disabled = false
    saveElement.style.display = 'inline-block'
    targetElement.style.display = 'none'
  }
  handleUpdate = (targetElement: HTMLElement): void => {
    const inputElement = targetElement.previousElementSibling.previousElementSibling as HTMLInputElement
    const editElement = targetElement.previousElementSibling as HTMLElement
    this.model.updateData({
      id: +targetElement.parentElement.getAttribute('data-id'),
      value: inputElement.value
    }).then(() => {
      editElement.style.display = 'inline-block'
      this.view.render(this.model.data)
    })
  }
}
new Controller({
  view: new View({
    el: '#app',
    template: `
      <div data-id="{{id}}">
        <input disabled type="text" value="{{value}}">
        <button class="edit">编辑</button>
        <button class="update" style="display: none;">保存</button>
        <button class="delete">删除</button>
      </div>
    `
  }),
  model: new Model({
    data: []
  })
})
