export enum TestResultKind {
    Passed,
    Failed,
    Errored
}

export class TestResult {
    constructor(
        public readonly resultKind: TestResultKind,
        public readonly additionalInfo: string,
        public readonly startTime: Number,
        public readonly endTime: Number
    ) { }
}