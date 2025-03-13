
export class TextUp{
    constructor(data) {
        this.id = data.id
        this.text = data.text || 'w'
        this.#_animate()
    }
    #_animate(){
        const con = this.id
        const div = document.createElement('div')
        const textDiv = document.createElement('div')

        div.className = 'text-bubble'
        textDiv.className = 'text'

        textDiv.textContent = this.text
        div.appendChild(textDiv)
        con.appendChild(div)
        div.addEventListener('animationend',function (){
            con.removeChild(div)
        })
    }
}

export function throttle(func, delay) {
  let lastCall = 0;
  return function(...args) {
    const now = new Date().getTime();
    if (now - lastCall < delay) {
      return;
    }
    lastCall = now;
    return func.apply(this, args);
  }
}
