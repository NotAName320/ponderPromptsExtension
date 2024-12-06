export enum QuestionTypes {
    TEXT_BOX, // only this one works for now
    MULTIPLE_CHOICE,
    MULTIPLE_SELECT
}

export const questions = [
    {
        questionId: "sample",
        questionText: "This is a sample question",
        questionType: QuestionTypes.TEXT_BOX
    },
    {
        questionId: "sample2",
        questionText: "This is a second sample question",
        questionType: QuestionTypes.TEXT_BOX
    }
]