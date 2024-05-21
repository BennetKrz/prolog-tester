export enum TestResultKind {
    Passed,
    Failed,
    Errored
}

export class TestResult {
    constructor(
        public readonly resultKind: TestResultKind,
        public readonly errorText: string,
        public readonly warningText: string,
        public readonly testSuitName: string,
        public readonly testName: string,
        public readonly startTime: Number,
        public readonly endTime: Number
    ) { }
}