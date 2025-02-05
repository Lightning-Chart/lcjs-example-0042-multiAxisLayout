const lcjs = require('@lightningchart/lcjs')
const { lightningChart, Themes, AxisTickStrategies, emptyTick, AxisScrollStrategies, emptyLine, emptyFill } = lcjs

const lc = lightningChart({
            resourcesBaseUrl: new URL(document.head.baseURI).origin + new URL(document.head.baseURI).pathname + 'resources/',
        })
const chart = lc
    .ChartXY({
        defaultAxisY: { type: 'linear-highPrecision' },
        theme: Themes[new URLSearchParams(window.location.search).get('theme') || 'darkGold'] || undefined,
    })
    .setTitle('Multi-dimensional Axis Chart')
const timeAxis = chart
    .getDefaultAxisY()
    .setScrollStrategy(AxisScrollStrategies.progressive)
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

const LineSeries = (xAxis) => {
    xAxis.setDefaultInterval({ start: 0, end: 300 })
    return chart
        .addPointLineAreaSeries({ dataPattern: 'ProgressiveY', xAxis })
        .setAreaFillStyle(emptyFill)
        .setStrokeStyle((stroke) => stroke.setThickness(1))
        .setMaxSampleCount(100_000)
}
const series1 = LineSeries(axisCh1)
const series2 = LineSeries(axisCh2)
const series3 = LineSeries(axisCh3)
const series4 = LineSeries(axisCh4)
const series5 = LineSeries(axisCh5)
const series6 = LineSeries(axisCh6)

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
    const timeStep = 1000 / 60
    series1.appendSample({ x: rand1(), step: timeStep })
    series2.appendSample({ x: rand2(), step: timeStep })
    series3.appendSample({ x: rand3(), step: timeStep })
    series4.appendSample({ x: rand4(), step: timeStep })
    series5.appendSample({ x: rand5(), step: timeStep })
    series6.appendSample({ x: rand6(), step: timeStep })
}, 1000 / 60)
