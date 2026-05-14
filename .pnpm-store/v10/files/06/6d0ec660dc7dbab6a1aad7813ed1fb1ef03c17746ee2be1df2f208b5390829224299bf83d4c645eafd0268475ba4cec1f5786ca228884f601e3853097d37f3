import picomatch from 'picomatch';
import { partition } from './util/array.js';
import { initCounters, initIssues } from './util/issue-initializers.js';
import { relative } from './util/path.js';
const createMatcher = (patterns) => {
    const [negated, positive] = partition(patterns, p => p[0] === '!');
    if (positive.length === 0) {
        if (negated.length === 0)
            return () => false;
        return picomatch(negated, { dot: true });
    }
    return picomatch(positive, { dot: true, ignore: negated.map(p => p.slice(1)) });
};
export class IssueCollector {
    cwd;
    rules;
    workspaceFilter;
    issues = initIssues();
    counters = initCounters();
    referencedFiles = new Set();
    configurationHints = new Map();
    tagHints = new Set();
    ignorePatterns = new Set();
    ignoreFilesPatterns = new Set();
    isMatch;
    isFileMatch;
    issueMatchers = new Map();
    constructor(options) {
        this.cwd = options.cwd;
        this.rules = options.rules;
        this.workspaceFilter = () => true;
        this.isMatch = () => false;
        this.isFileMatch = () => false;
    }
    setWorkspaceFilter(workspaceFilePathFilter) {
        if (workspaceFilePathFilter)
            this.workspaceFilter = workspaceFilePathFilter;
    }
    addIgnorePatterns(patterns) {
        for (const pattern of patterns)
            this.ignorePatterns.add(pattern);
        this.isMatch = createMatcher(this.ignorePatterns);
    }
    addIgnoreFilesPatterns(patterns) {
        for (const pattern of patterns)
            this.ignoreFilesPatterns.add(pattern);
        this.isFileMatch = createMatcher(this.ignoreFilesPatterns);
    }
    setIgnoreIssues(ignoreIssues) {
        if (!ignoreIssues)
            return;
        const issueTypePatterns = new Map();
        for (const [pattern, issueTypes] of Object.entries(ignoreIssues)) {
            for (const issueType of issueTypes) {
                if (!issueTypePatterns.has(issueType)) {
                    issueTypePatterns.set(issueType, []);
                }
                issueTypePatterns.get(issueType)?.push(pattern);
            }
        }
        for (const [issueType, patterns] of issueTypePatterns) {
            this.issueMatchers.set(issueType, picomatch(patterns, { dot: true }));
        }
    }
    shouldIgnoreIssue(filePath, issueType) {
        const matcher = this.issueMatchers.get(issueType);
        if (!matcher)
            return false;
        return matcher(relative(this.cwd, filePath));
    }
    addFileCounts({ processed, unused }) {
        this.counters.processed += processed;
        this.counters.total += processed + unused;
    }
    addFilesIssues(filePaths) {
        for (const filePath of filePaths) {
            if (!this.workspaceFilter(filePath))
                continue;
            if (this.referencedFiles.has(filePath))
                continue;
            if (this.isMatch(filePath))
                continue;
            if (this.isFileMatch(filePath))
                continue;
            if (this.shouldIgnoreIssue(filePath, 'files'))
                continue;
            this.issues.files.add(filePath);
            const symbol = relative(this.cwd, filePath);
            this.issues._files[symbol] = [{ type: 'files', filePath, symbol, severity: this.rules.files }];
            this.counters.files++;
            this.counters.processed++;
        }
    }
    addIssue(issue) {
        if (!this.workspaceFilter(issue.filePath))
            return;
        if (this.isMatch(issue.filePath))
            return;
        if (this.shouldIgnoreIssue(issue.filePath, issue.type))
            return;
        if (this.rules[issue.type] === 'off')
            return;
        const key = relative(this.cwd, issue.filePath);
        issue.severity = this.rules[issue.type];
        const issues = this.issues[issue.type];
        issues[key] = issues[key] ?? {};
        const symbol = issue.parentSymbol ? `${issue.parentSymbol}.${issue.symbol}` : issue.symbol;
        if (!issues[key][symbol]) {
            issues[key][symbol] = issue;
            this.counters[issue.type]++;
        }
        return true;
    }
    addConfigurationHint(issue) {
        const key = `${issue.workspaceName}::${issue.type}::${issue.identifier}`;
        if (!this.configurationHints.has(key))
            this.configurationHints.set(key, issue);
    }
    addTagHint(issue) {
        this.tagHints.add(issue);
    }
    purge() {
        const unusedFiles = this.issues.files;
        this.issues = initIssues();
        this.counters = initCounters();
        return unusedFiles;
    }
    getIssues() {
        return {
            issues: this.issues,
            counters: this.counters,
            tagHints: this.tagHints,
            configurationHints: Array.from(this.configurationHints.values()),
        };
    }
    retainedIssues = [];
    retainIssue(issue) {
        this.retainedIssues.push(issue);
    }
    getRetainedIssues() {
        return this.retainedIssues;
    }
}
