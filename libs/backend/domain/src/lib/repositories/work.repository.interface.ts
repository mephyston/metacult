import type { Work, WorkType } from '../entities/work.entity';

export interface WorkSearchFilters {
    type?: WorkType;
    tag?: string; // slug search
    search?: string; // title search
}

export interface IWorkRepository {
    findById(id: string): Promise<Work | null>;
    search(filters: WorkSearchFilters): Promise<Work[]>;
    create(work: Work): Promise<void>;
}
