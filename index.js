window['$Hexagon'] = class $Hexagon {
    constructor(props) {
        this.$ = el => (document.getElementById(el))
        this.$class = el => (document.getElementsByClassName(el))
        this.data = {
            el: this.$(props.el)
        }
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
            num: 20, // 单条线一共走的遍数
            avg: 12, // now到next的执行次数
            line_l: 20, // 直线长度
            line_w: 1, // 直线粗细
            angle: '60', // 角度
            line_c: 'round', // 直线更圆润
            pos: { // 角度
                '60': {
                    sin: Math.sqrt(3) / 2,
                    cos: 0.5
                }
            },
            coor: { // 方向 - 坐标系四域
                '1': e => ({ x: e.x + e.xl, y: e.y - e.yl, next: ['2', '1-4-x'] }),
                '2': e => ({ x: e.x - e.xl, y: e.y - e.yl, next: ['1', '2-3-x'] }),
                '3': e => ({ x: e.x - e.xl, y: e.y + e.yl, next: ['2-3-x', '4'] }),
                '4': e => ({ x: e.x + e.xl, y: e.y + e.yl, next: ['1-4-x', '3'] }),
                '1-4-x': e => ({ x: e.x + e.l, y: e.y, next: ['1', '4'] }),
                '2-3-x': e => ({ x: e.x - e.l, y: e.y, next: ['2', '3'] })
            },
            color: { // 循环渐变的颜色自定义
                'green-purple': { s: 'rgba(30, 242, 40, 1)', e: 'rgba(30, 53, 242, 1)' },
                // 'purple-green': { s: 'rgba(30, 53, 242, 1)', e: 'black', next: '' }
            }
        }
        // setInterval(() => {
            this.animation()
        // }, 1000)
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
        let arr = [{
            i: 0,
            ...now
        }]
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
    getColorAvg (key) { // 计算渐变
        const {
            color,
            avg
        } = this.data
        const s = color[key].s
        const e = color[key].e
        const arrF = (str) => (str.replace('rgba(', '')
        .replace('rgb(', '')
        .replace(')', '')
        .split(','))
        let s_arr = arrF(s)
        let e_arr = arrF(e)
        // 平均加的次数
        const se_avg = s_arr.map((t, i) => (t === e_arr[i] ? 0 : (e_arr[i] - t) / avg))
        let arr = [{
            i: 0,
            val: `rgba(${s_arr})`
        }]
        for (let i = 0; i < avg - 1; i++) {
            arr.push({
                i: i + 1,
                val: `rgba(${s_arr.map((item, j) => (+item + (+se_avg[j]) * (i + 1)))})`
            })
        }
        arr.push({
            i: avg - 1,
            val: `rgba(${e_arr})`
        })
        return arr
    }
    drawLine (e) { // 画线
        const {
            cxt,
            line_c,
            num,
            line_w
        } = this.data
        const {
            now,
            next,
            color
        } = e
        // let color = color_next.val
        // if (color_next.i > 5) {
        //     color = '#ffffff'
        // }
        // let _color = cxt.createLinearGradient(now.x, now.y, next.x, next.y)
        // _color.addColorStop(0, color.s.val)
        // _color.addColorStop(1, color.e.val)
        // cxt.shadowOffsetX = 1; // 阴影Y轴偏移
        // cxt.shadowOffsetY = 1; // 阴影X轴偏移
        // cxt.shadowBlur = 1; // 模糊尺寸
        // cxt.shadowColor = 'rgba(255, 255, 255, 0.5)'; // 颜色
        // cxt.beginPath()
        // cxt.strokeStyle = color.val
        // cxt.fillStyle = color.val
        cxt.lineWidth = line_w
        cxt.lineCap = line_c
        cxt.moveTo(now.x, now.y) // 起始
        cxt.lineTo(next.x, next.y)
        cxt.stroke()
        // ((now, next) => {
            // setTimeout(() => {
            //     cxt.beginPath()
            //     cxt.strokeStyle = 'black'
            //     cxt.fillStyle = 'black'
            //     cxt.lineWidth = line_w
            //     cxt.lineCap = line_c
            //     cxt.moveTo(now.x, now.y) // 起始
            //     cxt.lineTo(next.x, next.y)
            //     cxt.stroke()
            // }, num * 300)
        // })(now, next)
    }
    animation ({ index = 0, now, _color = 'green-purple' } = {}) { // 动画
        const {
            centerX,
            centerY,
            avg,
            num,
            color,
            cxt,
            line_l
        } = this.data
        if (!now || !now.x) {
            now = {
                x: centerX - line_l * 2,
                y: centerY
            }
        }
        let next = this.getEndXY(now) // 取得next坐标
        let avg_arr = this.getAvg(now, next) // 取得次数
        // let avg_color = this.getColorAvg(_color)
        let i = 0
        
        let cxt_color = cxt.createLinearGradient(now.x, now.y, next.x, next.y)
        cxt.beginPath()
        // if ((index + 1) !== num) {
            cxt_color.addColorStop(0, color[_color].s)
            cxt_color.addColorStop(1, color[_color].e)
            cxt.strokeStyle = cxt_color
            cxt.fillStyle = cxt_color
        // } else {
        //     cxt.strokeStyle = 'black'
        //     cxt.fillStyle = 'black'
        // }
        
        let fn = () => {
            this.drawLine({
                now: now,
                next: avg_arr[i],
                // color: avg_color[i]
            })
            
            if (avg_arr[i].i !== avg - 1) {
                window.requestAnimationFrame(fn)
            } else {
                window.cancelAnimationFrame(fn)
                index++
                if (index !== num) {
                    this.animation({
                        index: index,
                        now: next,
                        // _color: color[_color].next
                    })
                }
                return
            }
            i++
        }
        window.requestAnimationFrame(fn)
        // setTimeout(() => {
        //     cxt.beginPath()
        //     cxt.strokeStyle = 'black'
        //     cxt.fillStyle = 'black'
        //     window.requestAnimationFrame(fn)
        // }, 500)
    }
}