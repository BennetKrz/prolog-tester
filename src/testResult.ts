export enum TestResultKind {
    Passed,
    Failed,
    Errored
}

export class TestResult {
    constructor(
        public readonly resultKind: TestResultKind,
        public readonly errorText: string[] | null,
        public readonly warningText: string[] | null,
        public readonly testSuitName: string,
        public readonly testName: string,
        public duration: number | null
    ) { }
}