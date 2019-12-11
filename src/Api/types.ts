import { FileItem, FolderItem } from "./Item";
import { AclItem } from "./AclItem";

export interface FolderItems {
    files: FileItem[],
    folders: FolderItem[]
};

export interface AclList {
    acls: AclItem[]
};