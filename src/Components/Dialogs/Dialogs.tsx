import React from 'react';
import DialogMenu from './Menu/Menu';
import DialogContent from './Content/Content';
import DialogMedia from './Media/Media';
import DialogEdit from './Edit/Edit';
import DialogCreateFolder from './CreateFolder/CreateFolder';
import DialogCreateFile from './CreateFile/CreateFile';
import DialogRename from './Rename/Rename';
import DialogMove from './Move/Move';
import DialogCopy from './Copy/Copy';
import DialogUploadFile from './UploadFile/UploadFile';
import DialogUploadMetadata from './UploadMetadata/UploadMetadata';
import DialogAccessControl from './AccessControl/AccessControl';
import DialogAddNewVersion from './AddNewVersion/AddNewVersion';
import DialogExposeMetadata from './ExposeMetadata/ExposeMetadata'

// TODO: Consider moving the visibility logic here
function Dialogs() {
    return (
        <div className="Dialogs">
            <DialogMenu />
            <DialogContent />
            <DialogMedia />
            <DialogEdit />
            <DialogCreateFolder />
            <DialogCreateFile />
            <DialogMove />
            <DialogCopy />
            <DialogRename />
            <DialogUploadFile />
            <DialogUploadMetadata />
            <DialogAddNewVersion />
            <DialogExposeMetadata />
            <DialogAccessControl />
        </div>
    );
}

export default Dialogs;
