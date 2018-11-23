window['$Hexagon'] = class $Hexagon {
    constructor(props) {
        this.$ = el => (document.getElementById(el))
        this.$class = el => (document.getElementsByClassName(el))
        this.data = {
            el: this.$(props.el),
            raf_arr: []
        }
        this.raf = requestAnimationFrame || mozRequestAnimationFrame || webkitRequestAnimationFrame || msRequestAnimationFrame
        this.clearRaf = cancelAnimationFrame
        this.init()
    }
    check() {
        if (!this.data.el) {
            console.error('[$Hexagon] 参数 - el: 解析异常')
            return false
        }
        if (this.data.el.height <= 0 || this.data.el.width <= 0) {
            console.error('[$Hexagon] 参数 - dom: height or width not == 0')
            return false
        }
        return true
    }
    init() {
        const IS = this.check()
        if (!IS) {
            return
        }
        const {
            el
        } = this.data
        this.data = {
            ...this.data,
            cxt: el.getContext('2d'),
            centerX: el.width / 2,
            centerY: el.height / 2,
            X: el.width,
            Y: el.height
        }
        this.drawDotAnimation()
    }
    drawDotAnimation () {
        const {
            cxt,
            centerX,
            centerY
        } = this.data
        cxt.strokeStyle = "#ffffff"
        cxt.lineWidth = 3
        cxt.lineCap = "round"
        cxt.moveTo(centerX - 20, centerY)
        cxt.lineTo(150, 50)
        cxt.lineTo(10, 50)
        cxt.stroke()
    }
    setInterval (fn) {
        let arr = this.data.raf_arr
        const len = arr.length
        arr[len] = {
            'for'() {},
            'animate': 0
        }
        arr[len].for = () => {
            fn()
            if (!arr[len]) {
                return
            }
            arr[len].animate = this.raf(arr[len].for)
        }
        arr[len].animate = this.raf(arr[len].for)
        return {
            index: len,
            obj: arr[len],
            arr: arr
        }
    }
    clearInterval (obj) {
        let arr = this.data.raf_arr
        if (!obj || !obj.arr) {
            return
        }
        this.clearRaf(obj.obj.animate)
        obj.obj.animate = obj.obj.for = null
        delete arr[obj.index]
    }
}