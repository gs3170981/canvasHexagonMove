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
            Y: el.height,
            line_l: 20, // 直线长度
            angle: '60', // 角度
            pos: { // 角度
                '60': {
                    sin: Math.sqrt(3) / 2,
                    cos: 0.5
                }
            },
            avg: 10, // now到next的执行次数
            coor: { // 方向 - 坐标系四域
                '1': e => ({ x: e.x + e.xl, y: e.y - e.yl, next: ['2', '1-4-x'] }),
                '2': e => ({ x: e.x - e.xl, y: e.y - e.yl, next: ['1', '2-3-x'] }),
                '3': e => ({ x: e.x - e.xl, y: e.y + e.yl, next: ['2-3-x', '4'] }),
                '4': e => ({ x: e.x + e.xl, y: e.y + e.yl, next: ['1-4-x', '3'] }),
                '1-4-x': e => ({ x: e.x + e.l, y: e.y, next: ['1', '4'] }),
                '2-3-x': e => ({ x: e.x - e.l, y: e.y, next: ['2', '3'] })
            }
        }
        this.animation()
    }
    getEndXY ({x, y, next = ['1-4-x', '2-3-x']}) { // 求目标坐标
        const {
            pos,
            coor,
            angle,
            line_l
        } = this.data
        return coor[next[parseInt(Math.random() * 2)]]({
            x: x,
            xl: line_l * pos[angle].cos,
            y: y,
            yl: line_l * pos[angle].sin,
            l: line_l
        })
    }
    getAvg (now, next) { // 计算等份
        const {
            avg
        } = this.data
        let pos = {
            x: (next.x - now.x) / avg,
            y: (next.y - now.y) / avg
        }
        let arr = []
        arr.push({
            i: 0,
            ...now
        })
        for (let i = 0; i < avg - 1; i++) {
            arr.push({
                i: i + 1,
                x: now.x + pos.x * (i + 1),
                y: now.y + pos.y * (i + 1)
            })
        }
        arr.push({
            i: avg - 1,
            ...next
        })
        return arr
    }
    drawLine (e) { // 画线
        const {
            cxt
        } = this.data
        const {
            now,
            next
        } = e
        let color = '#ffffff'
        let line_w = 3
        let line_c = 'round' // 直线圆润

        cxt.strokeStyle = color
        cxt.lineWidth = line_w
        cxt.lineCap = line_c
        cxt.moveTo(now.x, now.y) // 起始
        cxt.lineTo(next.x, next.y)
        cxt.stroke()
    }
    animation () { // 动画
        const {
            centerX,
            centerY,
            avg,
            line_l
        } = this.data
        let now = {
            x: centerX - line_l * 2,
            y: centerY
        }
        let next = this.getEndXY(now) // 取得next坐标
        let avg_arr = this.getAvg(now, next) // 取得次数
        let i = 0
        // let raf = this.setInterval(() => {
        //     this.drawLine({
        //         now: now,
        //         next: avg_arr[i]
        //     })
        //     if (avg_arr[i].i === avg -1) {
        //         this.clearInterval(raf)
        //     }
        //     i++
        // })
        let fn = () => {
            this.drawLine({
                now: now,
                next: avg_arr[i]
            })
            if (avg_arr[i].i !== avg - 1) {
                window.requestAnimationFrame(fn)
            }
            i++
        }
        window.requestAnimationFrame(fn)
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