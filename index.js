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
            num: 15, // 单条线一共走的遍数
            avg: 12, // now到next的执行次数
            line_l: 20, // 直线长度
            line_w: 1, // 直线粗细
            gc: 2, // 线条变黑的渐变程度
            gc_s: 500, // 线条渐变程度的渐变间隔ms
            gc_q: 1000, // 几ms后开始线条变黑
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
            color: ['30, 242, 40'] // 请填写rgb
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
    drawLine (e) { // 画线
        const {
            cxt,
            line_c,
            gc,
            gc_q,
            gc_s,
            line_w
        } = this.data
        const {
            now,
            next,
            _color,
            _gc,
        } = e
        
        
        const f = (obj) => {
            cxt.beginPath()
            cxt.moveTo(now.x, now.y)
            cxt.shadowBlur = 1 // 模糊尺寸
            if (obj) {
                // cxt.globalAlpha = 0.1
                // console.log(`rgba(${_color}, ${obj.val})`)
                // `rgba(0, 0, 0, ${obj.val})`
                cxt.shadowBlur = 5
                // cxt.fillStyle = cxt.shadowColor = `rgba(0, 0, 0, ${obj.val})` // 颜色
                cxt.shadowColor = `rgba(0, 0, 0, ${obj.val})` // 颜色
            } else {
                // cxt.shadowOffsetX = 1 // 阴影Y轴偏移
                // cxt.shadowOffsetY = 1 // 阴影X轴偏移
                // cxt.shadowColor = `rgba(255, 255, 255, 1)` // 颜色
                // cxt.shadowColor = cxt.fillStyle = `rgba(${_color})`
                cxt.shadowColor = `rgba(${_color})`

                // strokeStyle // 不画线 - 用阴影会更逼真
            }
            cxt.lineWidth = line_w
            cxt.lineCap = line_c
            cxt.lineTo(next.x, next.y)
            cxt.stroke()
        }
        if (_gc && _gc.is) {
            setTimeout(() => {
                f({
                    val: 1 / gc * (_gc.i + 1)
                })
            }, gc_q + gc_s * (_gc.i + 1))
            return
        }
        f()
        // setTimeout(() => { // 神奇的bug动画
        //     cxt.beginPath()
        //     cxt.moveTo(now.x, now.y)
        //     cxt.lineTo(next.x, next.y)
        //     cxt.globalAlpha = .1
        //     cxt.strokeStyle = cxt.fillStyle = 'red'
        //     cxt.stroke()
        // }, 1000)

    }
    drawLine1 (e) {
        const {
            cxt,
            line_c,
            gc_q,
            line_w
        } = this.data
        const {
            now,
            next,
            _color
        } = e
        setTimeout(() => {
            cxt.beginPath()
            cxt.moveTo(now.x, now.y)
            cxt.strokeStyle = cxt.fillStyle = 'black'
            cxt.lineWidth = line_w
            // cxt.globalAlpha = 0.1
            cxt.lineCap = line_c
            cxt.lineTo(next.x, next.y)
            cxt.stroke()
        }, gc_q)
    }
    animation ({ index = 0, now, _color } = {}) { // 动画
        const {
            centerX,
            centerY,
            avg,
            num,
            gc,
            color,
            line_l
        } = this.data
        if (!now || !now.x) {
            now = {
                x: centerX - line_l * 2,
                y: centerY
            }
        }
        if (!_color) {
            _color = color[parseInt(Math.random() * color.length)]
        }
        let next = this.getEndXY(now) // 取得next坐标
        let avg_arr = this.getAvg(now, next) // 取得次数
        let i = 0

        let fn = () => {
            this.drawLine({ // 正常绘线
                now: now,
                next: avg_arr[i],
                _color: _color
            })
            // this.drawLine1({ // 
            //     now: now,
            //     next: avg_arr[i],
            //     _color: _color
            // })
            for (let j = 0; j < gc; j++) {
                this.drawLine({
                    now: now,
                    next: avg_arr[i],
                    _color: _color,
                    _gc: {
                        is: true,
                        i: j
                    }
                })
            }
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