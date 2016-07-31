var UploadBar = React.createClass({
    handleFileUpload: function (e) {
        console.log('Beginning to upload');
        var filename = this.refs.filename.value.trim();
        if (filename === null || filename === '') {
            this.refs.filename.value = e.target.files[0].name;
            filename = e.target.files[0].name;
        }

        // Create the Form data object
        var data = new FormData();
        data.append('payload', e.target.files[0]);
        data.append('filename', filename);

        // Make the HTTP POST request
        $.ajax({
            type: 'POST',
            url: '/upload',
            data: data,
            cache: false,
            contentType: false,
            processData: false,
            success: function (res) {
                alert(JSON.stringify(res));
                location.reload();
            }
        });
    },
    render: function () {
        return (
            <div className="row">
                <div className="col-md-8 col-md-offset-2">
                    <h3>Upload a new file</h3>
                    <table>
                        <tr>
                            <td><input type="text" name="filename" placeholder="File name" ref="filename"/></td>
                            <td><input type="file" name="payload" onChange={this.handleFileUpload}/></td>
                        </tr>
                    </table>
                </div>
            </div>
        );
    }
});

var FileItem = React.createClass({
    getInitialState: function () {
        return {
            name: this.props.data.name
        };
    },
    enableSaveButton: function () {
        var saveButton = this.refs.saveButton;
        $(saveButton).prop('disabled', false);
        $(this.refs.name).prop('class', 'enabled');

    },
    disableSaveButton: function () {
        var saveButton = this.refs.saveButton;
        $(saveButton).prop('disabled', true);
        $(this.refs.name).prop('class', 'disabled');
    },
    handleChange: function (e) {
        var newVal = e.target.value;
        if (newVal !== this.props.data.name) {
            this.enableSaveButton();
        } else {
            this.disableSaveButton();
        }
        this.setState({
            name: e.target.value
        });
    },
    handleDownload: function () {
        window.open('http://localhost:3000/download?id=' + this.props.data._id, '_blank');
    },
    handleSave: function () {
        var newName = this.state.name;
        var id = this.props.data._id;
        var self = this;
        $.post('/updateName', {name: newName, id: id})
            .done(function (data) {
                if (data) {
                    self.disableSaveButton();
                }
            });
    },
    handleDelete: function () {
        var res = prompt("You are about to delete the following file:\n\"" + this.state.name + "\"\nPlease type \"yes\" (without quotes) to confirm");
        if (res === 'yes') {
            console.log("Deleting file...");
            var fileId = this.props.data._id;
            $.get('/delete?id=' + fileId, function (data) {
                if (data) {
                    console.log(data);
                    location.reload();
                }
            });
        }
    },
    componentDidMount: function () {
        this.disableSaveButton();
    },
    render: function () {
        var file = this.props.data;
        return (
            <tr>
                <td><input type="text" value={this.state.name} onChange={this.handleChange} ref="name"/></td>
                <td><input type="button" value="Download" onClick={this.handleDownload}/></td>
                <td><input type="button" value="Delete" onClick={this.handleDelete}/></td>
                <td><input type="button" value="Save Changes" ref="saveButton" onClick={this.handleSave}/></td>
            </tr>
        );
    }
});

var FilterableFileList = React.createClass({
    render: function () {
        var fileList = this.props.files;
        var fileViews = [];
        fileList.forEach(function (file) {
            fileViews.push(
                <FileItem data={file}/>
            );
        });
        return (
            <div className="col-md-8 col-md-offset-2">
                <h3>List of uploaded files </h3>
                <table>
                    <th>
                        <td>Filename</td>
                    </th>
                    <th>
                        <td>Actions</td>
                    </th>
                    {fileViews}
                </table>
            </div>
        );
    }
});

var FileList = React.createClass({
    getInitialState: function () {
        return {files: []};
    },
    componentDidMount: function () {
        var self = this;
        $.get('/files', function (data) {
            self.setState({
                files: data
            });
        });
    },
    render: function () {
        return (
            <div className="row">

                <FilterableFileList files={this.state.files}/>
            </div>
        );
    }
});

var Dashboard = React.createClass({
    render: function () {
        return (
            <div className="container-fluid">
                <h1>File Manager</h1>
                <hr/>
                <UploadBar/>
                <hr/>
                <FileList />
            </div>
        );
    }
});

ReactDOM.render(
    <Dashboard />
    ,
    document.getElementById('content')
);