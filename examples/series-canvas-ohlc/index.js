const data = fc.randomFinancial()(50);

const container = document.querySelector('d3fc-canvas');

const xScale = d3
    .scaleTime()
    .domain(fc.extentDate().accessors([d => d.date])(data));

const yScale = d3
    .scaleLinear()
    .domain(fc.extentLinear().accessors([d => d.high, d => d.low])(data));

const ctx = d3
    .select(container)
    .select('canvas')
    .node()
    .getContext('2d');

const series = fc
    .seriesCanvasOhlc()
    .xScale(xScale)
    .yScale(yScale)
    .context(ctx);

d3.select(container)
    .on('draw', () => {
        series(data);
    })
    .on('measure', () => {
        const { width, height } = event.detail;
        xScale.range([0, width]);
        yScale.range([height, 0]);
    });

container.requestRedraw();