import { zip } from 'd3-array';
import { includeMap, rebindAll } from 'd3fc-rebind';
import exponentialMovingAverage from './exponentialMovingAverage';
import undefinedInputAdapter from './undefinedInputAdapter';
import { identity } from './fn';

export default function() {

    let value = identity;

    const fastEMA = exponentialMovingAverage()
        .windowSize(12);
    const slowEMA = exponentialMovingAverage()
        .windowSize(29);
    const signalEMA = exponentialMovingAverage()
        .windowSize(9);
    const adaptedSignalEMA = undefinedInputAdapter()
        .algorithm(signalEMA);

    const macd = data => {

        fastEMA.value(value);
        slowEMA.value(value);

        const diff = zip(fastEMA(data), slowEMA(data))
            .map(d => (d[0] !== undefined && d[1] !== undefined) ? d[0] - d[1] : undefined);

        const averageDiff = adaptedSignalEMA(diff);

        return zip(diff, averageDiff)
            .map(d =>
                ({
                    macd: d[0],
                    signal: d[1],
                    divergence: d[0] !== undefined && d[1] !== undefined ? d[0] - d[1] : undefined
                })
            );
    };

    macd.value = (...args) => {
        if (!args.length) {
            return value;
        }
        value = args[0];
        return macd;
    };

    rebindAll(macd, fastEMA, includeMap({'windowSize': 'fastPeriod'}));
    rebindAll(macd, slowEMA, includeMap({'windowSize': 'slowPeriod'}));
    rebindAll(macd, signalEMA, includeMap({'windowSize': 'signalPeriod'}));

    return macd;
}