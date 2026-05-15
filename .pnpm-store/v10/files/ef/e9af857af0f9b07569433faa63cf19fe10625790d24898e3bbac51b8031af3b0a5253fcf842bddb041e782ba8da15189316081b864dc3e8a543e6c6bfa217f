import os from 'node:os';
import { PerformanceObserver, performance } from 'node:perf_hooks';
import { memoryUsage } from 'node:process';
import { parseArgs } from 'node:util';
import { getStats } from './math.js';
import { Table } from './table.js';
const { values } = parseArgs({
    strict: false,
    options: {
        performance: { type: 'boolean' },
        'performance-fn': { type: 'string', multiple: true },
        memory: { type: 'boolean' },
        'memory-realtime': { type: 'boolean' },
    },
});
const timerifyOnlyFnName = values['performance-fn'];
const isMemoryRealtime = !!values['memory-realtime'];
const isTimerifyFunctions = !!values.performance || !!timerifyOnlyFnName;
const isMemoryUsageEnabled = !!values.memory || isMemoryRealtime;
export const timerify = (fn, name = fn.name) => {
    if (!isTimerifyFunctions)
        return fn;
    if (timerifyOnlyFnName && !timerifyOnlyFnName.includes(name))
        return fn;
    return performance.timerify(Object.defineProperty(fn, 'name', { get: () => name }));
};
const getMemInfo = () => Object.assign({ freemem: os.freemem() }, memoryUsage());
const twoFixed = (value) => (typeof value === 'number' ? value.toFixed(2) : value);
const inMB = (bytes) => bytes / 1024 / 1024;
const keys = ['heapUsed', 'heapTotal', 'freemem'];
const logHead = () => console.log(keys.map(key => key.padStart(10)).join('  '));
const log = (memInfo) => console.log(keys.map(key => twoFixed(inMB(memInfo[key])).padStart(10)).join('  '));
class Performance {
    isEnabled;
    isTimerifyFunctions;
    isMemoryUsageEnabled;
    startTime = 0;
    endTime = 0;
    perfEntries = [];
    memEntries = [];
    perfId;
    memId;
    fnObserver;
    memObserver;
    memoryUsageStart;
    freeMemoryStart;
    constructor({ isTimerifyFunctions = false, isMemoryUsageEnabled = false }) {
        this.isEnabled = isTimerifyFunctions || isMemoryUsageEnabled;
        this.isTimerifyFunctions = isTimerifyFunctions;
        this.isMemoryUsageEnabled = isMemoryUsageEnabled;
        this.startTime = performance.now();
        const instanceId = Math.floor(performance.now() * 100);
        this.perfId = `perf-${instanceId}`;
        this.memId = `mem-${instanceId}`;
        if (isTimerifyFunctions) {
            this.fnObserver = new PerformanceObserver(items => {
                for (const entry of items.getEntries()) {
                    this.perfEntries.push(entry);
                }
            });
            this.fnObserver.observe({ type: 'function' });
        }
        if (isMemoryUsageEnabled) {
            this.memObserver = new PerformanceObserver(items => {
                for (const entry of items.getEntries()) {
                    this.memEntries.push(entry);
                }
            });
            this.memObserver.observe({ type: 'mark' });
            if (isMemoryRealtime)
                logHead();
            this.addMemoryMark(0);
        }
    }
    setMark(name) {
        const id = `${this.perfId}:${name}`;
        performance.mark(`${id}:start`);
    }
    clearMark(name) {
        const id = `${this.perfId}:${name}`;
        performance.mark(`${id}:end`);
        performance.measure(id, `${id}:start`, `${id}:end`);
        performance.clearMarks(`${id}:start`);
        performance.clearMarks(`${id}:end`);
    }
    async flush() {
        this.setMark('_flush');
        await new Promise(resolve => setTimeout(resolve, 1));
        this.clearMark('_flush');
    }
    getPerfEntriesByName() {
        return this.perfEntries.reduce((entries, entry) => {
            const name = entry.name.replace(`${this.perfId}:`, '');
            entries[name] = entries[name] ?? [];
            entries[name].push(entry.duration);
            return entries;
        }, {});
    }
    getTimerifiedFunctionsTable() {
        const entriesByName = this.getPerfEntriesByName();
        const table = new Table({ header: true });
        for (const [name, values] of Object.entries(entriesByName)) {
            const stats = getStats(values);
            table.row();
            table.cell('Name', name);
            table.cell('size', values.length);
            table.cell('min', stats.min, twoFixed);
            table.cell('max', stats.max, twoFixed);
            table.cell('median', stats.median, twoFixed);
            table.cell('sum', stats.sum, twoFixed);
        }
        table.sort('sum|desc');
        return table.toString();
    }
    addMemoryMark(index) {
        if (!this.isMemoryUsageEnabled)
            return;
        const id = `${this.memId}:${index}`;
        const detail = getMemInfo();
        performance.mark(id, { detail });
        if (isMemoryRealtime && detail)
            log(detail);
    }
    getMemoryUsageTable() {
        const table = new Table({ header: true });
        let i = 0;
        for (const entry of this.memEntries) {
            if (!entry.detail)
                continue;
            table.row();
            table.cell('#', String(i++));
            table.cell('heapUsed', inMB(entry.detail.heapUsed), twoFixed);
            table.cell('heapTotal', inMB(entry.detail.heapTotal), twoFixed);
            table.cell('freemem', inMB(entry.detail.freemem), twoFixed);
        }
        return table.toString();
    }
    getCurrentDurationInMs() {
        return performance.now() - this.startTime;
    }
    getMemHeapUsage() {
        return (memoryUsage().heapUsed ?? 0) - (this.memoryUsageStart?.heapUsed ?? 0);
    }
    getCurrentMemUsageInMb() {
        return twoFixed(inMB(this.getMemHeapUsage()));
    }
    async finalize() {
        if (!this.isEnabled)
            return;
        await this.flush();
    }
    reset() {
        this.perfEntries = [];
        this.fnObserver?.disconnect();
        this.memObserver?.disconnect();
    }
}
export const perfObserver = new Performance({ isTimerifyFunctions, isMemoryUsageEnabled });
