import * as rdflib from 'rdflib';
import { AclItem } from './AclItem';
import { AclList } from './types';

const aclNamespace = "http://www.w3.org/ns/auth/acl#";
const pavOntology = "http://purl.org/pav/";
const dublinCoreOntology = "http://purl.org/dc/terms/";
const schemaOntology = "http://schema.org/"

export function parseACl(text: string, subj: string): AclItem[] {
    const graph = rdflib.graph();
    const acls: AclItem[] = [];

    rdflib.parse(text, graph, subj, "text/turtle", () => {
        let i = 0;
        graph.each(
            undefined, undefined, rdflib.sym(aclNamespace + 'Authorization'), rdflib.sym(subj)
        ).forEach(item => {

            const subject = item.value;
            const isGroup = checkIsGroup(graph, subject);
            const agentType = isGroup ? 'agentClass' : 'agent';
            const agent = getAgentName(graph, subject, agentType);
            const accessTo = getAccessToByGraph(graph, subject);
            const read = getMode(graph, subject, "Read");
            const write = getMode(graph, subject, "Write");
            const append = getMode(graph, subject, "Append");
            const control = getMode(graph, subject, "Control");
            acls.push(new AclItem(i++, agent, accessTo, read, write, append, control, isGroup));
        });
    });
    return acls;
};

export function integrateInfo(content: string,dataURL: string, ttlURL: string){
    const graph = rdflib.graph()
    const updater = new rdflib.UpdateManager(graph);
    const creatorTerm = "creator";
    const contentURL = "contentURL";
    const identifierTerm = "url";

    
    rdflib.parse(content, graph, ttlURL, "text/turtle", () => {
        let metadata = graph.any(undefined, rdflib.sym(dublinCoreOntology + creatorTerm), undefined, rdflib.sym(ttlURL));
        
        let newStatement = [];
        const wholeTtlNode = rdflib.sym(ttlURL);
        const metadataNode = rdflib.sym(metadata.value);
        newStatement.push(rdflib.st(metadataNode, rdflib.sym(schemaOntology + identifierTerm), ttlURL, wholeTtlNode));
        newStatement.push(rdflib.st(metadataNode, rdflib.sym(schemaOntology + contentURL), dataURL, wholeTtlNode));
        //call update to file
        updater.update([], newStatement, (uri, ok, message) => {
            if (!ok)
                console.log('err:' + message)
        })
    });
}

export function saveNewVersion(content: string, fileName: string, folderPath: string, newVersion: string, oldVersion: string): void {
    const graph = rdflib.graph()
    const updater = new rdflib.UpdateManager(graph);
    const versionTerm = "version";
    const creatorTerm = "creator";
    const hasEarlierVersionTerm = "hasEarlierVersion";
    const hasVersionTerm = "hasVersion";
    const identifierTerm = "url";
    const url = folderPath + "/" + fileName + ".ttl";

    rdflib.parse(content, graph, url, "text/turtle", () => {
        let metadata = graph.any(undefined, rdflib.sym(dublinCoreOntology + creatorTerm), undefined, rdflib.sym(url));
        //remove old version
        let oldStatement = graph.match(rdflib.sym(metadata.value), rdflib.sym(pavOntology + versionTerm), undefined, undefined);
        
        let newStatement = [];
        const wholeTtlNode = rdflib.sym(url);
        const metadataNode = rdflib.sym(metadata.value);
        const oldFileUrl = folderPath + "/"+ versionTerm +"/" + oldVersion + "/" + fileName + ".old";
        const newNodePrevVer = rdflib.sym(oldFileUrl);
        //update new version 
        newStatement.push(rdflib.st(metadataNode, rdflib.sym(pavOntology + versionTerm), newVersion, wholeTtlNode));
        //update hasEarlierVersion
        newStatement.push(rdflib.st(metadataNode, rdflib.sym(pavOntology + hasEarlierVersionTerm), newNodePrevVer, wholeTtlNode));
        //define new statement for previous version
        newStatement.push(rdflib.st(newNodePrevVer, rdflib.sym(pavOntology + hasVersionTerm), oldVersion, wholeTtlNode));
        newStatement.push(rdflib.st(newNodePrevVer, rdflib.sym(schemaOntology + identifierTerm), oldFileUrl, wholeTtlNode));

        //call update to file
        updater.update(oldStatement, newStatement, (uri, ok, message) => {
            if (!ok)
                console.log('err:' + message)
        })
    });
};

export function exposeMetadata(remoteRegistryUrl: string, content: string, ttlURL: string, newContent: {keyword:string, discipline:string}): void {
    const graph = rdflib.graph();
    const updater = new rdflib.UpdateManager(graph);

    const updatedSubj = rdflib.sym(ttlURL);
    const remotedGraph = rdflib.sym(remoteRegistryUrl);
    const keywordTerm = "keyword";
    const typeTerm = "type";
    const subjectTerm = "subject";
    const identifierTerm = "url";

    rdflib.parse(content, graph, remoteRegistryUrl, "text/turtle", () => {
        //old statements 
        let oldStatement = []
        oldStatement= graph.match(updatedSubj, rdflib.sym(schemaOntology + keywordTerm), undefined,  remotedGraph);
        //new statements
        let newStatement = [];
        newStatement.push(rdflib.st(updatedSubj, rdflib.sym(dublinCoreOntology + typeTerm), "Metadata", remotedGraph));
        newStatement.push(rdflib.st(updatedSubj, rdflib.sym(schemaOntology + keywordTerm), newContent.keyword, remotedGraph));
        newStatement.push(rdflib.st(updatedSubj, rdflib.sym(dublinCoreOntology + subjectTerm), newContent.discipline, remotedGraph));
        newStatement.push(rdflib.st(updatedSubj, rdflib.sym(schemaOntology + identifierTerm), updatedSubj, remotedGraph));

        updater.update(oldStatement, newStatement, (uri, ok, message) => {
            if (!ok)
                console.log('err:' + message)
        })
    });
}

export function getVersion(text: string, subj: string): string {
    const graph = rdflib.graph();
    let versionNum = "";
    rdflib.parse(text, graph, subj, "text/turtle", () => {
        let version = graph.match(
            undefined, rdflib.sym(pavOntology + "version"), undefined, rdflib.sym(subj)
        )
        if (version.length)
            versionNum = version[0]['object']['value']
    });
    return versionNum;
};

export function getContent(text: string, subj: string): {} {
    const graph = rdflib.graph();
    let content = { keyword: "", discipline: "" };
    rdflib.parse(text, graph, subj, "text/turtle", () => {
        let root = graph.any(
            undefined, rdflib.sym(schemaOntology + "keyword"), undefined, rdflib.sym(subj)
        );
        if (root && root.value) {
            let keyword = graph.any(
                rdflib.sym(root.value), rdflib.sym(schemaOntology + "keyword"), undefined, undefined
            )
            if (keyword) content.keyword = keyword.value;
            let discipline = graph.any(
                rdflib.sym(root.value), rdflib.sym(dublinCoreOntology + "subject"), undefined, undefined
            )
            if (discipline) content.discipline = discipline.value;
        }
    });
    return content;
};


/**
 * @param {string} text RDF text that can be passed to $rdf.parse()
 * @param {string} baseUrl the base url of the item
 * @returns {Promise<rdflib.IndexedFormula>} a rdfilb.graph() database instance with parsed RDF
 */
export async function aclText2graph(text: string, baseUrl: string): Promise<rdflib.IndexedFormula> {
    const contentType = 'text/turtle';
    const graph = rdflib.graph();

    return new Promise((resolve, reject) => {
        rdflib.parse(text, graph, baseUrl, contentType, () => { });
        resolve(graph);
    });
}


export function buildACLContent(aclList: AclItem[]): string {
    let arrAuth: String[] = [];
    aclList.forEach(item => {
        if (!item._agent)
            return;
        if (!item._read && !item._write && !item._control && !item._append)
            return;
        arrAuth.push(``);
        arrAuth.push(`<#authorization${item._key}> a  acl:Authorization;`);
        arrAuth.push(`acl:${item._isGroup ? 'agentClass' : 'agent'} <${item._agent}>;`);
        arrAuth.push(`acl:defaultForNew <./>;`);
        arrAuth.push(`acl:accessTo <${item._accessTo}>;`);
        let arrMode = [];
        if (item._read)
            arrMode.push('acl:Read');
        if (item._write)
            arrMode.push('acl:Write');
        if (item._append)
            arrMode.push('acl:Append');
        if (item._control)
            arrMode.push('acl:Control');
        arrAuth.push(`acl:mode  ${arrMode.join(", ")}.`);
    });
    return '@prefix  acl:  <http://www.w3.org/ns/auth/acl#> . \n' + arrAuth.join("\n");
}

export function getAclList(graph: rdflib.IndexedFormula, subj: string): AclList {
    const acls: AclItem[] = [];
    let i = 1;
    graph.each(
        undefined, undefined, rdflib.sym(aclNamespace + 'Authorization'), rdflib.sym(subj)
    ).forEach(item => {

        const subject = item.value;
        const isGroup = checkIsGroup(graph, subject);
        const agentType = isGroup ? 'agentClass' : 'agent';
        const agent = getAgentName(graph, subject, agentType);
        const accessTo = getAccessToByGraph(graph, subject);
        const read = getMode(graph, subject, "Read");
        const write = getMode(graph, subject, "Write");
        const append = getMode(graph, subject, "Append");
        const control = getMode(graph, subject, "Control");
        acls.push(new AclItem(i++, agent, accessTo, read, write, append, control, isGroup));
    });
    return { acls };
}

export function getAccessToByGraph(graph: rdflib.IndexedFormula, subjectName: string): string {
    const subjectNode = rdflib.sym(subjectName);
    const accessTo = graph.any(subjectNode, rdflib.sym(aclNamespace + 'accessTo'), undefined, undefined);
    return (accessTo && 'value' in accessTo) ? accessTo.value : "";
}

export function getAgentName(graph: rdflib.IndexedFormula, subjectName: string, agentType: string): string {
    const subjectNode = rdflib.sym(subjectName);
    const agent = graph.any(subjectNode, rdflib.sym(aclNamespace + agentType), undefined, undefined);
    return (agent && 'value' in agent) ? agent.value : "";
}

export function getMode(graph: rdflib.IndexedFormula, subjectName: string, modeName: string): boolean {
    const subjectNode = rdflib.sym(subjectName);
    const mode = graph.match(subjectNode, rdflib.sym(aclNamespace + 'mode'), rdflib.sym(aclNamespace + modeName), undefined);
    return (mode && mode.length == 1) ? true : false;
}

export function checkIsGroup(graph: rdflib.IndexedFormula, subjectName: string): boolean {
    const subjectNode = rdflib.sym(subjectName);
    const agentClass = graph.match(subjectNode, rdflib.sym(aclNamespace + 'agentClass'), undefined, undefined);
    return (agentClass && agentClass.length == 1) ? true : false;
}