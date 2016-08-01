var ActionBar = React.createClass({
    handlePrevious: function () {
        this.props.onPrevious();
    },
    handleNext: function () {
        this.props.onNext();
    },
    render: function () {
        return (
            <nav className="navbar navbar-default">
                <div className="container-fluid">
                    <div className="navbar-header">
                        <button type="button" className="navbar-toggle collapsed" data-toggle="collapse"
                                data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
                            <span className="sr-only">Toggle navigation</span>
                            <span className="icon-bar"></span>
                            <span className="icon-bar"></span>
                            <span className="icon-bar"></span>
                        </button>
                        <a className="navbar-brand" href="#">{this.props.filename}</a>
                    </div>
                    <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
                        <ul className="nav navbar-nav">
                            <li className="dropdown">
                                <a href="#" className="dropdown-toggle" data-toggle="dropdown" role="button"
                                   aria-haspopup="true" aria-expanded="false">Download <span
                                    className="caret"></span></a>
                                <ul className="dropdown-menu">
                                    <li><a href="#">As CSV</a></li>
                                    <li><a href="#">As JSON</a></li>
                                    <li><a href="#">As RDF</a></li>
                                </ul>
                            </li>
                        </ul>
                        <ul className="nav navbar-nav navbar-right">
                            <form className="navbar-form navbar-left">
                                <div className="form-group">
                                    <input type="text" className="form-control" placeholder="Search"/>
                                </div>
                            </form>
                        </ul>
                        <ul className="nav navbar-nav navbar-right">
                            <form className="navbar-form navbar-left">
                                <div className="btn-group" role="group">
                                    <button type="button" className="btn btn-default"
                                            onClick={this.handlePrevious}><span
                                        className="glyphicon glyphicon-triangle-left"></span> Previous
                                    </button>
                                    <button type="button" className="btn btn-default" onClick={this.handleNext}>
                                        Next <span
                                        className="glyphicon glyphicon-triangle-right"></span></button>
                                </div>
                            </form>
                        </ul>

                    </div>
                </div>
            </nav>
        );
    }
});


var TripleEntry = React.createClass({
    render: function () {
        return (
            <div className="col-md-4">{this.props.name}</div>
        );
    }
});

var Hint = React.createClass({
    highlight: function (s, q) {
        var j = 0;
        var highlighted = [];

        for (var i = 0; i < q.length; i++) {
            var qi = q.charAt(i);

            for (; j < s.length; j++) {
                var sj = s.charAt(j);
                if (qi.toLowerCase() === sj.toLowerCase()) {
                    highlighted.push("<b>" + sj + "</b>");
                    j++;
                    break;
                } else {
                    highlighted.push(sj);
                }
            }
        }

        while (j < s.length) {
            highlighted.push(s.charAt(j));
            j++;
        }
        return highlighted.join('');
    },
    rawMarkup: function () {
        var q = this.props.query || "";
        var text = this.highlight(this.props.text, q);
        return {__html: text};
    },

    click: function () {
        this.props.onSelected(this.props.text);
    },

    render: function () {
        var self = this;
        var hintClass = "col-sm-12 hint";
        return (
            <div
                dangerouslySetInnerHTML={this.rawMarkup()}
                className={hintClass}
                onClick={self.click}>
            </div>
        );
    }
});

var CompletionHints = React.createClass({
    getInitialState: function () {
        return {selected: ''};
    },
    handleHintSelected: function (hintText) {
        this.setState({selected: hintText});
        this.props.onHintSelected(hintText);
    },
    componentDidUpdate: function () {
        ReactDOM.findDOMNode(this).scrollTop = 0;
    },
    render: function () {
        var hints = [];
        var self = this;

        this.props.hints.forEach(function (hint) {
            hints.push(
                <Hint
                    onSelected={self.handleHintSelected}
                    text={hint}
                    query={self.props.query}
                />
            );
        });
        var style = {'visibility': this.props.visible ? 'visible' : 'hidden'};
        return (
            <div className="row hint-list" id="completionHints" style={style}>
                {hints}
            </div>
        );
    }
});

var TripleRelationEntry = React.createClass({
    getInitialState: function () {
        return {
            query: this.props.name,
            hintsVisible: false,
            hints: this.props.hints
        };
    },
    handleFocus: function () {
        this.setState({
            hintsVisible: true
        });
    },
    handleBlur: function () {
        this.setState({
            // hintsVisible: false
        });
    },
    filterHints: function (q) {
        var sortedHints = this.props.hints.sort(function (a, b) {
            var ai = a.toLowerCase().indexOf(q);
            var bi = b.toLowerCase().indexOf(q);
            if (ai >= 0 && bi >= 0) {
                return ai - bi;
            }
            if (ai < 0 && bi >= 0) {
                return 1;
            }
            if (bi < 0 && ai >= 0) {
                return -1;
            }
            return 0;
        });
        this.setState({
            hints: sortedHints
        });

    },

    componentDidMount: function () {
        var self = this;
        $.get("http://localhost:3000/relations", function (data) {
            self.setState({
                hints: data.split("\n")
            });
        });
    },

    handleTextChange: function (e) {
        this.setState({
            query: e.target.value
        });
        this.filterHints(e.target.value);
        this.props.onChange(e.target.value);
    },

    handleHintSelected: function (hintText) {
        this.setState({
            hintsVisible: false,
            query: hintText
        });
        this.props.onChange(hintText);
    },
    render: function () {
        return (
            <div className="col-md-4">
                <input type="text"
                       onFocus={this.handleFocus}
                       onBlur={this.handleBlur}
                       placeholder="Start typing"
                       value={this.state.query}
                       onChange={this.handleTextChange}/>
                <CompletionHints hints={this.state.hints}
                                 visible={this.state.hintsVisible}
                                 onHintSelected={this.handleHintSelected}
                                 query={this.state.query}
                />
            </div>
        );
    }
});


var Triple = React.createClass({
    getInitialState: function () {
        return {
            hints: ["hint 1", "hint 2", "hint 3", "hint 4"]
        };
    },
    componentDidMount: function () {
        var self = this;
        $.get("http://localhost:3000/relations", function (data) {
            self.setState({
                hints: data.split("\n")
            });
        });
    },
    handlePredicateChange: function (pred) {
        $.post('/updateTriple', {
            sub: this.props.data.sub,
            pre: pred,
            obj: this.props.data.obj,
            fileId: this.props.fileId,
            tripleId: this.props.data._id
        }).done(function (data) {
            // alert(JSON.stringify(data));
        });
        console.log("Predicate changed to: " + pred + " with id: " + this.props.data._id + " fileId: " + this.props.fileId);
    },
    render: function () {
        var data = this.props.data;

        var sub = data.sub;
        var pre = data.pre;
        var obj = data.obj;

        return (
            <div className="row sep">
                <TripleEntry name={sub}/>
                <TripleRelationEntry name={pre} hints={this.state.hints} onChange={this.handlePredicateChange}/>
                <TripleEntry name={obj}/>
            </div>
        );
    }
});


var TripleList = React.createClass({
    render: function () {
        var triples = this.props.triples;
        var self = this;
        var tripleViews = [];

        triples.forEach(function (t) {
            tripleViews.push(
                <Triple data={t} fileId={self.props.fileId}/>
            );
        });

        return (
            <div>{tripleViews}</div>
        );
    }
});

var ActionCenter = React.createClass({
    render: function () {
        var fileId = this.props.fileId;
        var ts = [
            {sub: 'Wheat', pre: 'tastes', obj: 'sweet'},
            {sub: 'Wheat', pre: 'tastes', obj: 'sweet'},
            {sub: 'Wheat', pre: 'tastes', obj: 'sweet'}
        ];
        return (
            <div className="col-md-9">
                <div className="row">
                    <ActionBar
                        filename={this.props.filename}
                        onNext={this.props.onNext}
                        onPrevious={this.props.onPrevious}/>
                    <TripleList triples={this.props.triples} fileId={this.props.fileId}/>
                </div>
            </div>
        );
    }
});


var FileItem = React.createClass({
    handleFileClick: function () {
        this.props.onFileSelected(this.props.data);
    },
    render: function () {
        var self = this;
        var file = self.props.data;

        return (
            <div className="file-item" onClick={this.handleFileClick}>
                {file.name}
            </div>
        );
    }
});

var FilterableFileList = React.createClass({
    handleFileSelected: function (file) {
        alert(JSON.stringify(file));
        this.props.onFileSelected(file);
    },
    render: function () {
        var fileList = this.props.files || [];
        var filterQuery = (this.props.query || "").toLowerCase();
        var listViews = [];
        var self = this;

        fileList.forEach(function (file) {
            if (file.name.toLowerCase().includes(filterQuery)) {
                listViews.push(
                    <FileItem data={file} onFileSelected={self.handleFileSelected}/>
                );
            }
        });

        return (
            <div className="row">
                {listViews}
            </div>
        );
    }
});

var FileList = React.createClass({
    getInitialState: function () {
        return {
            files: [],
            query: ''
        };
    },
    handleQuery: function (e) {
        this.setState({
            query: e.target.value
        });
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
            <div className="col-md-3 left-panel">
                <input type="text" className="search" placeholder="Search files by name" value={this.state.query}
                       onChange={this.handleQuery}/>
                <FilterableFileList
                    files={this.state.files}
                    query={this.state.query}
                    onFileSelected={this.props.onFileSelected}/>
            </div>
        );
    }
});


var FAB = React.createClass({
    handleClick: function (e) {
        window.open("/upload", "_blank");
    },
    render: function () {
        return (
            <div className="fab" onClick={this.handleClick}>
                <span className="glyphicon glyphicon-plus whitish fab-font"></span>
            </div>
        );
    }
});

var Dashboard = React.createClass({
    getInitialState: function () {
        return {
            fileId: '',
            currentPage: 0,
            triples: []
        };
    },
    handleFileSelected: function (file) {
        console.log("fileId: " + file._id);
        var self = this;
        this.setState({
            fileId: file._id,
            currentPage: 0,
            filename: file.name
        });

        $.get('/triples?fileId=' + file._id + '&page=' + 0, function (data) {
            console.log(data);
            if (data.code === 0) {
                self.setState({
                    currentPage: 1,
                    triples: data.msg
                });
            }
        });
    },
    handleNext: function () {
        var page = this.state.currentPage;
        var self = this;

        $.get('/triples?fileId=' + this.state.fileId + '&page=' + page, function (data) {
            if (data.code === 0) {
                self.setState({
                    currentPage: page + 1,
                    triples: data.msg
                });
            }
        });
    },
    handlePrevious: function () {
        var page = this.state.currentPage > 1 ? this.state.currentPage - 2 : 0;
        var self = this;

        $.get('/triples?fileId=' + this.state.fileId + '&page=' + page, function (data) {
            if (data.code === 0) {
                self.setState({
                    currentPage: page > 0 ? page - 1 : 1,
                    triples: data.msg
                });
            }
        });
    },
    render: function () {
        return (
            <div className="container-fluid">
                <div className="row">
                    <FileList onFileSelected={this.handleFileSelected}/>
                    <ActionCenter fileId={this.state.fileId}
                                  triples={this.state.triples}
                                  filename={this.state.filename}
                                  onNext={this.handleNext}
                                  onPrevious={this.handlePrevious}
                    />
                </div>
                <FAB/>
            </div>
        );
    }
});

ReactDOM.render(
    <Dashboard />
    ,
    document.getElementById('content')
);