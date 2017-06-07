export type Variable = { name: string, value: any };

export type PersistenceData = {
    currentState: string;
    variables: Variable[];
}