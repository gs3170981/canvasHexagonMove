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
            sum: 100, // 一共的数量
            num: 60, // 单条线一共走的遍数
            avg: 12, // now到next的执行次数
            qc: 200, // 第一条线与第二条线显示的间隔速度
            num_now: 0, // 进行中的数量 - 不可配置
            line_l: 20, // 直线长度
            line_w: 1, // 直线粗细
            line_c: 'round', // 直线更圆润
            pos: { // 角度
                '60': {
                    sin: Math.sqrt(3) / 2,
                    cos: 0.5
                }
            },
            angle: '60', // 角度 - 跟pos相关，需要则自填写值
            coor: { // 方向 - 坐标系四域
                '1': e => ({ x: e.x + e.xl, y: e.y - e.yl, next: ['2', '1-4-x'] }),
                '2': e => ({ x: e.x - e.xl, y: e.y - e.yl, next: ['1', '2-3-x'] }),
                '3': e => ({ x: e.x - e.xl, y: e.y + e.yl, next: ['2-3-x', '4'] }),
                '4': e => ({ x: e.x + e.xl, y: e.y + e.yl, next: ['1-4-x', '3'] }),
                '1-4-x': e => ({ x: e.x + e.l, y: e.y, next: ['1', '4'] }),
                '2-3-x': e => ({ x: e.x - e.l, y: e.y, next: ['2', '3'] })
            },
            color: { // 目前只针对hsl色 - x变化
                val: 'hsl(x, 50%, 50%)',
                x: 1
            }
        }
        this.animation()
    }
    getEndXY ({x, y, next = ['1-4-x', '1-4-x']}) { // 求目标坐标
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
    drawRect (e) { // 点
        const {
            cxt,
            color,
        } = this.data
        const {
            next
        } = e
        cxt.shadowBlur = 5
        cxt.fillStyle = cxt.shadowColor = color.val.replace('x', color.x)
        cxt.fillRect(next.x, next.y, 2.5, 2.5)
    }
    drawLine ({ index = 0, now, _color } = {}) { // 成线
        let {
            centerX,
            centerY,
            avg,
            num,
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
        let i = 0

        let fn = () => {
            this.drawRect({ // 点
                next: avg_arr[i]
            })
            if (avg_arr[i].i !== avg - 1) {
                window.requestAnimationFrame(fn)
            } else {
                // 天女散花
                cxt.fillRect(now.x + -Math.random() * 20, now.y + -Math.random() * 20, 2, 2)
                cxt.fillRect(next.x + Math.random() * 20, next.y + Math.random() * 20, 2, 2)
                window.cancelAnimationFrame(fn)
                index++
                if (index !== num) {
                    this.drawLine({
                        index: index,
                        now: next,
                    })
                } else {
                    --this.data.num_now
                }
                return
            }
            i++
        }
        window.requestAnimationFrame(fn)
    }
    animation () { // 动画
        let {
            cxt,
            el,
            X,
            Y,
            qc,
            color,
        } = this.data

        let d = new Date().getTime()
        let fn = () => {
            let n_d = new Date().getTime()
            window.requestAnimationFrame(fn)
            ++color.x
            cxt.globalCompositeOperation = 'source-over' // 最上方的显示
            cxt.shadowBlur = 0
            cxt.fillStyle = 'rgba(0, 0, 0, .04)'
            cxt.fillRect(0, 0, X, Y)
            cxt.globalCompositeOperation = 'lighter' // 点相交更亮
            // console.log(new Date().getTime(), d)
            // new Date来控制展示的间隔
            if (this.data.num_now < this.data.sum && n_d - d > qc) {
                this.drawLine()
                d = n_d
                ++this.data.num_now
            }
        }
        fn()
    }
}