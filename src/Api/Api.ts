import config from './../config';
import * as folderUtils from './folderUtils';
import * as aclUtils from './aclUtils';
import * as solidAuth from 'solid-auth-client';
import { FolderItems, AclList } from './types';
import { AclItem } from './AclItem';
import { promises } from 'fs';
const fileClient = require('solid-file-client');

export async function createACL(path: string, fileName: string, content: Blob | string): Promise<boolean> {
    const baseUrl = `${config.getHost()}${path}`;
    const filePath = baseUrl + "/" + fileName;

    return fileClient.createFile(filePath, content).then((fileCreated: any) => {
        fileClient.updateFile( filePath,content, "text/turtle").then((success: any) => {
            console.log(`Updated ${filePath}.`)
        }, (err: any) => console.log(err));
        return true;
    }, (err: any) => {
        console.log(err);
        return false;
    });
}
/**
 * Fetch API to get item
 */
export async function fetchFile(path: string, fileName?: string): Promise<Response> {
    const url = buildFileUrl(path, fileName);

    return solidAuth.fetch(url)
        .then(assertSuccessfulResponse);
};

/**
 * Fetch API to get item
 */
export async function fetchRemoteFile(url: string): Promise<Response> {
    return solidAuth.fetch(url)
        .then(assertSuccessfulResponse);
};


/**
 * Fetch API to get folder
 */
export async function fetchFolder(path: string, folderName?: string): Promise<Response> {
    const url = buildFolderUrl(path, folderName);
    return solidAuth.fetch(url, { headers: { "Accept": "text/turtle" } })
        .then(assertSuccessfulResponse);
};


/**
 * Fetch API to retrieve object containing a files and folders array
 */
export async function readFolder(path: string, folderName?: string): Promise<FolderItems> {
    const url = buildFolderUrl(path, folderName);

    const response = await fetchFolder(path, folderName);
    const folderRDF = await response.text();
    const graph = await folderUtils.text2graph(folderRDF, url, 'text/turtle');
    const folderItems = folderUtils.getFolderItems(graph, url);

    return folderItems;
}

/**
 * Fetch API to retrieve acl triple
 */
export async function readAcl(path: string, aclFileName?: string): Promise<AclList> {
    const url = buildFileUrl(path, aclFileName);

    const response = await fetchFile(path, aclFileName);
    const responseRDF = await response.text();
    const graph = await aclUtils.aclText2graph(responseRDF, url);
    const aclList = aclUtils.getAclList(graph, url);

    return aclList;
}

export async function updateVersion(path: string, fileName: string, newVersion: string, oldVersion: string) {
    const folderPath = buildFileUrl(path, "");
    const response = await fetchFile(path, fileName + ".ttl");
    const responseRDF = await response.text();
    aclUtils.saveNewVersion(responseRDF, fileName, folderPath, newVersion, oldVersion);
}

export async function integrateInfo(path: string, fileName: string, metadataFileName: string){
    const dataURL = buildFileUrl(path, fileName);
    const ttlURL = buildFileUrl(path, metadataFileName);
    const response = await fetchFile(path, metadataFileName);
    const responseRDF = await response.text();
    aclUtils.integrateInfo(responseRDF, dataURL, ttlURL);
}

export async function exposeMetadata(path: string, fileName: string, newContent: { keyword: string, discipline: string }) {
    const ttlURL = buildFileUrl("/" + path, fileName);
    const remoteRegistryURL = "https://davu.solid.community/public/registry/index.ttl";
    const response = await fetchRemoteFile(remoteRegistryURL);
    const registryRDF = await response.text();
    aclUtils.exposeMetadata(remoteRegistryURL , registryRDF, ttlURL, newContent);
}



/**
 * Fetch API to move items
 */
export async function moveItems(path: string, destination: string, itemNames: string[]): Promise<Response> {
    await copyItems(path, destination, itemNames);
    return removeItems(path, itemNames);
};


/**
 * Fetch API to rename a file
 */
export async function renameFile(path: string, oldName: string, newName: string): Promise<Response> {
    await copyFile(path, oldName, path, newName);
    return removeItem(path, oldName);
};


/**
 * Fetch API to rename a folder
 */
export async function renameFolder(path: string, oldFolderName: string, newFolderName: string): Promise<Response> {
    await copyFolder(path, oldFolderName, path, newFolderName);
    return removeFolderRecursively(path, oldFolderName);
};


/**
 * Fetch API to copy files
 */
export async function copyItems(path: string, destination: string, itemNames: string[]): Promise<Response> {
    let { files, folders } = await readFolder(path);

    files = files.filter(({ name }) => itemNames.includes(name));
    folders = folders.filter(({ name }) => itemNames.includes(name));

    const promises = [
        ...files.map(({ name }) => copyFile(path, name, destination, name)),
        ...folders.map(({ name }) => copyFolder(path, name, destination, name))
    ];

    await Promise.all(promises);
    return new Response();
};


/**
 * Fetch API to copy a file
 */
export async function copyFile(originPath: string, originName: string, destinationPath: string, destinationName: string): Promise<Response> {
    const fileResponse = await fetchFile(originPath, originName);
    const content = await fileResponse.blob();

    return createFile(destinationPath, destinationName, content);
}


/**
 * Fetch API to copy a folder recursively
 */
export async function copyFolder(originPath: string, originName: string, destinationPath: string, destinationName: string): Promise<Response> {
    // TODO: Combine these two promises for better performance
    await createFolder(destinationPath, destinationName);
    const { files, folders } = await readFolder(originPath, originName);

    const promises = [
        ...files.map(({ name }) => copyFile(`${originPath}/${originName}`, name, `${destinationPath}/${destinationName}`, name)),
        ...folders.map(({ name }) => copyFolder(`${originPath}/${originName}`, name, `${destinationPath}/${destinationName}`, name))
    ];

    await Promise.all(promises);
    return new Response();
}


/**
 * Fetch API to upload files
 */
export async function upload(path: string, fileList: FileList): Promise<Response> {
    const promises = Array.from(fileList).map(file => updateFile(path, file.name, file));
    await Promise.all(promises);
    return new Response();
};


/**
 * Fetch API to create a folder
 */
export async function createFolder(path: string, folderName: string): Promise<Response> {
    if (await folderExists(path, folderName))
        return new Response();

    return createItem(path, folderName, new Blob(), '<http://www.w3.org/ns/ldp#BasicContainer>; rel="type"');
}


/**
 * Fetch API to replace or create a new file
 */
export async function updateFile(path: string, fileName: string, content: Blob | string): Promise<Response> {
    await removeItem(path, fileName);
    return createFile(path, fileName, content);
}

/**
 * Fetch API to replace or create a new ACL file
 */
export async function updateACLFile(path: string, fileName: string, aclItem: AclItem[]): Promise<boolean> {
    await removeItem(path, fileName);
    console.log("Remove ACL file");
    const content = await aclUtils.buildACLContent(aclItem);
    return createACL(path, fileName, content);
}


/**
 * Fetch API to create a new file
 */
export async function createFile(path: string, fileName: string, content: Blob | string): Promise<Response> {
    return createItem(path, fileName, content, '<http://www.w3.org/ns/ldp#Resource>; rel="type"');
}


export function getBasedUrl(path: string) {
    return `${config.getHost()}${path}`;
}

async function createItem(path: string, itemName: string, content: Blob | string, link: string): Promise<Response> {
    console.log(itemName);
    const baseUrl = `${config.getHost()}${path}`;
    const request = {
        method: 'POST',
        headers: {
            link,
            slug: itemName,
            'Content-Type': <any>undefined // TODO: This hack can be removed if this issue is fixed: https://github.com/solid/node-solid-server/issues/1165
        },
        body: content
    };
    return solidAuth.fetch(baseUrl, request)
        .then(assertSuccessfulResponse);
}

/**
 * Fetch API to remove multiple items
 */
export async function removeItems(path: string, itemNames: string[]): Promise<Response> {
    return Promise.all(itemNames.map(itemName => removeItem(path, itemName)))
        .then(() => new Response());
};


/**
 * Fetch API to remove one item
 */
export async function removeItem(path: string, itemName: string): Promise<Response> {
    const url = buildFileUrl(path, itemName);

    const response = await solidAuth.fetch(url, { method: 'DELETE' });
    if (response.status === 409 || response.status === 301) {
        // Solid pod returns 409 if the item is a folder and is not empty
        // Solid pod returns 301 if is attempted to read a folder url without '/' at the end (from buildFileUrl)
        return removeFolderRecursively(path, itemName);
    }
    else if (response.status === 404) {
        // Don't throw if the item didn't exist
        return response;
    }
    else {
        assertSuccessfulResponse(response);
        return response;
    }
}


/**
 * Fetch API to remove contents and folder itself recursively
 */
export async function removeFolderRecursively(path: string, folderName: string): Promise<Response> {
    await removeFolderContents(path, folderName);
    return removeItem(path, folderName);
}


/**
 * Fetch API to remove contents of one folder recursively
 */
export async function removeFolderContents(path: string, folderName: string): Promise<Response> {
    const folderPath = `${path}/${folderName}`;

    const { files, folders } = await readFolder(path, folderName);
    const promises = [
        ...files.map(({ name }) => removeItem(folderPath, name)),
        ...folders.map(({ name }) => removeFolderRecursively(folderPath, name))
    ];
    await Promise.all(promises);
    return new Response();
}


/**
 * Fetch API to check if a folder exists
 */
export async function folderExists(path: string, folderName: string): Promise<boolean> {
    try {
        await fetchFolder(path, folderName);
        return true;
    }
    catch (error) {
        if (error instanceof Response && error.status === 404)
            return false;

        throw error;
    }
}


/**
 * Build up an url from a path relative to the storage location and a folder name
 */
function buildFolderUrl(path: string, folderName?: string): string {
    return buildFileUrl(path, folderName) + '/';
}


/**
 * Build up an url from a path relative to the storage location and a fileName
 */
function buildFileUrl(path: string, fileName?: string): string {
    let url = `${config.getHost()}${path}/${fileName || ''}`;
    while (url.slice(-1) === '/')
        url = url.slice(0, -1);

    return url;
}


/**
 * Throw response if fetch response was unsuccessful
 * @param {Response} response
 * @returns {Response}
 */
function assertSuccessfulResponse(response: Response): Response {
    if (!response.ok)
        throw response;
    return response;
}
