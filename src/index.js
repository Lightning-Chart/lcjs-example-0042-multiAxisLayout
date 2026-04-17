const lcjs = require('@lightningchart/lcjs')
const { lightningChart, Themes, AxisTickStrategies, emptyTick, AxisScrollStrategies, emptyLine, DataSetXY, emptyFill } = lcjs

const lc = lightningChart({
            resourcesBaseUrl: new URL(document.head.baseURI).origin + new URL(document.head.baseURI).pathname + 'resources/',
        })
const chart = lc
    .ChartXY({
        legend: { visible: false },
        defaultAxisY: { type: 'linear-highPrecision' },
        theme: (() => {
    const t = Themes[new URLSearchParams(window.location.search).get('theme') || 'darkGold'] || undefined
    const smallView = Math.min(window.innerWidth, window.innerHeight) < 500
    if (!window.__lcjsDebugOverlay) {
        window.__lcjsDebugOverlay = document.createElement('div')
        window.__lcjsDebugOverlay.style.cssText = 'position:fixed;top:0;left:0;background:rgba(0,0,0,0.7);color:#fff;padding:4px 8px;z-index:99999;font:12px monospace;pointer-events:none'
        if (document.body) document.body.appendChild(window.__lcjsDebugOverlay)
        setInterval(() => {
            if (!window.__lcjsDebugOverlay.parentNode && document.body) document.body.appendChild(window.__lcjsDebugOverlay)
            window.__lcjsDebugOverlay.textContent = window.innerWidth + 'x' + window.innerHeight + ' dpr=' + window.devicePixelRatio + ' small=' + (Math.min(window.innerWidth, window.innerHeight) < 500)
        }, 500)
    }
    return t && smallView ? lcjs.scaleTheme(t, 0.5) : t
})(),
    })
    .setTitle('Multi-dimensional Axis Chart')
const timeAxis = chart
    .getDefaultAxisY()
    .setScrollStrategy(AxisScrollStrategies.scrolling)
    .setTickStrategy(AxisTickStrategies.DateTime, (ticks) =>
        ticks
            .setDateOrigin(new Date())
            .setGreatTickStyle(emptyTick)
            .setFormatting(undefined, { second: '2-digit', minute: '2-digit', hour: '2-digit' }, undefined)
            .setCursorFormatter((time) =>
                new Date(time).toLocaleTimeString(undefined, { second: '2-digit', minute: '2-digit', hour: '2-digit' }),
            ),
    )
    .setDefaultInterval((state) => ({
        start: state.dataMax ?? 0,
        end: (state.dataMax ?? 0) - 1 * 30 * 1000,
        stopAxisAfter: false,
    }))
    .setTitle('Time')

// Single data set with shared timestamps
const dataSet = new DataSetXY({
    schema: {
        y: {
            auto: {
                step: 1000 / 60,
            },
        },
        ...Object.fromEntries(Array.from({ length: 6 }, (_, i) => [`ch${i}`, { pattern: null }])),
    },
}).setMaxSampleCount(100_000)

chart.getDefaultAxisX().dispose()
const axisCh1 = chart.addAxisX({ opposite: true, iParallel: 0, iStack: 0 }).setTitle('Ch 1').setMargins(0, 5)
const axisCh2 = chart.addAxisX({ opposite: true, iParallel: 1, iStack: 0 }).setTitle('Ch 2').setMargins(0, 5)
const emptyAxis1 = chart.addAxisX({ opposite: true, iParallel: 2, iStack: 0 })
const emptyAxis2 = chart.addAxisX({ opposite: true, iParallel: 3, iStack: 0 })
const axisCh3 = chart.addAxisX({ opposite: true, iParallel: 0, iStack: 1 }).setTitle('Ch 3').setMargins(5, 0)
const axisCh4 = chart.addAxisX({ opposite: true, iParallel: 1, iStack: 1 }).setTitle('Ch 4').setMargins(5, 0)
const axisCh5 = chart.addAxisX({ opposite: true, iParallel: 2, iStack: 1 }).setTitle('Ch 5').setMargins(5, 0)
const axisCh6 = chart.addAxisX({ opposite: true, iParallel: 3, iStack: 1 }).setTitle('Ch 6').setMargins(5, 0)

chart.forEachAxisX((axisX) =>
    axisX.setTickStrategy(AxisTickStrategies.Numeric, (ticks) =>
        ticks
            .setMajorTickStyle((major) => major.setGridStrokeStyle(emptyLine))
            .setMinorTickStyle((minor) => minor.setGridStrokeStyle(emptyLine)),
    ),
)
// NOTE: Empty styled axes are accounted in axis layout (unlike completely hidden axes), which is utilized in this example.
emptyAxis1.setTickStrategy(AxisTickStrategies.Empty).setStrokeStyle(emptyLine).setPointerEvents(false)
emptyAxis2.setTickStrategy(AxisTickStrategies.Empty).setStrokeStyle(emptyLine).setPointerEvents(false)

const LineSeries = (xAxis, ch) => {
    xAxis.setDefaultInterval({ start: 0, end: 300 })
    return chart
        .addLineSeries({ xAxis })
        .setStrokeStyle((stroke) => stroke.setThickness(1))
        .setDataSet(dataSet, { y: 'y', x: `ch${ch}` })
}
const series1 = LineSeries(axisCh1, 0)
const series2 = LineSeries(axisCh2, 1)
const series3 = LineSeries(axisCh3, 2)
const series4 = LineSeries(axisCh4, 3)
const series5 = LineSeries(axisCh5, 4)
const series6 = LineSeries(axisCh6, 5)

const RandomTraceData = () => {
    let prev = 10 + Math.random() * 190
    return () => {
        const cur = prev + 1 * (Math.random() * 2 - 1)
        prev = cur
        return cur
    }
}
const rand1 = RandomTraceData()
const rand2 = RandomTraceData()
const rand3 = RandomTraceData()
const rand4 = RandomTraceData()
const rand5 = RandomTraceData()
const rand6 = RandomTraceData()

setInterval(() => {
    dataSet.appendSample({
        ch0: rand1(),
        ch1: rand2(),
        ch2: rand3(),
        ch3: rand4(),
        ch4: rand5(),
        ch5: rand6(),
    })
}, 1000 / 60)
