import { Action } from './action';

export class Branch {
    condition: () => boolean;

    action: Action;
}

export class BranchAction extends Action {
    branches: Array<Branch> = new Array<Branch>();
    
    run() { 
        const branch = this.branches.find(b => b.condition());
        if (branch == null) return Promise.reject('No suitable branch found.');
        return branch.action.run();
    }
}