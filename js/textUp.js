
class TextUp{
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
