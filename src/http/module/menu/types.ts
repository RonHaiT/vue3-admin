export interface FormState {
    id: number | null | undefined
    parent: number | null | undefined
    name: string
    icon: string
    url: string
    type: number | null
    enable: number | null
}
export interface MenuObj {
    id?: number | null;
    name: string;
    icon: string;
    parent?: MenuObj | null;
    sort: number;
    url: string;
    path: string;
    enable: number;
    type: number;
    btn_permission: string | null;
    children?: MenuObj[] | null;
}
