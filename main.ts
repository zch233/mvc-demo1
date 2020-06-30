interface Data {
  id: number;
  value: string;
}
const getData = () => new Promise((resolve, reject) => {
  const data:Data[] = JSON.parse(window.localStorage.getItem('list') || '[]');
  resolve(data);
})

const updateData = ({id, value}: Data) => new Promise((resolve, reject) => {
  const data:Data[] = JSON.parse(window.localStorage.getItem('list') || '[]');
  const currentData = data.find(v => v.id === id)
  currentData.value = value
  window.localStorage.setItem('list', JSON.stringify(data))
  resolve(data)
})

const saveData = (value: string) => new Promise((resolve, reject) => {
  const data:Data[] = JSON.parse(window.localStorage.getItem('list') || '[]');
  const newData:Data = {id: (data.slice(-1)[0]?.id || 0) + 1, value}
  const news = [...data, newData]
  window.localStorage.setItem('list', JSON.stringify(news))
  resolve(news)
})

const deleteData = (id: number) => new Promise((resolve, reject) => {
  const data:Data[] = JSON.parse(window.localStorage.getItem('list') || '[]');
  const newData: Data[] = data.filter(v => v.id !== id)
  window.localStorage.setItem('list', JSON.stringify(newData))
  resolve(newData)
})

const template = `
  <div data-id="{{id}}">
    <input disabled type="text" value="{{value}}">
    <button class="delete">删除</button>
  </div>
`
const render = (data: Data[]) => {
  $('.content').innerHTML = data.map(v => template.replace('{{value}}', v.value).replace('{{id}}', v.id.toString())).join('')
}

const $: (selector: string) => Element = selector => document.querySelector(selector)
const $$: (selector: string) => Element[] = selector => [...document.querySelectorAll(selector)]

getData().then((data: Data[]) => render(data))

$('#app').addEventListener('click', (e) => {
  const targetElement: EventTarget = e.target

  if ($$('.add').includes(<Element>targetElement)) {
    const inputElement = $('.input')
    const value = inputElement.value
    if (value === '') return
    saveData(value).then((data: Data[]) => {
      inputElement.value = ''
      render(data)
    })
  }
  if ($$('.delete').includes(<Element>targetElement)) {
    deleteData(+(<Element>targetElement).parentElement.getAttribute('data-id')).then((data: Data[]) => render(data))
  }
})
